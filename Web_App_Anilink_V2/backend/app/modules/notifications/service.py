from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.modules.notifications.models import Notification, DeviceToken, DevicePlatform
from app.modules.notifications.repository import NotificationRepository


class NotificationService:
    """Service for notification business logic."""
    
    def __init__(self, db: Session):
        self.repository = NotificationRepository(db)
        self.db = db
    
    def get_user_notifications(self, user_id: UUID) -> List[Notification]:
        """Get notifications for a user."""
        return self.repository.get_user_notifications(user_id)
    
    def mark_as_read(self, notification_id: UUID, user_id: UUID) -> Optional[Notification]:
        """Mark notification as read."""
        notification = self.repository.get_by_id(notification_id)
        if not notification:
            return None
        
        # Authorization
        if notification.user_id != user_id:
            return None
        
        notification.read = True
        self.db.commit()
        self.db.refresh(notification)
        return notification
    
    def register_device_token(self, user_id: UUID, platform: str, token: str) -> DeviceToken:
        """Register or update device token for FCM."""
        # Check if token exists
        existing = self.db.query(DeviceToken).filter(DeviceToken.fcm_token == token).first()
        
        if existing:
            # Update existing token
            existing.user_id = user_id
            existing.platform = DevicePlatform[platform.upper()]
        else:
            # Create new token
            device_token = DeviceToken(
                user_id=user_id,
                platform=DevicePlatform[platform.upper()],
                fcm_token=token,
            )
            self.db.add(device_token)
            existing = device_token
        
        self.db.commit()
        self.db.refresh(existing)
        return existing
