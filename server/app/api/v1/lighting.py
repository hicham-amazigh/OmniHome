"""
Lighting Control Routes
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import Room, Light, LightingHistory, ActivityLog
from app.schemas import (
    LightingStatus, MasterLightRequest, LightControlRequest, LightResponse, SuccessResponse
)

router = APIRouter()


@router.get("/status", response_model=LightingStatus)
async def get_lighting_status(db: AsyncSession = Depends(get_db)):
    """Get lighting status."""
    # Get rooms
    result = await db.execute(select(Room))
    rooms = result.scalars().all()
    
    # Get lights
    result = await db.execute(select(Light))
    lights = result.scalars().all()
    
    active_lights = [l for l in lights if l.on]
    total_power = sum(l.power_usage or 0 for l in active_lights)
    
    # Group lights by room
    rooms_data = []
    for room in rooms:
        room_lights = [l for l in lights if l.room_id == room.id]
        rooms_data.append({
            "id": room.id,
            "name": room.name,
            "lights": [
                {
                    "id": l.light_id,
                    "name": l.name,
                    "on": l.on,
                    "brightness": l.brightness,
                    "color": l.color
                }
                for l in room_lights
            ]
        })
    
    return LightingStatus(
        master_on=len(active_lights) > 0,
        active_lights=len(active_lights),
        total_lights=len(lights),
        power_usage=total_power,
        rooms=rooms_data
    )


@router.post("/master", response_model=SuccessResponse)
async def toggle_master_light(
    request: MasterLightRequest,
    db: AsyncSession = Depends(get_db)
):
    """Toggle all lights."""
    result = await db.execute(select(Light))
    lights = result.scalars().all()
    
    for light in lights:
        light.on = request.on
        light.last_toggled_at = datetime.utcnow()
    
    # Log history
    for light in lights:
        history = LightingHistory(
            id=str(uuid.uuid4()),
            light_id=light.light_id,
            on=request.on,
            brightness=light.brightness,
            power_usage=light.power_usage
        )
        db.add(history)
    
    # Log activity
    log = ActivityLog(
        id=str(uuid.uuid4()),
        timestamp=datetime.utcnow(),
        event=f"All lights {'On' if request.on else 'Off'}",
        log_type="info",
        category="lighting",
        details={"masterOn": request.on}
    )
    db.add(log)
    
    await db.commit()
    
    active_lights = len(lights) if request.on else 0
    total_power = sum(l.power_usage or 0 for l in lights) if request.on else 0
    
    return SuccessResponse(
        data={
            "masterOn": request.on,
            "activeLights": active_lights,
            "powerUsage": total_power,
            "updatedAt": datetime.utcnow()
        }
    )


@router.post("/lights/{light_id}/control", response_model=LightResponse)
async def control_light(
    light_id: str,
    request: LightControlRequest,
    db: AsyncSession = Depends(get_db)
):
    """Control individual light."""
    result = await db.execute(select(Light).where(Light.light_id == light_id))
    light = result.scalar_one_or_none()
    
    if not light:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": "NOT_FOUND", "message": "Light not found"}
        )
    
    if request.on is None:
        request.on = light.on
    if request.brightness is None:
        request.brightness = light.brightness
    if request.color is None:
        request.color = light.color
    
    light.on = request.on
    light.brightness = request.brightness
    light.color = request.color
    light.last_toggled_at = datetime.utcnow()
    
    # Log history
    history = LightingHistory(
        id=str(uuid.uuid4()),
        light_id=light_id,
        on=request.on,
        brightness=request.brightness,
        power_usage=light.power_usage
    )
    db.add(history)
    
    await db.commit()
    
    return LightResponse(
        light_id=light_id,
        on=request.on,
        brightness=request.brightness,
        color=request.color,
        updated_at=datetime.utcnow()
    )
