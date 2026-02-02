"""
Activity Log Routes
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import ActivityLog
from app.schemas import ActivityLogList, ActivityLogResponse, ActivityLogFilters

router = APIRouter()


@router.get("/logs", response_model=ActivityLogList)
async def get_activity_logs(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    log_type: str = Query(None),
    start_date: datetime = Query(None),
    end_date: datetime = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """Get activity logs with optional filters."""
    # Build query
    query = select(ActivityLog)
    
    # Apply filters
    if log_type:
        query = query.where(ActivityLog.log_type == log_type)
    if start_date:
        query = query.where(ActivityLog.timestamp >= start_date)
    if end_date:
        query = query.where(ActivityLog.timestamp <= end_date)
    
    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar()
    
    # Apply pagination and ordering
    query = query.order_by(ActivityLog.timestamp.desc()).limit(limit).offset(offset)
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return ActivityLogList(
        logs=[
            ActivityLogResponse(
                id=log.id,
                timestamp=log.timestamp,
                event=log.event,
                type=log.log_type,
                category=log.category,
                details=log.details
            )
            for log in logs
        ],
        pagination={
            "total": total,
            "limit": limit,
            "offset": offset,
            "hasMore": offset + limit < total
        }
    )


@router.get("/logs/{log_id}", response_model=ActivityLogResponse)
async def get_activity_log(
    log_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get specific activity log entry."""
    result = await db.execute(select(ActivityLog).where(ActivityLog.id == log_id))
    log = result.scalar_one_or_none()
    
    if not log:
        raise Exception("Activity log not found")
    
    return ActivityLogResponse(
        id=log.id,
        timestamp=log.timestamp,
        event=log.event,
        type=log.log_type,
        category=log.category,
        details=log.details
    )
