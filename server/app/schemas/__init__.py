"""Pydantic Schemas Package"""

from app.schemas.user import (
    UserCreate, UserResponse, UserUpdate, UserLoginPIN, UserLoginBiometric,
    UserChangePIN, UserRegisterBiometric
)
from app.schemas.token import Token, TokenRefresh, TokenResponse
from app.schemas.security import (
    SecurityStatus, SecurityArmRequest, PanicAlertRequest, GarageControlRequest,
    GarageStatus, DoorControlRequest, SecurityAlertResponse
)
from app.schemas.climate import (
    ClimateStatus, TemperatureRequest, FanSpeedRequest, ModeRequest,
    ClimateApplyRequest
)
from app.schemas.garden import (
    GardenStatus, ZoneToggleRequest, AllZonesRequest, WateringScheduleRequest,
    WaterTankStatus, WaterTankRefillResponse
)
from app.schemas.lighting import (
    LightingStatus, MasterLightRequest, LightControlRequest, LightResponse
)
from app.schemas.camera import (
    CameraList, CameraStream, CameraSnapshot, CameraRecordingStart,
    CameraRecordingStop
)
from app.schemas.activity import (
    ActivityLogList, ActivityLogResponse, ActivityLogFilters
)
from app.schemas.dashboard import DashboardData
from app.schemas.common import SuccessResponse, ErrorResponse

__all__ = [
    # User schemas
    "UserCreate",
    "UserResponse",
    "UserUpdate",
    "UserLoginPIN",
    "UserLoginBiometric",
    "UserChangePIN",
    "UserRegisterBiometric",
    # Token schemas
    "Token",
    "TokenRefresh",
    "TokenResponse",
    # Security schemas
    "SecurityStatus",
    "SecurityArmRequest",
    "PanicAlertRequest",
    "GarageControlRequest",
    "GarageStatus",
    "DoorControlRequest",
    "SecurityAlertResponse",
    # Climate schemas
    "ClimateStatus",
    "TemperatureRequest",
    "FanSpeedRequest",
    "ModeRequest",
    "ClimateApplyRequest",
    # Garden schemas
    "GardenStatus",
    "ZoneToggleRequest",
    "AllZonesRequest",
    "WateringScheduleRequest",
    "WaterTankStatus",
    "WaterTankRefillResponse",
    # Lighting schemas
    "LightingStatus",
    "MasterLightRequest",
    "LightControlRequest",
    "LightResponse",
    # Camera schemas
    "CameraList",
    "CameraStream",
    "CameraSnapshot",
    "CameraRecordingStart",
    "CameraRecordingStop",
    # Activity schemas
    "ActivityLogList",
    "ActivityLogResponse",
    "ActivityLogFilters",
    # Dashboard schemas
    "DashboardData",
    # Common schemas
    "SuccessResponse",
    "ErrorResponse",
]
