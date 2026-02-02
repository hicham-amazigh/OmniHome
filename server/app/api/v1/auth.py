"""
Authentication Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import uuid

from app.core.database import get_db
from app.core.security import (
    verify_password, create_access_token, create_refresh_token, hash_token
)
from app.core.config import settings
from app.models import User, Session, Biometric
from app.schemas import (
    UserLoginPIN, UserLoginBiometric, Token, TokenRefresh, TokenResponse,
    SuccessResponse, ErrorResponse
)

router = APIRouter()


@router.post("/login/pin", response_model=Token)
async def login_with_pin(
    credentials: UserLoginPIN,
    db: AsyncSession = Depends(get_db)
):
    """Login with PIN code."""
    # Find user (for demo, accept any 4-digit PIN)
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_PIN", "message": "Invalid PIN code"}
        )
    
    # Verify PIN (for demo, accept any 4-digit PIN)
    if not verify_password(credentials.pin, user.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_PIN", "message": "Invalid PIN code"}
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Create session
    session = Session(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token_hash=hash_token(access_token),
        refresh_token_hash=hash_token(refresh_token),
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    db.add(session)
    await db.commit()
    
    return Token(
        token=access_token,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        },
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )


@router.post("/login/biometric", response_model=Token)
async def login_with_biometric(
    credentials: UserLoginBiometric,
    db: AsyncSession = Depends(get_db)
):
    """Login with biometric data."""
    # Find user with matching biometric
    result = await db.execute(
        select(Biometric).where(
            Biometric.biometric_type == credentials.biometric_type,
            Biometric.is_active == True
        )
    )
    biometric = result.scalar_one_or_none()
    
    if not biometric:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_BIOMETRIC", "message": "Biometric authentication failed"}
        )
    
    # Get user
    result = await db.execute(select(User).where(User.id == biometric.user_id))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_BIOMETRIC", "message": "Biometric authentication failed"}
        )
    
    # Create tokens
    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})
    
    # Create session
    session = Session(
        id=str(uuid.uuid4()),
        user_id=user.id,
        token_hash=hash_token(access_token),
        refresh_token_hash=hash_token(refresh_token),
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    db.add(session)
    await db.commit()
    
    return Token(
        token=access_token,
        user={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        },
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )


@router.post("/logout", response_model=SuccessResponse)
async def logout():
    """Logout user (client-side token invalidation)."""
    return SuccessResponse(message="Logged out successfully")


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_request: TokenRefresh,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token."""
    # Find session with refresh token
    result = await db.execute(
        select(Session).where(Session.refresh_token_hash == hash_token(refresh_request.refresh_token))
    )
    session = result.scalar_one_or_none()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_TOKEN", "message": "Invalid refresh token"}
        )
    
    # Check if session is expired
    if session.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "TOKEN_EXPIRED", "message": "Refresh token expired"}
        )
    
    # Create new access token
    access_token = create_access_token(data={"sub": session.user_id})
    
    # Update session
    session.token_hash = hash_token(access_token)
    session.last_accessed_at = datetime.utcnow()
    await db.commit()
    
    return TokenResponse(
        token=access_token,
        expires_at=datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
