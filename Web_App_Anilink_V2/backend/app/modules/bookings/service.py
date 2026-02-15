from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from datetime import datetime

from app.modules.bookings.models import Booking, BookingStatus, VisitType
from app.modules.bookings.repository import BookingRepository
from app.modules.vets.models import Vet
from app.modules.notifications.models import Notification


class BookingService:
    """Service for booking business logic."""
    
    def __init__(self, db: Session):
        self.repository = BookingRepository(db)
        self.db = db
    
    def create_booking(self, user_id: UUID, booking_data: dict) -> Booking:
        """Create a new booking."""
        booking_dict = {
            "owner_user_id": user_id,
            "vet_user_id": UUID(booking_data["vetId"]),
            "case_id": UUID(booking_data["caseId"]) if booking_data.get("caseId") else None,
            "visit_type": VisitType[booking_data["visitType"]],
            "scheduled_time": booking_data["scheduledAt"],
            "notes": booking_data.get("notes"),
            "status": BookingStatus.REQUESTED,
        }
        
        booking = self.repository.create(booking_dict)
        self.db.flush()

        # Notify vet of new booking request
        vet_notification = Notification(
            user_id=booking.vet_user_id,
            type="BOOKING",
            title="New booking request",
            message=f"An owner has requested an appointment. Scheduled: {booking.scheduled_time.strftime('%Y-%m-%d %H:%M')}.",
            payload={
                "entity_type": "booking",
                "entity_id": str(booking.id),
                "action_url": f"/vet/appointments?status=requested&focus={booking.id}",
            },
            read=False,
        )
        self.db.add(vet_notification)

        # Notify owner of booking created
        owner_notification = Notification(
            user_id=booking.owner_user_id,
            type="BOOKING",
            title="Appointment requested",
            message="Your booking request has been sent. The vet will confirm shortly.",
            payload={
                "entity_type": "booking",
                "entity_id": str(booking.id),
                "action_url": f"/appointments?status=pending&focus={booking.id}",
            },
            read=False,
        )
        self.db.add(owner_notification)

        self.db.commit()
        self.db.refresh(booking)
        return booking
    
    def get_user_bookings(self, user_id: UUID, status: Optional[str] = None) -> List[Booking]:
        """Get bookings for a user."""
        return self.repository.get_user_bookings(user_id, status)
    
    def get_vet_bookings(self, vet_user_id: UUID, status: Optional[str] = None) -> List[Booking]:
        """Get bookings for a vet."""
        return self.repository.get_vet_bookings(vet_user_id, status)
    
    def get_booking(self, booking_id: UUID) -> Optional[Booking]:
        """Get booking by ID."""
        return self.repository.get_by_id(booking_id)
    
    def update_booking_status(
        self,
        booking_id: UUID,
        new_status: str,
        vet_user_id: Optional[UUID] = None,
        owner_user_id: Optional[UUID] = None,
    ) -> Booking:
        """Update booking status with authorization. Vet: accept/decline. Owner: cancel only."""
        booking = self.repository.get_by_id(booking_id)
        if not booking:
            raise ValueError("Booking not found")
        
        try:
            status_enum = BookingStatus[new_status]
        except KeyError:
            raise ValueError(f"Invalid status: {new_status}")

        # Authorization
        if vet_user_id:
            if booking.vet_user_id != vet_user_id:
                raise ValueError("Not authorized to update this booking")
        elif owner_user_id:
            if booking.owner_user_id != owner_user_id:
                raise ValueError("Not authorized to update this booking")
            if status_enum != BookingStatus.CANCELLED:
                raise ValueError("Owners can only cancel their bookings")
        else:
            raise ValueError("Not authorized to update this booking")
        
        # Validate status transition
        current_status = booking.status
        valid_transitions = {
            BookingStatus.REQUESTED: [
                BookingStatus.CONFIRMED,
                BookingStatus.DECLINED,
                BookingStatus.CANCELLED,
            ],
            BookingStatus.CONFIRMED: [
                BookingStatus.IN_PROGRESS,
                BookingStatus.CANCELLED,
            ],
            BookingStatus.IN_PROGRESS: [BookingStatus.COMPLETED],
        }
        
        if current_status not in valid_transitions:
            raise ValueError(f"Cannot transition from {current_status.value}")
        
        if status_enum not in valid_transitions[current_status]:
            raise ValueError(
                f"Invalid transition from {current_status.value} to {status_enum.value}"
            )
        
        booking.status = status_enum

        # Notify owner of status change (only when vet made the change, not when owner cancelled)
        if vet_user_id and status_enum in (BookingStatus.CONFIRMED, BookingStatus.DECLINED, BookingStatus.CANCELLED):
            msg_map = {
                BookingStatus.CONFIRMED: "Your appointment has been confirmed.",
                BookingStatus.DECLINED: "Your appointment request was declined.",
                BookingStatus.CANCELLED: "Your appointment was cancelled.",
            }
            status_tab = "upcoming" if status_enum == BookingStatus.CONFIRMED else "cancelled"
            action_url = f"/appointments?status={status_tab}&focus={booking.id}"
            owner_notif = Notification(
                user_id=booking.owner_user_id,
                type="BOOKING",
                title="Appointment update",
                message=msg_map[status_enum],
                payload={
                    "entity_type": "booking",
                    "entity_id": str(booking.id),
                    "action_url": action_url,
                },
                read=False,
            )
            self.db.add(owner_notif)

        self.db.commit()
        self.db.refresh(booking)
        return booking
