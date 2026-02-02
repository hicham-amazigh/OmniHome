"""
Climate History Model
"""

from sqlalchemy import Column, Integer, String, DateTime, Numeric
from sqlalchemy.sql import func
from app.core.database import Base


class ClimateHistory(Base):
    """ClimateHistory model for storing historical climate data."""
    
    __tablename__ = "climate_history"
    
    id = Column(String(36), primary_key=True)
    temperature = Column(Numeric(5, 2), nullable=False, index=True)
    humidity = Column(Integer, nullable=False)
    mode = Column(String(50), nullable=False)
    fan_speed = Column(String(50), nullable=False)
    power_usage = Column(Numeric(10, 2))
    recorded_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
