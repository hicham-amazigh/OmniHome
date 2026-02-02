"""
User Schemas
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class UserLoginPIN(BaseModel):
    """PIN login request."""
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit PIN code")


class UserLoginBiometric(BaseModel):
    """Biometric login request."""
    biometric_data: str = Field(..., description="Base64 encoded biometric data")
    biometric_type: str = Field(..., description="Biometric type: faceid or fingerprint")


class UserCreate(BaseModel):
    """User creation request."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    pin: str = Field(..., min_length=4, max_length=4, description="4-digit PIN code")
    role: Optional[str] = Field(default="user", description="User role: admin, user, or guest")


class UserUpdate(BaseModel):
    """User update request."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[EmailStr] = None
    preferences: Optional[dict] = None


class UserResponse(BaseModel):
    """User response."""
    id: str
    name: str
    email: str
    role: str
    is_active: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class UserChangePIN(BaseModel):
    """Change PIN request."""
    current_pin: str = Field(..., min_length=4, max_length=4)
    new_pin: str = Field(..., min_length=4, max_length=4)


class UserRegisterBiometric(BaseModel):
    """Register biometric request."""
    biometric_data: str = Field(..., description="Base64 encoded biometric data")
    biometric_type: str = Field(..., description="Biometric type: faceid or fingerprint")
