"""Product is_active and order_items seller_id (BACKEND_DESIGN section 9)

Revision ID: 002_product_visibility
Revises: 001_initial
Create Date: 2025-01-01 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "002_product_visibility"
down_revision: Union[str, None] = "001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # marketplace_products: add is_active (BACKEND_DESIGN: only is_verified AND is_active for owner)
    op.add_column(
        "marketplace_products",
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
    )

    # order_items: add seller_id, product_name, subtotal for seller-order visibility
    op.add_column(
        "order_items",
        sa.Column("seller_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "order_items",
        sa.Column("product_name", sa.String(255), nullable=True),
    )
    op.add_column(
        "order_items",
        sa.Column("subtotal", sa.Numeric(10, 2), nullable=True),
    )
    op.create_foreign_key(
        "fk_order_items_seller_id",
        "order_items",
        "users",
        ["seller_id"],
        ["id"],
        ondelete="CASCADE",
    )
    op.create_index("ix_order_items_seller_id", "order_items", ["seller_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_order_items_seller_id", table_name="order_items")
    op.drop_constraint("fk_order_items_seller_id", "order_items", type_="foreignkey")
    op.drop_column("order_items", "subtotal")
    op.drop_column("order_items", "product_name")
    op.drop_column("order_items", "seller_id")
    op.drop_column("marketplace_products", "is_active")
