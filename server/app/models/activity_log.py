"""
Activity Log Model
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from app.core.database import Base


class ActivityLog(Base):
    """ActivityLog model for storing system activity logs."""
    
    __tablename__ = "activity_logs"
    
    id = Column(String(36), primary_key=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    event = Column(String(255), nullable=False)
    log_type = Column(String(50), nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    details = Column(JSON)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), index=True)
