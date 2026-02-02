"""
Camera Routes
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import uuid

from app.core.database import get_db
from app.models import Camera, CameraRecording, CameraSnapshot
from app.schemas import (
    CameraList, CameraStream, CameraSnapshot as CameraSnapshotSchema,
    CameraRecordingStart, CameraRecordingStop, SuccessResponse
)

router = APIRouter()


@router.get("", response_model=CameraList)
async def get_cameras(db: AsyncSession = Depends(get_db)):
    """Get list of all cameras."""
    result = await db.execute(select(Camera))
    cameras = result.scalars().all()
    
    return CameraList(
        cameras=[
            {
                "id": camera.camera_id,
                "name": camera.name,
                "location": camera.location,
                "status": camera.status,
                "resolution": camera.resolution,
                "isRecording": camera.is_recording
            }
            for camera in cameras
        ]
    )


@router.get("/{camera_id}/stream", response_model=CameraStream)
async def get_camera_stream(
    camera_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get camera stream URL."""
    result = await db.execute(select(Camera).where(Camera.camera_id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise Exception("Camera not found")
    
    return CameraStream(
        camera_id=camera_id,
        stream_url=f"rtsp://localhost:8554/{camera_id}",
        hls_url=f"http://localhost:8080/hls/{camera_id}.m3u8",
        thumbnail_url=f"http://localhost:8080/thumbnails/{camera_id}.jpg"
    )


@router.post("/{camera_id}/snapshot", response_model=CameraSnapshotSchema)
async def take_snapshot(
    camera_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Take camera snapshot."""
    result = await db.execute(select(Camera).where(Camera.camera_id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise Exception("Camera not found")
    
    snapshot = CameraSnapshot(
        id=str(uuid.uuid4()),
        camera_id=camera_id,
        snapshot_id=f"snap_{uuid.uuid4().hex}",
        image_url=f"http://localhost:8080/snapshots/snap_{uuid.uuid4().hex}.jpg",
        captured_at=datetime.utcnow(),
        triggered_by="manual"
    )
    db.add(snapshot)
    await db.commit()
    
    return CameraSnapshotSchema(
        snapshot_id=snapshot.snapshot_id,
        camera_id=camera_id,
        image_url=snapshot.image_url,
        captured_at=snapshot.captured_at
    )


@router.post("/{camera_id}/record/start", response_model=SuccessResponse)
async def start_recording(
    camera_id: str,
    request: CameraRecordingStart,
    db: AsyncSession = Depends(get_db)
):
    """Start camera recording."""
    result = await db.execute(select(Camera).where(Camera.camera_id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise Exception("Camera not found")
    
    camera.is_recording = True
    
    recording = CameraRecording(
        id=str(uuid.uuid4()),
        camera_id=camera_id,
        recording_id=f"rec_{uuid.uuid4().hex}",
        video_url=f"http://localhost:8080/recordings/rec_{uuid.uuid4().hex}.mp4",
        duration=request.duration or 60,
        started_at=datetime.utcnow(),
        triggered_by="manual"
    )
    db.add(recording)
    await db.commit()
    
    return SuccessResponse(
        data={
            "recordingId": recording.recording_id,
            "cameraId": camera_id,
            "startedAt": recording.started_at,
            "estimatedEnd": datetime.utcnow()
        }
    )


@router.post("/{camera_id}/record/stop", response_model=CameraRecordingStop)
async def stop_recording(
    camera_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Stop camera recording."""
    result = await db.execute(select(Camera).where(Camera.camera_id == camera_id))
    camera = result.scalar_one_or_none()
    
    if not camera:
        raise Exception("Camera not found")
    
    camera.is_recording = False
    
    # Get active recording
    result = await db.execute(
        select(CameraRecording)
        .where(CameraRecording.camera_id == camera_id)
        .order_by(CameraRecording.started_at.desc())
        .limit(1)
    )
    recording = result.scalar_one_or_none()
    
    if recording:
        recording.completed_at = datetime.utcnow()
        recording.duration = int((datetime.utcnow() - recording.started_at).total_seconds())
    
    await db.commit()
    
    return CameraRecordingStop(
        recording_id=recording.recording_id if recording else "",
        camera_id=camera_id,
        stopped_at=datetime.utcnow(),
        duration=recording.duration if recording else 0,
        video_url=recording.video_url if recording else ""
    )
