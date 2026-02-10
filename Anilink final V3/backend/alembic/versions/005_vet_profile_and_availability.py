"""Vet profile: nullable lat/lng, location_label; vet_availability table with weekly_schedule JSON

Revision ID: 005_vet_profile_availability
Revises: 004_order_status_design
Create Date: 2025-01-01 00:00:05.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "005_vet_profile_availability"
down_revision: Union[str, None] = "004_order_status_design"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Vets: make location_lat, location_lng nullable; add location_label
    op.alter_column(
        "vets",
        "location_lat",
        existing_type=sa.Float(),
        nullable=True,
    )
    op.alter_column(
        "vets",
        "location_lng",
        existing_type=sa.Float(),
        nullable=True,
    )
    op.add_column("vets", sa.Column("location_label", sa.String(), nullable=True))

    # Vet availability: one row per vet, weekly_schedule JSON + toggles
    op.create_table(
        "vet_availability",
        sa.Column("user_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("accept_farm_visits", sa.Boolean(), default=False),
        sa.Column("is_emergency_247", sa.Boolean(), default=False),
        sa.Column("weekly_schedule", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )


def downgrade() -> None:
    op.drop_table("vet_availability")
    op.drop_column("vets", "location_label")
    op.alter_column(
        "vets",
        "location_lat",
        existing_type=sa.Float(),
        nullable=False,
    )
    op.alter_column(
        "vets",
        "location_lng",
        existing_type=sa.Float(),
        nullable=False,
    )
