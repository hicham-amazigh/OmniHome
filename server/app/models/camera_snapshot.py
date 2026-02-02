"""
Camera Snapshot Model
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, BigInteger
from sqlalchemy.sql import func
from app.core.database import Base


class CameraSnapshot(Base):
    """CameraSnapshot model for storing camera snapshot information."""
    
    __tablename__ = "camera_snapshots"
    
    id = Column(String(36), primary_key=True)
    camera_id = Column(String(50), ForeignKey("cameras.camera_id"), nullable=False, index=True)
    snapshot_id = Column(String(50), unique=True, nullable=False)
    image_url = Column(String, nullable=False)
    file_size = Column(BigInteger)
    captured_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    triggered_by = Column(String(50))
