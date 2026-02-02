"""
Light Model
"""

from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, Numeric
from sqlalchemy.sql import func
from app.core.database import Base


class Light(Base):
    """Light model for storing light information."""
    
    __tablename__ = "lights"
    
    id = Column(String(36), primary_key=True)
    light_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    room_id = Column(String(36), ForeignKey("rooms.id", ondelete="SET NULL"), index=True)
    on = Column(Boolean, default=False, index=True)
    brightness = Column(Integer)
    color = Column(String(7))
    power_usage = Column(Numeric(10, 2))
    last_toggled_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
