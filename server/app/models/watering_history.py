"""
Watering History Model
"""

from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class WateringHistory(Base):
    """WateringHistory model for storing historical watering data."""
    
    __tablename__ = "watering_history"
    
    id = Column(String(36), primary_key=True)
    zone_id = Column(Integer, nullable=False, index=True)
    duration = Column(Integer, nullable=False)
    water_used = Column(Integer, nullable=False)
    started_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    completed_at = Column(DateTime(timezone=True))
    triggered_by = Column(String(50))
