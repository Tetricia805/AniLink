from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.modules.users.schemas import UserResponse


class RegisterRequest(BaseModel):
    """Matches frontend RegisterRequestDto exactly."""
    name: str
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    role: str = "OWNER"  # OWNER, VET, SELLER


class LoginRequest(BaseModel):
    """Matches frontend LoginRequestDto exactly."""
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    """Request schema for token refresh - matches frontend."""
    refreshToken: str  # Frontend sends refreshToken (camelCase)


class AuthResponse(BaseModel):
    """Matches frontend AuthResponseDto exactly."""
    accessToken: str
    refreshToken: str
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)  # min 8 chars; optional: require digit via pattern


class VerifyTokenRequest(BaseModel):
    token: str


class GoogleLoginRequest(BaseModel):
    id_token: str
