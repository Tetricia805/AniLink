from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.vets.schemas import (
    VetResponse,
    VetUpdateRequest,
    AvailabilitySlotResponse,
    AvailabilitySlotCreate,
    VetAvailabilityResponse,
    VetAvailabilityUpdate,
)
from app.modules.vets.service import VetService
from app.modules.vets.models import Vet, VetAvailability

router = APIRouter()


def _vet_to_response(vet: Vet, distance_km: Optional[float] = None) -> VetResponse:
    """Convert Vet model to VetResponse matching frontend VetDto."""
    # Get services from JSONB
    services = vet.services if isinstance(vet.services, list) else []
    specializations = vet.specializations if isinstance(vet.specializations, list) else []
    specialization = specializations[0] if specializations else None
    
    # Get user info
    user = vet.user
    
    # Build availability string if needed
    availability = None
    if vet.is_24_7:
        availability = "24/7"
    elif vet.availability_slots:
        # Could format availability slots here
        availability = "See profile"
    
    return VetResponse(
        id=str(vet.user_id),
        name=user.name,
        clinicName=vet.clinic_name,
        specialization=specialization,
        rating=vet.avg_rating,
        reviewCount=vet.review_count,
        latitude=vet.location_lat,
        longitude=vet.location_lng,
        address=vet.address,
        district=vet.district,
        locationLabel=getattr(vet, "location_label", None),
        phone=user.phone if user else None,
        whatsapp=None,  # Could add to user or vet model
        email=user.email if user else None,
        profileImageUrl=None,  # Could add to user profile
        services=services,
        offersFarmVisits=vet.farm_visits,
        is24Hours=vet.is_24_7,
        isVerified=vet.verified,
        availability=availability,
        createdAt=vet.created_at,
        distance_km=distance_km,
    )


@router.get("", response_model=List[VetResponse])
async def list_vets(
    latitude: Optional[float] = Query(None, description="User latitude"),
    longitude: Optional[float] = Query(None, description="User longitude"),
    radius: Optional[float] = Query(None, description="Search radius in km", alias="radius_km"),
    specialization: Optional[str] = Query(None),
    farm_visits: Optional[bool] = Query(None, alias="farmVisits"),
    is_24_hours: Optional[bool] = Query(None, alias="is24Hours"),
    db: Session = Depends(get_db),
):
    """
    List vets with proximity search.
    Matches frontend: GET /vets?lat=&lng=&radius=&specialization=&farm_visits=&is_24_hours=
    """
    service = VetService(db)
    results = service.search_vets(
        latitude=latitude,
        longitude=longitude,
        radius_km=radius,
        specialization=specialization,
        farm_visits=farm_visits,
        is_24_hours=is_24_hours,
    )
    
    return [
        _vet_to_response(vet, distance)
        for vet, distance in results
    ]


@router.get("/me", response_model=VetResponse)
async def get_my_vet_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get current user's vet profile (vet-only).
    Matches frontend: GET /vets/me
    """
    if current_user.role.value != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only veterinarians can view vet profile",
        )
    service = VetService(db)
    vet = service.get_vet_by_id(current_user.id)
    if not vet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vet profile not found. Create one first.",
        )
    return _vet_to_response(vet)


@router.put("/me", response_model=VetResponse)
@router.patch("/me", response_model=VetResponse)
async def update_my_vet_profile(
    vet_data: VetUpdateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Update current user's vet profile (PUT or PATCH).
    Matches frontend: PUT /vets/me, PATCH /vets/me
    """
    if current_user.role.value != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only veterinarians can update vet profile",
        )
    service = VetService(db)
    update_dict = vet_data.dict(exclude_unset=True, exclude_none=True)
    field_mapping = {
        "clinicName": "clinic_name",
        "offersFarmVisits": "farm_visits",
        "is24Hours": "is_24_7",
        "latitude": "location_lat",
        "longitude": "location_lng",
        "locationLabel": "location_label",
    }
    mapped_dict = {}
    for key, value in update_dict.items():
        model_key = field_mapping.get(key, key)
        mapped_dict[model_key] = value
    vet = service.update_vet_profile(current_user.id, mapped_dict)
    return _vet_to_response(vet)


@router.get("/me/availability", response_model=VetAvailabilityResponse)
async def get_my_vet_availability(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get current vet's availability (weekly_schedule JSON + toggles).
    Matches requirement: GET /vets/me/availability
    """
    if current_user.role.value != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only veterinarians can view availability",
        )
    row = db.query(VetAvailability).filter(VetAvailability.user_id == current_user.id).first()
    if not row:
        return VetAvailabilityResponse(
            acceptFarmVisits=False,
            isEmergency247=False,
            weeklySchedule={k: [] for k in ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]},
        )
    return VetAvailabilityResponse(
        acceptFarmVisits=row.accept_farm_visits or False,
        isEmergency247=row.is_emergency_247 or False,
        weeklySchedule=row.weekly_schedule or {},
    )


@router.put("/me/availability", response_model=VetAvailabilityResponse)
async def put_my_vet_availability(
    body: VetAvailabilityUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Update current vet's availability (weekly_schedule JSON + toggles).
    Matches requirement: PUT /vets/me/availability
    """
    if current_user.role.value != "VET":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only veterinarians can update availability",
        )
    row = db.query(VetAvailability).filter(VetAvailability.user_id == current_user.id).first()
    data = body.dict(exclude_unset=True)
    # Map camelCase -> snake_case
    if "acceptFarmVisits" in data:
        data["accept_farm_visits"] = data.pop("acceptFarmVisits")
    if "isEmergency247" in data:
        data["is_emergency_247"] = data.pop("isEmergency247")
    if "weeklySchedule" in data:
        data["weekly_schedule"] = data.pop("weeklySchedule")
    if not row:
        row = VetAvailability(user_id=current_user.id, **data)
        db.add(row)
    else:
        for k, v in data.items():
            if hasattr(row, k):
                setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return VetAvailabilityResponse(
        acceptFarmVisits=row.accept_farm_visits or False,
        isEmergency247=row.is_emergency_247 or False,
        weeklySchedule=row.weekly_schedule or {},
    )


@router.get("/{vet_id}", response_model=VetResponse)
async def get_vet(
    vet_id: str,
    db: Session = Depends(get_db),
):
    """
    Get vet by ID.
    Matches frontend: GET /vets/:id
    """
    try:
        vet_uuid = UUID(vet_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vet ID",
        )
    service = VetService(db)
    vet = service.get_vet_by_id(vet_uuid)
    if not vet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vet not found",
        )
    return _vet_to_response(vet)


@router.get("/{vet_id}/availability", response_model=List[AvailabilitySlotResponse])
async def get_vet_availability(
    vet_id: str,
    db: Session = Depends(get_db),
):
    """
    Get vet's availability slots.
    Matches requirement: GET /vets/{vet_id}/availability
    """
    try:
        vet_uuid = UUID(vet_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vet ID",
        )
    
    service = VetService(db)
    vet = service.get_vet_by_id(vet_uuid)
    
    if not vet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vet not found",
        )
    
    slots = vet.availability_slots if vet.availability_slots else []
    return [
        AvailabilitySlotResponse(
            id=str(slot.id),
            dayOfWeek=slot.day_of_week,
            startTime=slot.start_time,
            endTime=slot.end_time,
            slotMinutes=slot.slot_minutes,
        )
        for slot in slots
    ]
