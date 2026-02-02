"""
Water Tank Model
"""

from sqlalchemy import Column, String, Integer, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class WaterTank(Base):
    """WaterTank model for storing water tank information."""
    
    __tablename__ = "water_tank"
    
    id = Column(String(36), primary_key=True)
    level = Column(Integer, nullable=False)
    capacity = Column(Integer, nullable=False, default=1000)
    available = Column(Integer, nullable=False)
    usage_today = Column(Integer, default=0)
    last_refilled_at = Column(DateTime(timezone=True))
    low_level_alert = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
