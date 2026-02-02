"""
Activity Log Schemas
"""

from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ActivityLogResponse(BaseModel):
    """Activity log response."""
    id: str
    timestamp: datetime
    event: str
    type: str
    category: str
    details: Optional[dict] = None


class ActivityLogFilters(BaseModel):
    """Activity log filters."""
    limit: Optional[int] = 50
    offset: Optional[int] = 0
    type: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None


class ActivityLogList(BaseModel):
    """Activity log list response."""
    logs: List[ActivityLogResponse]
    pagination: dict
