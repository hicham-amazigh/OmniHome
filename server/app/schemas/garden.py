"""
Garden Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class GardenStatus(BaseModel):
    """Garden status response."""
    zones: List[dict]
    water_tank: dict
    next_watering: dict
    weather: dict


class ZoneToggleRequest(BaseModel):
    """Zone toggle request."""
    active: bool


class AllZonesRequest(BaseModel):
    """All zones control request."""
    active: bool


class WateringScheduleRequest(BaseModel):
    """Watering schedule request."""
    time: str = Field(..., description="Watering time in HH:MM format")
    duration: int = Field(..., ge=5, le=120, description="Duration in minutes (5-120)")
    zones: List[int] = Field(..., description="List of zone IDs")


class WaterTankStatus(BaseModel):
    """Water tank status response."""
    level: int
    capacity: int
    available: int
    usage_today: int
    last_refilled_at: Optional[datetime] = None
    low_level_alert: bool


class WaterTankRefillResponse(BaseModel):
    """Water tank refill response."""
    refill_started: bool
    estimated_completion: Optional[datetime] = None
    started_at: datetime
