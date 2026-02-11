from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.modules.notifications.models import Notification


class NotificationRepository:
    """Repository for notification operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_notifications(self, user_id: UUID) -> List[Notification]:
        """Get notifications for a user."""
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .all()
        )
    
    def get_by_id(self, notification_id: UUID):
        """Get notification by ID."""
        return self.db.query(Notification).filter(Notification.id == notification_id).first()
