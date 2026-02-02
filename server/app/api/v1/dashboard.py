"""
Dashboard Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.models import SecuritySystem, ClimateSettings, GardenZone, WaterTank, Light, ActivityLog
from app.schemas import DashboardData

router = APIRouter()


@router.get("", response_model=DashboardData)
async def get_dashboard_data(db: AsyncSession = Depends(get_db)):
    """Get aggregated dashboard data."""
    # Get security status
    result = await db.execute(select(SecuritySystem).limit(1))
    security = result.scalar_one_or_none()
    
    # Get climate status
    result = await db.execute(select(ClimateSettings).limit(1))
    climate = result.scalar_one_or_none()
    
    # Get garden status
    result = await db.execute(select(GardenZone))
    zones = result.scalars().all()
    result = await db.execute(select(WaterTank).limit(1))
    tank = result.scalar_one_or_none()
    
    # Get lighting status
    result = await db.execute(select(Light))
    lights = result.scalars().all()
    
    # Get recent activity
    result = await db.execute(
        select(ActivityLog)
        .order_by(ActivityLog.timestamp.desc())
        .limit(5)
    )
    recent_logs = result.scalars().all()
    
    return DashboardData(
        security={
            "armed": security.armed if security else False,
            "status": "Armed" if security and security.armed else "Disarmed"
        },
        climate={
            "temperature": climate.target_temperature if climate else 22,
            "mode": climate.mode if climate else "cool"
        },
        garden={
            "nextWatering": "18:00",
            "soilMoisture": int(sum(z.soil_moisture or 0 for z in zones) / len(zones)) if zones else 65
        },
        lighting={
            "masterOn": len([l for l in lights if l.on]) > 0,
            "activeLights": len([l for l in lights if l.on]),
            "powerUsage": sum(l.power_usage or 0 for l in lights if l.on)
        },
        recent_activity=[
            {
                "time": log.timestamp.strftime("%I:%M %p"),
                "event": log.event,
                "type": log.log_type
            }
            for log in recent_logs
        ]
    )
