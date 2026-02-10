"""Admin support: is_active, rejection_reason, product flags, platform_settings

Revision ID: 008_admin
Revises: 007_add_vet_user_id_to_cases
Create Date: 2024-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '008_admin'
down_revision: Union[str, None] = '007_vet_user_id_cases'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))
    op.add_column('vets', sa.Column('rejection_reason', sa.String(), nullable=True))
    op.add_column('marketplace_products', sa.Column('is_flagged', sa.Boolean(), nullable=False, server_default='false'))
    op.add_column('marketplace_products', sa.Column('admin_note', sa.String(), nullable=True))

    op.create_table(
        'platform_settings',
        sa.Column('key', sa.String(100), primary_key=True),
        sa.Column('value', sa.Text(), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table('platform_settings')
    op.drop_column('marketplace_products', 'admin_note')
    op.drop_column('marketplace_products', 'is_flagged')
    op.drop_column('vets', 'rejection_reason')
    op.drop_column('users', 'is_active')
