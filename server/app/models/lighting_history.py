"""
Lighting History Model
"""

from sqlalchemy import Column, String, Boolean, Integer, DateTime, Numeric
from sqlalchemy.sql import func
from app.core.database import Base


class LightingHistory(Base):
    """LightingHistory model for storing historical lighting data."""
    
    __tablename__ = "lighting_history"
    
    id = Column(String(36), primary_key=True)
    light_id = Column(String(50), nullable=False, index=True)
    on = Column(Boolean, nullable=False)
    brightness = Column(Integer)
    power_usage = Column(Numeric(10, 2))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
