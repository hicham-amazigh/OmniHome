"""
Door Model
"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Door(Base):
    """Door model for storing door lock status."""
    
    __tablename__ = "doors"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    door_id = Column(String(50), unique=True, nullable=False, index=True)
    locked = Column(Boolean, default=True)
    last_locked_at = Column(DateTime(timezone=True))
    last_unlocked_at = Column(DateTime(timezone=True))
    last_activity_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
