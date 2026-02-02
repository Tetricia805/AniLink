from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.modules.bookings.models import Booking, BookingStatus


class BookingRepository:
    """Repository for booking operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, booking_data: dict) -> Booking:
        """Create a new booking."""
        booking = Booking(**booking_data)
        self.db.add(booking)
        return booking
    
    def get_by_id(self, booking_id: UUID) -> Optional[Booking]:
        """Get booking by ID."""
        return self.db.query(Booking).filter(Booking.id == booking_id).first()
    
    def get_user_bookings(
        self,
        user_id: UUID,
        status: Optional[str] = None,
    ) -> List[Booking]:
        """Get bookings for a user."""
        query = self.db.query(Booking).filter(Booking.owner_user_id == user_id)
        
        if status:
            try:
                status_enum = BookingStatus[status]
                query = query.filter(Booking.status == status_enum)
            except KeyError:
                pass
        
        return query.order_by(Booking.scheduled_time.desc()).all()
    
    def get_vet_bookings(
        self,
        vet_user_id: UUID,
        status: Optional[str] = None,
    ) -> List[Booking]:
        """Get bookings for a vet."""
        query = self.db.query(Booking).filter(Booking.vet_user_id == vet_user_id)
        
        if status:
            try:
                status_enum = BookingStatus[status]
                query = query.filter(Booking.status == status_enum)
            except KeyError:
                pass
        
        return query.order_by(Booking.scheduled_time.asc()).all()
