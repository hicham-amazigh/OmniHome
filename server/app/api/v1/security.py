"""
Security Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import SecuritySystem, SecuritySensor, Door, SecurityAlert, ActivityLog
from app.schemas import (
    SecurityStatus, SecurityArmRequest, PanicAlertRequest, GarageControlRequest,
    GarageStatus, DoorControlRequest, SecurityAlertResponse, SuccessResponse
)

router = APIRouter()


@router.get("/status", response_model=SecurityStatus)
async def get_security_status(db: AsyncSession = Depends(get_db)):
    """Get security system status."""
    # Get security system
    result = await db.execute(select(SecuritySystem).limit(1))
    security = result.scalar_one_or_none()
    
    # Get sensors
    result = await db.execute(select(SecuritySensor))
    sensors = result.scalars().all()
    
    # Get doors
    result = await db.execute(select(Door))
    doors = result.scalars().all()
    
    return SecurityStatus(
        armed=security.armed if security else False,
        mode=security.mode if security else "home",
        last_armed_at=security.last_armed_at if security else None,
        last_disarmed_at=security.last_disarmed_at if security else None,
        sensors={
            "frontDoor": {
                "locked": doors[0].locked if len(doors) > 0 else True,
                "lastActivity": doors[0].last_activity_at if len(doors) > 0 else None
            } if len(doors) > 0 else {"locked": True, "lastActivity": None},
            "backDoor": {
                "locked": doors[1].locked if len(doors) > 1 else True,
                "lastActivity": doors[1].last_activity_at if len(doors) > 1 else None
            } if len(doors) > 1 else {"locked": True, "lastActivity": None},
            "garageDoor": {
                "state": "closed",
                "lastActivity": doors[2].last_activity_at if len(doors) > 2 else None
            } if len(doors) > 2 else {"state": "closed", "lastActivity": None},
            "motionDetectors": [
                {
                    "id": sensor.id,
                    "name": sensor.name,
                    "status": sensor.status,
                    "lastTriggered": sensor.last_triggered_at
                }
                for sensor in sensors
            ]
        }
    )


@router.post("/arm", response_model=SuccessResponse)
async def arm_security(
    request: SecurityArmRequest,
    db: AsyncSession = Depends(get_db)
):
    """Arm/disarm security system."""
    result = await db.execute(select(SecuritySystem).limit(1))
    security = result.scalar_one_or_none()
    
    if security:
        security.armed = request.armed
        security.mode = request.mode
        if request.armed:
            security.last_armed_at = datetime.utcnow()
        else:
            security.last_disarmed_at = datetime.utcnow()
    else:
        security = SecuritySystem(
            id=str(uuid.uuid4()),
            armed=request.armed,
            mode=request.mode,
            last_armed_at=datetime.utcnow() if request.armed else None,
            last_disarmed_at=datetime.utcnow() if not request.armed else None
        )
        db.add(security)
    
    # Log activity
    log = ActivityLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        event=f"System {'Armed' if request.armed else 'Disarmed'}",
        log_type="success",
        category="security",
        details={"mode": request.mode}
    )
    db.add(log)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "armed": request.armed,
            "mode": request.mode,
            "armedAt": security.last_armed_at if request.armed else None
        }
    )


@router.post("/panic", response_model=SecurityAlertResponse)
async def trigger_panic(
    request: PanicAlertRequest,
    db: AsyncSession = Depends(get_db)
):
    """Trigger panic alert."""
    alert = SecurityAlert(
        id=str(uuid.uuid4()),
        alert_type="panic",
        severity="critical",
        location=request.location,
        status="active",
        details={"type": request.alert_type}
    )
    db.add(alert)
    
    # Log activity
    log = ActivityLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        event="Panic Alert Triggered",
        log_type="error",
        category="security",
        details={"location": request.location, "type": request.alert_type}
    )
    db.add(log)
    
    await db.commit()
    
    return SecurityAlertResponse(
        alert_id=alert.id,
        triggered_at=alert.triggered_at,
        status="active",
        contacts_notified=["emergency_services", "family"]
    )


@router.get("/garage/status", response_model=GarageStatus)
async def get_garage_status(db: AsyncSession = Depends(get_db)):
    """Get garage door status."""
    result = await db.execute(select(Door).where(Door.door_id == "garage"))
    door = result.scalar_one_or_none()
    
    return GarageStatus(
        state="closed",
        last_action="close" if door and door.locked else "open",
        last_action_at=door.last_activity_at if door else None,
        obstacle_detected=False
    )


@router.post("/garage/control", response_model=SuccessResponse)
async def control_garage(
    request: GarageControlRequest,
    db: AsyncSession = Depends(get_db)
):
    """Control garage door."""
    result = await db.execute(select(Door).where(Door.door_id == "garage"))
    door = result.scalar_one_or_none()
    
    if door:
        door.locked = (request.action == "close")
        door.last_activity_at = datetime.utcnow()
    
    # Log activity
    log = ActivityLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        event=f"Garage Door {'Closed' if request.action == 'close' else 'Opened'}",
        log_type="info",
        category="security",
        details={"doorId": "garage"}
    )
    db.add(log)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "state": "opening" if request.action == "open" else "closed",
            "estimatedCompletion": datetime.utcnow()
        }
    )


@router.post("/doors/{door_id}/control", response_model=SuccessResponse)
async def control_door(
    door_id: str,
    request: DoorControlRequest,
    db: AsyncSession = Depends(get_db)
):
    """Control door lock."""
    result = await db.execute(select(Door).where(Door.door_id == door_id))
    door = result.scalar_one_or_none()
    
    if not door:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Door not found"}
        )
    
    door.locked = (request.action == "lock")
    door.last_activity_at = datetime.utcnow()
    
    # Log activity
    log = ActivityLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        event=f"{door.name} {'Locked' if request.action == 'lock' else 'Unlocked'}",
        log_type="info",
        category="security",
        details={"doorId": door_id}
    )
    db.add(log)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "doorId": door_id,
            "locked": door.locked,
            "lockedAt": door.last_activity_at
        }
    )
