"""
Camera Recording Model
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, BigInteger, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class CameraRecording(Base):
    """CameraRecording model for storing camera recording information."""
    
    __tablename__ = "camera_recordings"
    
    id = Column(String(36), primary_key=True)
    camera_id = Column(String(50), ForeignKey("cameras.camera_id"), nullable=False, index=True)
    recording_id = Column(String(50), unique=True, nullable=False)
    video_url = Column(String, nullable=False)
    duration = Column(Integer, nullable=False)
    file_size = Column(BigInteger)
    started_at = Column(DateTime(timezone=True), nullable=False, index=True)
    completed_at = Column(DateTime(timezone=True))
    triggered_by = Column(String(50))
    recording_metadata = Column(JSON)
