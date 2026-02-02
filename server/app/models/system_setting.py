"""
System Setting Model
"""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class SystemSetting(Base):
    """SystemSetting model for storing global system settings."""
    
    __tablename__ = "system_settings"
    
    id = Column(String(36), primary_key=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(String, nullable=False)
    value_type = Column(String(50), default="string")
    description = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
