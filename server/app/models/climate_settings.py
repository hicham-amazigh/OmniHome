"""
Climate Settings Model
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Numeric
from sqlalchemy.sql import func
from app.core.database import Base


class ClimateSettings(Base):
    """ClimateSettings model for storing climate control settings."""
    
    __tablename__ = "climate_settings"
    
    id = Column(String(36), primary_key=True)
    target_temperature = Column(Integer, nullable=False)
    current_temperature = Column(Numeric(5, 2))
    humidity = Column(Integer)
    mode = Column(String(50), default="cool")
    fan_speed = Column(String(50), default="med")
    power_usage = Column(Numeric(10, 2))
    active = Column(Boolean, default=True)
    last_updated_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_by = Column(String(36), ForeignKey("users.id"))
