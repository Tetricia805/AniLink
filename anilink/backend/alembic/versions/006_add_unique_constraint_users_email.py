"""Add UNIQUE constraint on users.email

Revision ID: 006_unique_users_email
Revises: 005_vet_profile_availability
Create Date: 2025-01-01 00:00:06.000000

Enforces one row per email at DB level. Model already declared unique=True;
initial migration created only a non-unique index. No data changes.
"""
from typing import Sequence, Union

from alembic import op

revision: str = "006_unique_users_email"
down_revision: Union[str, None] = "005_vet_profile_availability"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Replace non-unique index with unique constraint (ensures one row per email)
    op.drop_index("ix_users_email", table_name="users")
    op.create_unique_constraint("uq_users_email", "users", ["email"])


def downgrade() -> None:
    op.drop_constraint("uq_users_email", "users", type_="unique")
    op.create_index("ix_users_email", "users", ["email"], unique=False)
