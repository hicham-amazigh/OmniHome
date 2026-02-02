"""
Garden & Utilities Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import GardenZone, WaterTank, WateringSchedule, ActivityLog
from app.schemas import (
    GardenStatus, ZoneToggleRequest, AllZonesRequest, WateringScheduleRequest,
    WaterTankStatus, WaterTankRefillResponse, SuccessResponse
)

router = APIRouter()


@router.get("/status", response_model=GardenStatus)
async def get_garden_status(db: AsyncSession = Depends(get_db)):
    """Get garden status."""
    # Get zones
    result = await db.execute(select(GardenZone))
    zones = result.scalars().all()
    
    # Get water tank
    result = await db.execute(select(WaterTank).limit(1))
    tank = result.scalar_one_or_none()
    
    # Get watering schedule
    result = await db.execute(select(WateringSchedule).limit(1))
    schedule = result.scalar_one_or_none()
    
    return GardenStatus(
        zones=[
            {
                "id": zone.zone_id,
                "name": zone.name,
                "active": zone.active,
                "soilMoisture": zone.soil_moisture,
                "lastWateredAt": zone.last_watered_at
            }
            for zone in zones
        ],
        water_tank={
            "level": tank.level if tank else 75,
            "capacity": tank.capacity if tank else 1000,
            "available": tank.available if tank else 750,
            "usageToday": tank.usage_today if tank else 125
        },
        next_watering={
            "time": schedule.time if schedule else "18:00",
            "date": datetime.utcnow().strftime("%Y-%m-%d"),
            "duration": schedule.duration if schedule else 30
        },
        weather={
            "temperature": 28,
            "condition": "sunny",
            "humidity": 45
        }
    )


@router.post("/zones/{zone_id}/toggle", response_model=SuccessResponse)
async def toggle_zone(
    zone_id: int,
    request: ZoneToggleRequest,
    db: AsyncSession = Depends(get_db)
):
    """Toggle irrigation zone."""
    result = await db.execute(select(GardenZone).where(GardenZone.zone_id == zone_id))
    zone = result.scalar_one_or_none()
    
    if not zone:
        zone = GardenZone(
            id=str(uuid.uuid4()),
            zone_id=zone_id,
            name=f"Zone {zone_id}",
            active=request.active
        )
        db.add(zone)
    else:
        zone.active = request.active
        if request.active:
            zone.last_watered_at = datetime.utcnow()
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "zoneId": zone_id,
            "active": request.active,
            "activatedAt": datetime.utcnow() if request.active else None
        }
    )


@router.post("/zones/all", response_model=SuccessResponse)
async def set_all_zones(
    request: AllZonesRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set all irrigation zones."""
    result = await db.execute(select(GardenZone))
    zones = result.scalars().all()
    
    active_zones = []
    for zone in zones:
        zone.active = request.active
        if request.active:
            zone.last_watered_at = datetime.utcnow()
        active_zones.append(zone.zone_id)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "activeZones": active_zones if request.active else [],
            "updatedAt": datetime.utcnow()
        }
    )


@router.post("/schedule", response_model=SuccessResponse)
async def set_watering_schedule(
    request: WateringScheduleRequest,
    db: AsyncSession = Depends(get_db)
):
    """Set watering schedule."""
    result = await db.execute(select(WateringSchedule).limit(1))
    schedule = result.scalar_one_or_none()
    
    if schedule:
        schedule.time = request.time
        schedule.duration = request.duration
        schedule.zones = request.zones
    else:
        schedule = WateringSchedule(
            id=str(uuid.uuid4()),
            time=request.time,
            duration=request.duration,
            zones=request.zones
        )
        db.add(schedule)
    
    await db.commit()
    
    return SuccessResponse(
        data={
            "scheduledTime": request.time,
            "duration": request.duration,
            "zones": request.zones,
            "nextWatering": datetime.utcnow().strftime("%Y-%m-%dT") + request.time + ":00",
            "updatedAt": datetime.utcnow()
        }
    )


@router.get("/water-tank", response_model=WaterTankStatus)
async def get_water_tank_status(db: AsyncSession = Depends(get_db)):
    """Get water tank status."""
    result = await db.execute(select(WaterTank).limit(1))
    tank = result.scalar_one_or_none()
    
    if not tank:
        tank = WaterTank(
            id=str(uuid.uuid4()),
            level=75,
            capacity=1000,
            available=750,
            usage_today=125
        )
        db.add(tank)
        await db.commit()
    
    return WaterTankStatus(
        level=tank.level,
        capacity=tank.capacity,
        available=tank.available,
        usage_today=tank.usage_today,
        last_refilled_at=tank.last_refilled_at,
        low_level_alert=tank.low_level_alert
    )


@router.post("/water-tank/refill", response_model=WaterTankRefillResponse)
async def refill_water_tank(db: AsyncSession = Depends(get_db)):
    """Start water tank refill."""
    result = await db.execute(select(WaterTank).limit(1))
    tank = result.scalar_one_or_none()
    
    if tank:
        tank.level = 100
        tank.available = tank.capacity
        tank.last_refilled_at = datetime.utcnow()
        tank.low_level_alert = False
    
    await db.commit()
    
    return WaterTankRefillResponse(
        refill_started=True,
        estimated_completion=datetime.utcnow(),
        started_at=datetime.utcnow()
    )
