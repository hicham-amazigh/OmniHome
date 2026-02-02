"""
Camera Model
"""

from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.core.database import Base


class Camera(Base):
    """Camera model for storing camera information."""
    
    __tablename__ = "cameras"
    
    id = Column(String(36), primary_key=True)
    camera_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    status = Column(String(50), default="online", index=True)
    resolution = Column(String(50))
    stream_url = Column(String)
    hls_url = Column(String)
    thumbnail_url = Column(String)
    is_recording = Column(Boolean, default=False)
    last_online_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
