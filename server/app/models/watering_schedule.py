"""
Watering Schedule Model
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class WateringSchedule(Base):
    """WateringSchedule model for storing watering schedule settings."""
    
    __tablename__ = "watering_schedule"
    
    id = Column(String(36), primary_key=True)
    time = Column(String(5), nullable=False)
    duration = Column(Integer, nullable=False)
    zones = Column(JSON, nullable=False)
    enabled = Column(Boolean, default=True)
    days_of_week = Column(JSON, default="[1,2,3,4,5,6,7]")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
