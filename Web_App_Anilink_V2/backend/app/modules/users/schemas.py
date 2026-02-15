from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from uuid import UUID


# User schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "OWNER"


class UserCreate(UserBase):
    password: str = Field(..., min_length=6)


class UserUpdate(BaseModel):
    """PATCH /users/me - fullName/name, phone, avatarUrl (-> profile.avatar_url)."""
    name: Optional[str] = None
    fullName: Optional[str] = None  # Alias for name
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    avatarUrl: Optional[str] = None  # Written to user_profiles.avatar_url


class UserResponse(BaseModel):
    """Matches frontend UserDto exactly."""
    id: str  # UUID as string
    name: str
    email: str
    phone: Optional[str] = None
    role: Optional[str] = None
    district: Optional[str] = None  # From profile
    profileImageUrl: Optional[str] = None  # From profile avatar_url
    createdAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }


class UserProfileUpdate(BaseModel):
    district: Optional[str] = None
    region: Optional[str] = None
    address_text: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    avatar_url: Optional[str] = None


class UserProfileResponse(BaseModel):
    district: Optional[str] = None
    region: Optional[str] = None
    address_text: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    avatar_url: Optional[str] = None
    
    class Config:
        from_attributes = True
