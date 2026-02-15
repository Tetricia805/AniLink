"""Password reset logic: create token, verify, consume."""
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from uuid import uuid4

from sqlalchemy.orm import Session

from app.modules.users.models import User
from app.modules.auth.models import PasswordResetToken
from app.core.security import get_password_hash


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def create_reset_token(db: Session, user: User) -> str | None:
    """Create a password reset token for user. Returns raw token (to send in email) or None if rate limited."""
    # Rate limit: no new token if one was created in last 60 seconds
    recent = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.created_at >= datetime.now(timezone.utc) - timedelta(seconds=60),
        )
        .first()
    )
    if recent:
        return None

    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=30)
    record = PasswordResetToken(
        id=uuid4(),
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(record)
    db.commit()
    return raw_token


def verify_reset_token(db: Session, raw_token: str) -> bool:
    """Check if token is valid (exists, not used, not expired)."""
    token_hash = _hash_token(raw_token)
    record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    return record is not None


def consume_reset_token(db: Session, raw_token: str, new_password: str) -> bool:
    """Verify token, update user password, mark token used. Returns True on success."""
    token_hash = _hash_token(raw_token)
    record = (
        db.query(PasswordResetToken)
        .filter(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used_at.is_(None),
            PasswordResetToken.expires_at > datetime.now(timezone.utc),
        )
        .first()
    )
    if not record:
        return False

    user = db.query(User).filter(User.id == record.user_id).first()
    if not user:
        return False

    user.password_hash = get_password_hash(new_password)
    record.used_at = datetime.now(timezone.utc)
    db.commit()
    return True
