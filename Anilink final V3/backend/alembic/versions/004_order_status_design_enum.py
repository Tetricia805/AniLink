"""Order status enum: design values pending, confirmed, packed, dispatched, delivered, cancelled

Revision ID: 004_order_status_design
Revises: 003_seller_profiles
Create Date: 2025-01-01 00:00:02.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "004_order_status_design"
down_revision: Union[str, None] = "003_seller_profiles"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create new enum with design values
    order_status_new = postgresql.ENUM(
        "pending", "confirmed", "packed", "dispatched", "delivered", "cancelled",
        name="order_status_new",
        create_type=True,
    )
    order_status_new.create(op.get_bind(), checkfirst=True)

    # Drop default, alter column to use new type with mapping from old enum
    op.execute("ALTER TABLE orders ALTER COLUMN status DROP DEFAULT")
    op.execute("""
        ALTER TABLE orders ALTER COLUMN status TYPE order_status_new
        USING (
            CASE status::text
                WHEN 'REQUESTED' THEN 'pending'::order_status_new
                WHEN 'ACCEPTED' THEN 'confirmed'::order_status_new
                WHEN 'PACKED' THEN 'packed'::order_status_new
                WHEN 'DISPATCHED' THEN 'dispatched'::order_status_new
                WHEN 'FULFILLED' THEN 'delivered'::order_status_new
                WHEN 'CANCELLED' THEN 'cancelled'::order_status_new
                WHEN 'REJECTED' THEN 'cancelled'::order_status_new
                ELSE 'pending'::order_status_new
            END
        )
    """)
    op.execute("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'pending'::order_status_new")

    # Drop old enum and rename new one
    op.execute("DROP TYPE orderstatus")
    op.execute("ALTER TYPE order_status_new RENAME TO orderstatus")


def downgrade() -> None:
    # Recreate old enum and migrate back (simplified: map all to REQUESTED)
    op.execute("CREATE TYPE orderstatus_old AS ENUM ('REQUESTED', 'ACCEPTED', 'REJECTED', 'PACKED', 'DISPATCHED', 'FULFILLED', 'CANCELLED')")
    op.execute("ALTER TABLE orders ALTER COLUMN status DROP DEFAULT")
    op.execute("""
        ALTER TABLE orders ALTER COLUMN status TYPE orderstatus_old
        USING (
            CASE status::text
                WHEN 'pending' THEN 'REQUESTED'::orderstatus_old
                WHEN 'confirmed' THEN 'ACCEPTED'::orderstatus_old
                WHEN 'packed' THEN 'PACKED'::orderstatus_old
                WHEN 'dispatched' THEN 'DISPATCHED'::orderstatus_old
                WHEN 'delivered' THEN 'FULFILLED'::orderstatus_old
                WHEN 'cancelled' THEN 'CANCELLED'::orderstatus_old
                ELSE 'REQUESTED'::orderstatus_old
            END
        )
    """)
    op.execute("ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'REQUESTED'::orderstatus_old")
    op.execute("DROP TYPE orderstatus")
    op.execute("ALTER TYPE orderstatus_old RENAME TO orderstatus")
