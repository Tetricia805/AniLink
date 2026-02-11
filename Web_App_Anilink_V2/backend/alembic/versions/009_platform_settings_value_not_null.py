"""Platform settings value NOT NULL

Revision ID: 009_platform_settings
Revises: 008_admin
Create Date: 2024-01-01

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = '009_platform_settings_not_null'
down_revision: Union[str, None] = '008_admin'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.alter_column(
        'platform_settings',
        'value',
        existing_type=sa.Text(),
        nullable=False,
        server_default='',
    )


def downgrade() -> None:
    op.alter_column(
        'platform_settings',
        'value',
        existing_type=sa.Text(),
        nullable=True,
        server_default=None,
    )
