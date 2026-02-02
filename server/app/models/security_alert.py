"""
Security Alert Model
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class SecurityAlert(Base):
    """SecurityAlert model for storing security alerts."""
    
    __tablename__ = "security_alerts"
    
    id = Column(String(36), primary_key=True)
    alert_type = Column(String(50), nullable=False, index=True)
    severity = Column(String(50), default="high")
    location = Column(String(255))
    status = Column(String(50), default="active", index=True)
    triggered_by = Column(String(36), ForeignKey("users.id"))
    sensor_id = Column(String(36), ForeignKey("security_sensors.id"))
    details = Column(JSON)
    triggered_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    acknowledged_at = Column(DateTime(timezone=True))
    resolved_at = Column(DateTime(timezone=True))
