"""Add scan_records table for FMD scan persistence

Revision ID: 011_scan_records
Revises: 010_password_reset
Create Date: 2025-02-09

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = '011_scan_records'
down_revision: Union[str, None] = '010_password_reset'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'scan_records',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('animal_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('scan_type', sa.String(32), nullable=False),
        sa.Column('threshold_used', sa.Float(), nullable=False),
        sa.Column('cattle_prob', sa.Float(), nullable=False),
        sa.Column('non_cattle_prob', sa.Float(), nullable=False),
        sa.Column('passed_gate', sa.Boolean(), nullable=False),
        sa.Column('gate_rule', sa.String(256), nullable=True),
        sa.Column('fmd_label', sa.String(32), nullable=True),
        sa.Column('fmd_confidence', sa.Float(), nullable=True),
        sa.Column('raw_json', postgresql.JSONB(), nullable=True),
        sa.Column('image_ref', sa.String(512), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['animal_id'], ['animals.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_scan_records_user_id', 'scan_records', ['user_id'])
    op.create_index('ix_scan_records_animal_id', 'scan_records', ['animal_id'])
    op.create_index('ix_scan_records_created_at', 'scan_records', ['created_at'])


def downgrade() -> None:
    op.drop_index('ix_scan_records_created_at', 'scan_records')
    op.drop_index('ix_scan_records_animal_id', 'scan_records')
    op.drop_index('ix_scan_records_user_id', 'scan_records')
    op.drop_table('scan_records')
