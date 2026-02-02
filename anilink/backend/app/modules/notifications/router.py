from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.notifications.schemas import NotificationResponse, DeviceTokenRegister
from app.modules.notifications.service import NotificationService
from app.modules.notifications.models import Notification

router = APIRouter()


def _notification_to_response(notification: Notification) -> NotificationResponse:
    """Convert Notification to NotificationResponse matching frontend NotificationDto."""
    # Extract entity data from payload
    entity_type = None
    entity_id = None
    action_url = None
    
    if notification.payload and isinstance(notification.payload, dict):
        entity_type = notification.payload.get("entity_type")
        entity_id = notification.payload.get("entity_id")
        action_url = notification.payload.get("action_url")
    
    # Fallback relatedId to entity_id or notification id
    related_id = entity_id or str(notification.id)
    
    return NotificationResponse(
        id=str(notification.id),
        title=notification.title,
        message=notification.message,
        type=notification.type,
        relatedId=related_id,
        isRead=notification.read,  # Map read to isRead
        createdAt=notification.created_at,
        entityType=entity_type,
        entityId=entity_id,
        actionUrl=action_url,
    )


@router.get("", response_model=List[NotificationResponse])
async def list_notifications(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List notifications for current user.
    Matches frontend: GET /notifications
    """
    service = NotificationService(db)
    notifications = service.get_user_notifications(current_user.id)
    return [_notification_to_response(n) for n in notifications]


@router.post("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Mark notification as read.
    Matches frontend: POST /notifications/:id/read
    """
    try:
        notification_uuid = UUID(notification_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid notification ID",
        )
    
    service = NotificationService(db)
    notification = service.mark_as_read(notification_uuid, current_user.id)
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found",
        )
    
    return {"message": "Notification marked as read"}


@router.post("/register-device")
async def register_device_token(
    token_data: DeviceTokenRegister,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Register device token for push notifications."""
    service = NotificationService(db)
    device_token = service.register_device_token(
        current_user.id,
        token_data.platform,
        token_data.fcm_token,
    )
    return {"message": "Device token registered", "id": str(device_token.id)}
