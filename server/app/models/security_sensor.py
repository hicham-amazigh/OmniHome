"""
Security Sensor Model
"""

from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class SecuritySensor(Base):
    """SecuritySensor model for storing security sensor information."""
    
    __tablename__ = "security_sensors"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    sensor_type = Column(String(50), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    status = Column(String(50), default="active", index=True)
    last_triggered_at = Column(DateTime(timezone=True))
    last_activity_at = Column(DateTime(timezone=True))
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
