"""
Token Schemas
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Token(BaseModel):
    """Token response."""
    token: str
    user: dict
    expires_at: datetime


class TokenRefresh(BaseModel):
    """Refresh token request."""
    refresh_token: str


class TokenResponse(BaseModel):
    """Token refresh response."""
    token: str
    expires_at: datetime
