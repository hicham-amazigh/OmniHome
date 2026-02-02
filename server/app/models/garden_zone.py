"""
Garden Zone Model
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class GardenZone(Base):
    """GardenZone model for storing irrigation zone information."""
    
    __tablename__ = "garden_zones"
    
    id = Column(String(36), primary_key=True)
    zone_id = Column(Integer, unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    active = Column(Boolean, default=False, index=True)
    soil_moisture = Column(Integer)
    last_watered_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
