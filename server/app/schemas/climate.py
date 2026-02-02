"""
Climate Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class ClimateStatus(BaseModel):
    """Climate status response."""
    current_temperature: Optional[float] = None
    target_temperature: int
    humidity: Optional[int] = None
    mode: str
    fan_speed: str
    power_usage: Optional[float] = None
    active: bool
    last_updated_at: datetime


class TemperatureRequest(BaseModel):
    """Temperature set request."""
    temperature: int = Field(..., ge=16, le=30, description="Target temperature (16-30°C)")


class FanSpeedRequest(BaseModel):
    """Fan speed set request."""
    fan_speed: str = Field(..., description="Fan speed: low, med, or high")


class ModeRequest(BaseModel):
    """Mode set request."""
    mode: str = Field(..., description="Climate mode: cool, heat, or eco")


class ClimateApplyRequest(BaseModel):
    """Apply climate settings request."""
    temperature: int = Field(..., ge=16, le=30)
    fan_speed: str
    mode: str
