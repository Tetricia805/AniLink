from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.bookings.schemas import BookingCreate, BookingResponse
from app.modules.bookings.service import BookingService
from app.modules.bookings.models import Booking


class UpdateStatusRequest(BaseModel):
    """Request body for updating booking status."""
    status: str


router = APIRouter()


def _booking_to_response(booking: Booking) -> BookingResponse:
    """Convert Booking to BookingResponse matching frontend BookingDto."""
    vet_name = None
    clinic_name = None
    if booking.vet and booking.vet.user:
        vet_name = booking.vet.user.name
        clinic_name = booking.vet.clinic_name
    
    return BookingResponse(
        id=str(booking.id),
        vetId=str(booking.vet_user_id),
        userId=str(booking.owner_user_id),
        visitType=booking.visit_type.value,
        scheduledAt=booking.scheduled_time,
        caseId=str(booking.case_id) if booking.case_id else None,
        notes=booking.notes,
        status=booking.status.value,
        vetName=vet_name,
        clinicName=clinic_name,
        createdAt=booking.created_at,
        updatedAt=booking.updated_at,
    )


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new booking.
    Matches frontend: POST /bookings
    """
    try:
        service = BookingService(db)
        booking = service.create_booking(
            current_user.id,
            booking_data.dict(),
        )
        return _booking_to_response(booking)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=List[BookingResponse])
async def list_bookings(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List bookings for current user.
    Matches frontend: GET /bookings?status=
    Returns both owner and vet bookings based on user role.
    """
    service = BookingService(db)
    
    if current_user.role.value == "VET":
        bookings = service.get_vet_bookings(current_user.id, status)
    else:
        bookings = service.get_user_bookings(current_user.id, status)
    
    return [_booking_to_response(booking) for booking in bookings]


@router.get("/{booking_id}", response_model=BookingResponse)
async def get_booking(
    booking_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get booking by ID."""
    try:
        booking_uuid = UUID(booking_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking ID",
        )
    
    service = BookingService(db)
    booking = service.get_booking(booking_uuid)
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found",
        )
    
    # Authorization
    if booking.owner_user_id != current_user.id and booking.vet_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized",
        )
    
    return _booking_to_response(booking)


@router.put("/{booking_id}/status", response_model=BookingResponse)
async def update_booking_status(
    booking_id: str,
    request: UpdateStatusRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update booking status. Vets: accept/decline. Owners: cancel only."""
    try:
        booking_uuid = UUID(booking_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking ID",
        )
    
    service = BookingService(db)
    
    vet_user_id = current_user.id if current_user.role.value == "VET" else None
    owner_user_id = current_user.id if current_user.role.value == "OWNER" else None
    
    try:
        booking = service.update_booking_status(
            booking_uuid, request.status, vet_user_id=vet_user_id, owner_user_id=owner_user_id
        )
        return _booking_to_response(booking)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
