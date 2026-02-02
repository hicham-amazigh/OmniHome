"""
Dashboard Schemas
"""

from pydantic import BaseModel
from typing import List


class DashboardData(BaseModel):
    """Dashboard data response."""
    security: dict
    climate: dict
    garden: dict
    lighting: dict
    recent_activity: List[dict]
