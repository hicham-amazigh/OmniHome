"""API v1 Routes Package"""

from fastapi import APIRouter
from app.api.v1 import auth, security, climate, garden, lighting, camera, activity, dashboard, users, websocket

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(security.router, prefix="/security", tags=["Security"])
api_router.include_router(climate.router, prefix="/climate", tags=["Climate"])
api_router.include_router(garden.router, prefix="/garden", tags=["Garden"])
api_router.include_router(lighting.router, prefix="/lighting", tags=["Lighting"])
api_router.include_router(camera.router, prefix="/cameras", tags=["Cameras"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(websocket.router, tags=["WebSocket"])
