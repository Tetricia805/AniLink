from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.modules.users.models import User, UserProfile, UserRole
from app.core.security import get_password_hash


class UserRepository:
    """Repository for user operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, user_data: dict) -> User:
        """Create a new user."""
        # Convert role string to UserRole enum if needed
        if "role" in user_data and isinstance(user_data["role"], str):
            user_data["role"] = UserRole(user_data["role"].upper())
        
        user_data["password_hash"] = get_password_hash(user_data.pop("password"))
        user = User(**user_data)
        self.db.add(user)
        self.db.flush()
        
        # Create user profile
        profile = UserProfile(user_id=user.id)
        self.db.add(profile)
        
        return user
    
    def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email."""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_id(self, user_id: UUID) -> Optional[User]:
        """Get user by ID."""
        return self.db.query(User).filter(User.id == user_id).first()
    
    def get_by_phone(self, phone: str) -> Optional[User]:
        """Get user by phone."""
        return self.db.query(User).filter(User.phone == phone).first()
    
    def update(self, user: User, user_data: dict) -> User:
        """Update user."""
        for key, value in user_data.items():
            if hasattr(user, key):
                setattr(user, key, value)
        return user
    
    def update_profile(self, user_id: UUID, profile_data: dict) -> UserProfile:
        """Update user profile."""
        profile = self.db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
        if not profile:
            profile = UserProfile(user_id=user_id, **profile_data)
            self.db.add(profile)
        else:
            for key, value in profile_data.items():
                if hasattr(profile, key):
                    setattr(profile, key, value)
        return profile
