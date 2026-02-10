from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class NotificationResponse(BaseModel):
    """Notification response - matches frontend NotificationDto exactly."""
    id: str
    title: str
    message: str
    type: Optional[str] = None  # BOOKING, CASE, ORDER, REMINDER
    relatedId: Optional[str] = None
    isRead: bool  # Frontend expects isRead, backend has read
    createdAt: Optional[datetime] = None
    entityType: Optional[str] = None  # booking, case, order, product, system
    entityId: Optional[str] = None
    actionUrl: Optional[str] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class DeviceTokenRegister(BaseModel):
    """Device token registration schema."""
    platform: str  # android, ios
    fcm_token: str
