"""
Lighting Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class LightingStatus(BaseModel):
    """Lighting status response."""
    master_on: bool
    active_lights: int
    total_lights: int
    power_usage: Optional[float] = None
    rooms: List[dict]


class MasterLightRequest(BaseModel):
    """Master light control request."""
    on: bool


class LightControlRequest(BaseModel):
    """Individual light control request."""
    on: Optional[bool] = None
    brightness: Optional[int] = Field(None, ge=0, le=100)
    color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$')


class LightResponse(BaseModel):
    """Light response."""
    light_id: str
    on: bool
    brightness: Optional[int] = None
    color: Optional[str] = None
    updated_at: datetime
