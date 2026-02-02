"""
User Management Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash
from app.models import User, Biometric, ActivityLog
from app.schemas import (
    UserResponse, UserUpdate, UserChangePIN, UserRegisterBiometric, SuccessResponse
)

router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(db: AsyncSession = Depends(get_db)):
    """Get current user profile."""
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "User not found"}
        )
    
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        created_at=user.created_at,
        updated_at=user.updated_at
    )


@router.put("/profile", response_model=SuccessResponse)
async def update_user_profile(
    request: UserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update user profile."""
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "User not found"}
        )
    
    if request.name:
        user.name = request.name
    if request.email:
        user.email = request.email
    if request.preferences:
        # Store preferences in a separate table or as JSON
        pass
    
    user.updated_at = datetime.utcnow()
    await db.commit()
    
    return SuccessResponse(
        data={
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "updatedAt": user.updated_at
        }
    )


@router.post("/change-pin", response_model=SuccessResponse)
async def change_pin(
    request: UserChangePIN,
    db: AsyncSession = Depends(get_db)
):
    """Change user PIN."""
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "User not found"}
        )
    
    # Verify current PIN
    if not verify_password(request.current_pin, user.pin_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": "INVALID_PIN", "message": "Invalid current PIN"}
        )
    
    # Update PIN
    user.pin_hash = get_password_hash(request.new_pin)
    user.updated_at = datetime.utcnow()
    
    # Log activity
    log = ActivityLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        event="PIN Changed",
        log_type="info",
        category="user",
        details={"userId": user.id}
    )
    db.add(log)
    
    await db.commit()
    
    return SuccessResponse(message="PIN changed successfully")


@router.post("/biometric/register", response_model=SuccessResponse)
async def register_biometric(
    request: UserRegisterBiometric,
    db: AsyncSession = Depends(get_db)
):
    """Register biometric data."""
    result = await db.execute(select(User).limit(1))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "User not found"}
        )
    
    # Check if biometric already exists
    result = await db.execute(
        select(Biometric).where(
            Biometric.user_id == user.id,
            Biometric.biometric_type == request.biometric_type
        )
    )
    existing = result.scalar_one_or_none()
    
    if existing:
        existing.biometric_data = request.biometric_data
        existing.is_active = True
        existing.updated_at = datetime.utcnow()
    else:
        biometric = Biometric(
            id=str(uuid.uuid4()),
            user_id=user.id,
            biometric_type=request.biometric_type,
            biometric_data=request.biometric_data,
            is_active=True
        )
        db.add(biometric)
    
    # Log activity
    log = ActivityLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        event=f"Biometric Registered ({request.biometric_type})",
        log_type="info",
        category="user",
        details={"userId": user.id, "type": request.biometric_type}
    )
    db.add(log)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "biometricId": biometric.id if not existing else existing.id,
            "biometricType": request.biometric_type,
            "registeredAt": datetime.utcnow()
        }
    )
