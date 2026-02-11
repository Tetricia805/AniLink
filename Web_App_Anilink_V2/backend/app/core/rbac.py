"""
RBAC: require specific roles for routes.
BACKEND_DESIGN.md section 5 & 9: Owner cannot call /seller/*; Seller cannot call /admin/*; etc.
"""
from typing import List
from fastapi import Depends, HTTPException, status

from app.modules.users.models import User, UserRole
from app.core.security import get_current_user


def require_roles(allowed_roles: List[UserRole]):
    """
    Dependency: current user must have one of the allowed roles.
    Use after get_current_user. Example: Depends(require_roles([UserRole.OWNER]))
    """

    def _check(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized for this resource",
            )
        return current_user

    return _check


def require_owner(current_user: User = Depends(get_current_user)) -> User:
    """OWNER only."""
    if current_user.role != UserRole.OWNER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Owner only")
    return current_user


def require_seller(current_user: User = Depends(get_current_user)) -> User:
    """SELLER only. Owner must not call seller endpoints."""
    if current_user.role != UserRole.SELLER:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Seller only")
    return current_user


def require_vet(current_user: User = Depends(get_current_user)) -> User:
    """VET only."""
    if current_user.role != UserRole.VET:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Vet only")
    return current_user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """ADMIN only."""
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    return current_user
