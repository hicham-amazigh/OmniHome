"""
Security System Model
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base


class SecuritySystem(Base):
    """SecuritySystem model for storing security system state."""
    
    __tablename__ = "security_system"
    
    id = Column(String(36), primary_key=True)
    armed = Column(Boolean, default=False)
    mode = Column(String(50), default="home")
    last_armed_at = Column(DateTime(timezone=True))
    last_disarmed_at = Column(DateTime(timezone=True))
    last_armed_by = Column(String(36), ForeignKey("users.id"))
    last_disarmed_by = Column(String(36), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
