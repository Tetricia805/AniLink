from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta
from typing import Optional
import hashlib

from app.modules.users.models import User
from app.modules.users.service import UserService
from app.modules.users.repository import UserRepository
from app.modules.auth.models import RefreshToken
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.modules.auth.schemas import RegisterRequest, LoginRequest
from app.modules.users.schemas import UserResponse, UserCreate
from app.modules.users.models import UserRole


def _hash_token(token: str) -> str:
    """Hash a refresh token for storage."""
    return hashlib.sha256(token.encode()).hexdigest()


class AuthService:
    """Service for authentication logic."""
    
    def __init__(self, db: Session):
        self.db = db
        self.user_service = UserService(db)
        self.user_repository = UserRepository(db)
    
    def register(self, register_data: RegisterRequest) -> tuple[User, str, str]:
        """Register a new user and return tokens."""
        # Convert RegisterRequest to UserCreate
        # Keep role as string - UserRepository will convert to enum
        user_create = UserCreate(
            name=register_data.name,
            email=register_data.email,
            password=register_data.password,
            phone=register_data.phone,
            role=register_data.role.upper() if register_data.role else "OWNER",
        )
        # Create user
        user = self.user_service.create_user(user_create)
        
        # Create tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        # Store refresh token
        self._store_refresh_token(user.id, refresh_token)
        
        return user, access_token, refresh_token
    
    def login(self, login_data: LoginRequest) -> tuple[User, str, str]:
        """Login user and return tokens."""
        user = self.user_service.get_user_by_email(login_data.email)
        if not user:
            raise ValueError("Invalid email or password")
        if not getattr(user, "is_active", True):
            raise ValueError("Account is disabled")
        if not verify_password(login_data.password, user.password_hash):
            raise ValueError("Invalid email or password")
        
        # Create tokens
        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        
        # Store refresh token
        self._store_refresh_token(user.id, refresh_token)
        
        return user, access_token, refresh_token
    
    def refresh_access_token(self, refresh_token: str) -> tuple[User, str, str]:
        """Refresh access token using refresh token."""
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise ValueError("Invalid refresh token")
        
        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token payload")
        
        # Verify token exists and not revoked
        token_hash = _hash_token(refresh_token)
        stored_token = (
            self.db.query(RefreshToken)
            .filter(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > datetime.now(timezone.utc),
            )
            .first()
        )
        
        if not stored_token:
            raise ValueError("Invalid or expired refresh token")
        
        # Convert user_id string to UUID for get_user_by_id
        from uuid import UUID
        user_id_uuid = UUID(user_id) if isinstance(user_id, str) else user_id
        user = self.user_service.get_user_by_id(user_id_uuid)
        if not user:
            raise ValueError("User not found")
        
        # Create new tokens
        new_access_token = create_access_token({"sub": str(user.id)})
        new_refresh_token = create_refresh_token({"sub": str(user.id)})
        
        # Revoke old token and store new one
        stored_token.revoked_at = datetime.now(timezone.utc)
        self._store_refresh_token(user.id, new_refresh_token)
        
        return user, new_access_token, new_refresh_token
    
    def logout(self, refresh_token: str) -> bool:
        """Revoke refresh token."""
        token_hash = _hash_token(refresh_token)
        stored_token = (
            self.db.query(RefreshToken)
            .filter(
                RefreshToken.token_hash == token_hash,
                RefreshToken.revoked_at.is_(None),
            )
            .first()
        )
        
        if stored_token:
            stored_token.revoked_at = datetime.now(timezone.utc)
            self.db.commit()
            return True
        return False
    
    def _store_refresh_token(self, user_id, token: str) -> None:
        """Store refresh token in database."""
        from app.core.config import settings
        from uuid import UUID
        
        # Convert user_id to UUID if it's a string
        if isinstance(user_id, str):
            user_id = UUID(user_id)
        # If it's already a UUID, use it directly
        
        token_hash = _hash_token(token)
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
        
        refresh_token = RefreshToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        self.db.add(refresh_token)
        self.db.commit()
    
    def google_login(self, id_token: str) -> tuple[User, str, str]:
        """Verify Google ID token, find or create user, return tokens."""
        from app.core.config import settings
        import secrets

        if not settings.GOOGLE_CLIENT_ID:
            raise ValueError("Google login is not configured")

        try:
            from google.oauth2 import id_token
            from google.auth.transport import requests as google_requests
            payload = id_token.verify_oauth2_token(
                id_token, google_requests.Request(), settings.GOOGLE_CLIENT_ID
            )
        except Exception as e:
            raise ValueError("Invalid Google token") from e

        google_id = payload.get("sub")
        email = payload.get("email")
        name = payload.get("name") or email or "User"
        picture = payload.get("picture")

        if not email:
            raise ValueError("Google account has no email")

        user = self.user_service.get_user_by_email(email)
        if user:
            if not getattr(user, "is_active", True):
                raise ValueError("Account is disabled")
            if not getattr(user, "google_id", None):
                user.google_id = google_id
                self.db.commit()
                self.db.refresh(user)
        else:
            from app.core.security import get_password_hash
            user = User(
                email=email,
                name=name,
                role=UserRole.OWNER,
                is_active=True,
                password_hash=get_password_hash(secrets.token_urlsafe(32)),
                google_id=google_id,
            )
            self.db.add(user)
            self.db.flush()
            from app.modules.users.models import UserProfile
            self.db.add(UserProfile(user_id=user.id))
            self.db.commit()
            self.db.refresh(user)

        access_token = create_access_token({"sub": str(user.id)})
        refresh_token = create_refresh_token({"sub": str(user.id)})
        self._store_refresh_token(user.id, refresh_token)
        return user, access_token, refresh_token

    def _user_to_response(self, user: User) -> UserResponse:
        """Convert User to UserResponse."""
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
