"""
Camera Schemas
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CameraList(BaseModel):
    """Camera list response."""
    cameras: list


class CameraStream(BaseModel):
    """Camera stream response."""
    camera_id: str
    stream_url: str
    hls_url: str
    thumbnail_url: str


class CameraSnapshot(BaseModel):
    """Camera snapshot response."""
    snapshot_id: str
    camera_id: str
    image_url: str
    captured_at: datetime


class CameraRecordingStart(BaseModel):
    """Camera recording start request."""
    duration: Optional[int] = Field(None, ge=1, description="Duration in seconds")


class CameraRecordingStop(BaseModel):
    """Camera recording stop response."""
    recording_id: str
    camera_id: str
    stopped_at: datetime
    duration: int
    video_url: str
