from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.modules.users.models import User, UserProfile
from app.modules.users.repository import UserRepository
from app.modules.users.schemas import UserCreate, UserUpdate, UserProfileUpdate


class UserService:
    """Service for user business logic."""
    
    def __init__(self, db: Session):
        self.repository = UserRepository(db)
        self.db = db
    
    def create_user(self, user_data: UserCreate) -> User:
        """Create a new user."""
        # Check if user exists
        if self.repository.get_by_email(user_data.email):
            raise ValueError("User with this email already exists")
        
        if user_data.phone and self.repository.get_by_phone(user_data.phone):
            raise ValueError("User with this phone already exists")
        
        user = self.repository.create(user_data.model_dump())
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.repository.get_by_email(email)
    
    def get_user_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return self.repository.get_by_id(user_id)
    
    def update_user(self, user_id: UUID, user_data: UserUpdate) -> User:
        """Update user (name, phone, email). avatarUrl is written to user_profiles.avatar_url."""
        user = self.repository.get_by_id(user_id)
        if not user:
            raise ValueError("User not found")
        
        data = user_data.model_dump(exclude_unset=True)
        avatar_url = data.pop("avatarUrl", None)
        if "fullName" in data:
            data["name"] = data.pop("fullName")
        if avatar_url is not None:
            self.repository.update_profile(user_id, {"avatar_url": avatar_url})
        update_data = {k: v for k, v in data.items() if hasattr(user, k) and k != "avatarUrl"}
        if update_data:
            user = self.repository.update(user, update_data)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_user_profile(self, user_id: UUID, profile_data: UserProfileUpdate) -> UserProfile:
        """Update user profile."""
        profile = self.repository.update_profile(user_id, profile_data.model_dump(exclude_unset=True))
        self.db.commit()
        self.db.refresh(profile)
        return profile
