import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import Optional

from app.core.db import get_db
from app.core.config import settings
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.users.schemas import UserResponse, UserUpdate, UserProfileUpdate, UserProfileResponse
from app.modules.users.service import UserService
from app.modules.users.repository import UserRepository

router = APIRouter()

ALLOWED_AVATAR_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_AVATAR_SIZE = 5 * 1024 * 1024  # 5MB


def _user_to_response(user: User) -> UserResponse:
    """Convert User model to UserResponse (matching frontend UserDto)."""
    district = None
    profile_image_url = None
    if user.profile:
        district = user.profile.district
        profile_image_url = user.profile.avatar_url
    
    return UserResponse(
        id=str(user.id),
        name=user.name,
        email=user.email,
        phone=user.phone,
        role=user.role.value if user.role else None,
        district=district,
        profileImageUrl=profile_image_url,
        createdAt=user.created_at,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user(
    current_user: User = Depends(get_current_active_user),
):
    """Get current user profile - matches frontend expectation."""
    return _user_to_response(current_user)


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update current user profile (PUT)."""
    service = UserService(db)
    updated_user = service.update_user(current_user.id, user_data)
    return _user_to_response(updated_user)


@router.patch("/me", response_model=UserResponse)
async def patch_current_user(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update current user profile (PATCH). Accepts fullName, phone, avatarUrl."""
    service = UserService(db)
    updated_user = service.update_user(current_user.id, user_data)
    return _user_to_response(updated_user)


@router.post("/me/avatar")
async def upload_avatar(
    request: Request,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Upload profile photo (multipart/form-data). Saves locally to uploads/avatars/ and updates user profile.
    Returns { avatarUrl: "..." }.
    """
    if file.content_type not in ALLOWED_AVATAR_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: image/jpeg, image/png, image/webp",
        )
    content = await file.read()
    if len(content) > MAX_AVATAR_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large (max 5MB)",
        )
    ext = "jpg"
    if file.filename and "." in file.filename:
        ext = file.filename.rsplit(".", 1)[-1].lower()
    if ext not in ("jpg", "jpeg", "png", "webp"):
        ext = "jpg"
    filename = f"{uuid.uuid4().hex}.{ext}"
    avatars_dir = os.path.join(settings.UPLOADS_DIR, "avatars")
    os.makedirs(avatars_dir, exist_ok=True)
    path = os.path.join(avatars_dir, filename)
    with open(path, "wb") as f:
        f.write(content)
    base_url = (settings.API_PUBLIC_URL or str(request.base_url)).rstrip("/")
    avatar_url = f"{base_url}/uploads/avatars/{filename}"
    repo = UserRepository(db)
    repo.update_profile(current_user.id, {"avatar_url": avatar_url})
    db.commit()
    return {"avatarUrl": avatar_url}


@router.get("/me/profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Get user profile."""
    if not current_user.profile:
        return UserProfileResponse()
    return UserProfileResponse.from_orm(current_user.profile)


@router.put("/me/profile", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """Update user profile."""
    service = UserService(db)
    profile = service.update_user_profile(current_user.id, profile_data)
    return UserProfileResponse.from_orm(profile)
