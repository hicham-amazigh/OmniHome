"""
Security Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class SecurityStatus(BaseModel):
    """Security status response."""
    armed: bool
    mode: str
    last_armed_at: Optional[datetime] = None
    last_disarmed_at: Optional[datetime] = None
    sensors: dict


class SecurityArmRequest(BaseModel):
    """Arm/disarm request."""
    armed: bool
    mode: Optional[str] = "home"


class PanicAlertRequest(BaseModel):
    """Panic alert request."""
    location: str = "home"
    alert_type: str = "emergency"


class GarageControlRequest(BaseModel):
    """Garage door control request."""
    action: str = Field(..., description="open or close")


class GarageStatus(BaseModel):
    """Garage door status response."""
    state: str
    last_action: Optional[str] = None
    last_action_at: Optional[datetime] = None
    obstacle_detected: bool = False


class DoorControlRequest(BaseModel):
    """Door lock control request."""
    action: str = Field(..., description="lock or unlock")


class SecurityAlertResponse(BaseModel):
    """Security alert response."""
    alert_id: str
    triggered_at: datetime
    status: str
    contacts_notified: List[str]
