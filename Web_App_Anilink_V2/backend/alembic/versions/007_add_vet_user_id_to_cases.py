"""Add vet_user_id to cases for vet assignment

Revision ID: 007_vet_user_id_cases
Revises: 006_unique_users_email
Create Date: 2025-01-01 00:00:07.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "007_vet_user_id_cases"
down_revision: Union[str, None] = "006_unique_users_email"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "cases",
        sa.Column("vet_user_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.create_index("ix_cases_vet_user_id", "cases", ["vet_user_id"])
    op.create_foreign_key(
        "fk_cases_vet_user_id",
        "cases",
        "users",
        ["vet_user_id"],
        ["id"],
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_cases_vet_user_id", "cases", type_="foreignkey")
    op.drop_index("ix_cases_vet_user_id", table_name="cases")
    op.drop_column("cases", "vet_user_id")
