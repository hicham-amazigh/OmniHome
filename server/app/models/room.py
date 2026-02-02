"""
Room Model
"""

from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Room(Base):
    """Room model for storing room information."""
    
    __tablename__ = "rooms"
    
    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
