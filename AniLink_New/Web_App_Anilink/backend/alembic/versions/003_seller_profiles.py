"""Seller profiles table (BACKEND_DESIGN section 2)

Revision ID: 003_seller_profiles
Revises: 002_product_visibility
Create Date: 2025-01-01 00:00:01.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "003_seller_profiles"
down_revision: Union[str, None] = "002_product_visibility"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Seller profiles (BACKEND_DESIGN section 2)
    op.create_table(
        "seller_profiles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("store_name", sa.String(255), nullable=True),
        sa.Column("contact_email", sa.String(255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_seller_profiles_user_id", "seller_profiles", ["user_id"], unique=True)

    # marketplace_products.recommended (BACKEND_DESIGN)
    op.add_column(
        "marketplace_products",
        sa.Column("recommended", sa.Boolean(), nullable=False, server_default="false"),
    )

    # orderstatus: add PACKED, DISPATCHED for seller flow (design: confirmed|packed|dispatched|delivered)
    op.execute("ALTER TYPE orderstatus ADD VALUE 'PACKED'")
    op.execute("ALTER TYPE orderstatus ADD VALUE 'DISPATCHED'")


def downgrade() -> None:
    op.drop_column("marketplace_products", "recommended")
    op.drop_index("ix_seller_profiles_user_id", table_name="seller_profiles")
    op.drop_table("seller_profiles")
    # Note: PostgreSQL does not support removing enum values easily; leave PACKED, DISPATCHED
