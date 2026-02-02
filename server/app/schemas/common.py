"""
Common Schemas
"""

from pydantic import BaseModel
from typing import Optional, Any


class SuccessResponse(BaseModel):
    """Standard success response."""
    success: bool = True
    message: Optional[str] = None
    data: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standard error response."""
    success: bool = False
    error: Optional[dict] = None
