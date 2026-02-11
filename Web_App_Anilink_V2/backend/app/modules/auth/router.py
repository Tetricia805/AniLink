from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import get_current_user
from app.modules.auth.schemas import (
    RegisterRequest,
    LoginRequest,
    RefreshTokenRequest,
    AuthResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyTokenRequest,
    GoogleLoginRequest,
)
from app.modules.auth.service import AuthService
from app.modules.users.schemas import UserResponse
from app.modules.users.models import User

router = APIRouter()


def _user_to_response(user: User, db: Session = None) -> UserResponse:
    """Convert User to UserResponse matching frontend UserDto (id, name, email, role, phone?, profileImageUrl?)."""
    profile_image_url = None
    district = None
    if user.profile:
        profile_image_url = user.profile.avatar_url
        district = user.profile.district
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


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(
    request: RegisterRequest,
    db: Session = Depends(get_db),
):
    """
    Register a new user.
    Matches frontend: POST /auth/register
    """
    try:
        service = AuthService(db)
        user, access_token, refresh_token = service.register(request)
        
        return AuthResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
            user=_user_to_response(user, db),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        import traceback
        print(f"Registration error: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Registration failed: {str(e)}",
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    Login user.
    Matches frontend: POST /auth/login
    """
    try:
        service = AuthService(db)
        user, access_token, refresh_token = service.login(request)
        
        return AuthResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
            user=_user_to_response(user, db),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.post("/refresh", response_model=AuthResponse)
async def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Refresh access token.
    Matches frontend: POST /auth/refresh
    """
    try:
        service = AuthService(db)
        user, access_token, refresh_token = service.refresh_access_token(
            request.refreshToken
        )
        
        return AuthResponse(
            accessToken=access_token,
            refreshToken=refresh_token,
            user=_user_to_response(user, db),
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
        )


@router.get("/me", response_model=UserResponse)
async def me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Get current authenticated user. Matches frontend: GET /auth/me
    Returns UserDto: id, name, email, role, phone?, profileImageUrl?
    """
    return _user_to_response(current_user, db)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Logout user (revoke refresh token). Matches frontend: POST /auth/logout
    """
    service = AuthService(db)
    success = service.logout(request.refreshToken)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid refresh token",
        )


@router.post("/password/forgot")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    """Request password reset. Always returns 200 generic message (no account existence leak)."""
    from app.modules.users.repository import UserRepository
    from app.modules.auth.password_reset import create_reset_token
    from app.core.mailer import send_password_reset_email
    from app.core.config import settings

    repo = UserRepository(db)
    user = repo.get_by_email(request.email)
    if user and getattr(user, "is_active", True):
        raw_token = create_reset_token(db, user)
        if raw_token:
            reset_link = f"{settings.FRONTEND_URL}/reset-password?token={raw_token}"
            send_password_reset_email(user.email, reset_link)
    return {"message": "If that email exists, we sent a reset link."}


@router.post("/password/verify")
async def verify_reset_token(
    request: VerifyTokenRequest,
    db: Session = Depends(get_db),
):
    """Verify password reset token. Returns { valid: true/false }."""
    from app.modules.auth.password_reset import verify_reset_token as verify

    valid = verify(db, request.token)
    return {"valid": valid}


@router.post("/password/reset")
async def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    """Reset password using token."""
    from app.modules.auth.password_reset import consume_reset_token

    if len(request.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters")
    if not consume_reset_token(db, request.token, request.new_password):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    return {"message": "Password updated"}


@router.post("/google", response_model=AuthResponse)
async def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    """Login or register via Google ID token."""
    user, access_token, refresh_token = AuthService(db).google_login(request.id_token)
    return AuthResponse(
        accessToken=access_token,
        refreshToken=refresh_token,
        user=_user_to_response(user, db),
    )
