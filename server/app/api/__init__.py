"""API Routes Package"""

from fastapi import APIRouter
from app.api.v1 import api_router as api_v1_router

api_router = APIRouter()

# Include v1 API routes
api_router.include_router(api_v1_router, prefix="/v1")
