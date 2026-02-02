"""
Climate Control Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import ClimateSettings, ClimateHistory, ActivityLog
from app.schemas import (
    ClimateStatus, TemperatureRequest, FanSpeedRequest, ModeRequest,
    ClimateApplyRequest, SuccessResponse
)

router = APIRouter()


@router.get("/status", response_model=ClimateStatus)
async def get_climate_status(db: AsyncSession = Depends(get_db)):
    """Get climate control status."""
    result = await db.execute(select(ClimateSettings).limit(1))
    climate = result.scalar_one_or_none()
    
    if not climate:
        climate = ClimateSettings(
            id=str(uuid.uuid4()),
            target_temperature=22,
            current_temperature=21,
            humidity=45,
            mode="cool",
            fan_speed="med",
            power_usage=1.2,
            active=True
        )
        db.add(climate)
        await db.commit()
    
    return ClimateStatus(
        current_temperature=float(climate.current_temperature) if climate.current_temperature else None,
        target_temperature=climate.target_temperature,
        humidity=climate.humidity,
        mode=climate.mode,
        fan_speed=climate.fan_speed,
        power_usage=float(climate.power_usage) if climate.power_usage else None,
        active=climate.active,
        last_updated_at=climate.last_updated_at
    )


@router.post("/temperature", response_model=SuccessResponse)
async def set_temperature(
    request: TemperatureRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set target temperature."""
    result = await db.execute(select(ClimateSettings).limit(1))
    climate = result.scalar_one_or_none()
    
    previous_temp = climate.target_temperature if climate else 22
    climate.target_temperature = request.temperature
    climate.last_updated_at = datetime.utcnow()
    
    # Log history
    history = ClimateHistory(
        id=str(uuid.uuid4()),
        temperature=request.temperature,
        humidity=climate.humidity if climate else 45,
        mode=climate.mode if climate else "cool",
        fan_speed=climate.fan_speed if climate else "med",
        power_usage=climate.power_usage if climate else 1.2
    )
    db.add(history)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "targetTemperature": request.temperature,
            "previousTemperature": previous_temp,
            "updatedAt": datetime.utcnow()
        }
    )


@router.post("/fan-speed", response_model=SuccessResponse)
async def set_fan_speed(
    request: FanSpeedRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set fan speed."""
    result = await db.execute(select(ClimateSettings).limit(1))
    climate = result.scalar_one_or_none()
    
    climate.fan_speed = request.fan_speed
    climate.last_updated_at = datetime.utcnow()
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "fanSpeed": request.fan_speed,
            "updatedAt": datetime.utcnow()
        }
    )


@router.post("/mode", response_model=SuccessResponse)
async def set_climate_mode(
    request: ModeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set climate mode."""
    result = await db.execute(select(ClimateSettings).limit(1))
    climate = result.scalar_one_or_none()
    
    previous_mode = climate.mode if climate else "cool"
    climate.mode = request.mode
    climate.last_updated_at = datetime.utcnow()
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "mode": request.mode,
            "previousMode": previous_mode,
            "updatedAt": datetime.utcnow()
        }
    )


@router.post("/apply", response_model=SuccessResponse)
async def apply_climate_settings(
    request: ClimateApplyRequest,
    db: AsyncSession = Depends(get_db)
):
    """Apply climate settings."""
    result = await db.execute(select(ClimateSettings).limit(1))
    climate = result.scalar_one_or_none()
    
    climate.target_temperature = request.temperature
    climate.fan_speed = request.fan_speed
    climate.mode = request.mode
    climate.last_updated_at = datetime.utcnow()
    
    # Log history
    history = ClimateHistory(
        id=str(uuid.uuid4()),
        temperature=request.temperature,
        humidity=climate.humidity if climate else 45,
        mode=request.mode,
        fan_speed=request.fan_speed,
        power_usage=climate.power_usage if climate else 1.2
    )
    db.add(history)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "temperature": request.temperature,
            "fanSpeed": request.fan_speed,
            "mode": request.mode,
            "appliedAt": datetime.utcnow()
        }
    )
