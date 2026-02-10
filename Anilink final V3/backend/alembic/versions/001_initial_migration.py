"""Initial migration

Revision ID: 001_initial
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '001_initial'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('role', sa.Enum('OWNER', 'VET', 'SELLER', 'ADMIN', name='userrole'), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('phone', sa.String(), nullable=True),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_users_email', 'users', ['email'])
    
    # User profiles table
    op.create_table(
        'user_profiles',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('district', sa.String(), nullable=True),
        sa.Column('region', sa.String(), nullable=True),
        sa.Column('address_text', sa.String(), nullable=True),
        sa.Column('lat', sa.Float(), nullable=True),
        sa.Column('lng', sa.Float(), nullable=True),
        sa.Column('avatar_url', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    # Refresh tokens table
    op.create_table(
        'refresh_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token_hash', sa.String(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('revoked_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_refresh_tokens_user_id', 'refresh_tokens', ['user_id'])
    op.create_index('ix_refresh_tokens_token_hash', 'refresh_tokens', ['token_hash'], unique=True)
    
    # Vets table
    op.create_table(
        'vets',
        sa.Column('user_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('clinic_name', sa.String(), nullable=False),
        sa.Column('license_number', sa.String(), nullable=True),
        sa.Column('services', postgresql.JSONB(), nullable=True),
        sa.Column('specializations', postgresql.JSONB(), nullable=True),
        sa.Column('is_24_7', sa.Boolean(), default=False),
        sa.Column('farm_visits', sa.Boolean(), default=False),
        sa.Column('avg_rating', sa.Float(), default=0.0),
        sa.Column('review_count', sa.Integer(), default=0),
        sa.Column('location_lat', sa.Float(), nullable=False),
        sa.Column('location_lng', sa.Float(), nullable=False),
        sa.Column('address', sa.String(), nullable=True),
        sa.Column('district', sa.String(), nullable=True),
        sa.Column('verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    
    # Vet availability slots table
    op.create_table(
        'vet_availability_slots',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('vet_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('day_of_week', sa.Integer(), nullable=False),
        sa.Column('start_time', sa.String(), nullable=False),
        sa.Column('end_time', sa.String(), nullable=False),
        sa.Column('slot_minutes', sa.Integer(), default=60),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['vet_user_id'], ['vets.user_id'], ondelete='CASCADE'),
    )
    
    # Animals table
    op.create_table(
        'animals',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('breed', sa.String(), nullable=True),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('sex', sa.String(), nullable=True),
        sa.Column('dob_estimated', sa.Date(), nullable=True),
        sa.Column('color', sa.String(), nullable=True),
        sa.Column('tag_number', sa.String(), nullable=True),
        sa.Column('photo_url', sa.String(), nullable=True),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('vaccination_records', postgresql.JSONB(), nullable=True),
        sa.Column('treatment_records', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_animals_owner_user_id', 'animals', ['owner_user_id'])
    
    # Cases table
    op.create_table(
        'cases',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('animal_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('animal_type', sa.String(), nullable=False),
        sa.Column('suspected_disease', sa.String(), default='FMD'),
        sa.Column('symptoms', postgresql.JSONB(), nullable=False),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('lat', sa.Float(), nullable=True),
        sa.Column('lng', sa.Float(), nullable=True),
        sa.Column('location', sa.String(), nullable=True),
        sa.Column('district', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('SUBMITTED', 'UNDER_REVIEW', 'CLOSED', name='casestatus'), default='SUBMITTED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['animal_id'], ['animals.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_cases_owner_user_id', 'cases', ['owner_user_id'])
    op.create_index('ix_cases_animal_id', 'cases', ['animal_id'])
    
    # Case images table
    op.create_table(
        'case_images',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('image_url', sa.String(), nullable=False),
        sa.Column('meta', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_case_images_case_id', 'case_images', ['case_id'])
    
    # AI assessments table
    op.create_table(
        'ai_assessments',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=False, unique=True),
        sa.Column('model_version', sa.String(), nullable=True),
        sa.Column('prediction_label', sa.Enum('FMD', 'NOT_FMD', 'UNCLEAR', 'PENDING', name='predictionlabel'), default='PENDING'),
        sa.Column('confidence', sa.Float(), nullable=True),
        sa.Column('severity', sa.Enum('LOW', 'MEDIUM', 'EMERGENCY', name='severity'), nullable=True),
        sa.Column('explanation', postgresql.JSONB(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_ai_assessments_case_id', 'ai_assessments', ['case_id'], unique=True)
    
    # Bookings table
    op.create_table(
        'bookings',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('owner_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('vet_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('case_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('visit_type', sa.Enum('CLINIC', 'FARM', name='visittype'), nullable=False),
        sa.Column('scheduled_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.Enum('REQUESTED', 'CONFIRMED', 'DECLINED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', name='bookingstatus'), default='REQUESTED'),
        sa.Column('notes', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['owner_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['vet_user_id'], ['vets.user_id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_bookings_owner_user_id', 'bookings', ['owner_user_id'])
    op.create_index('ix_bookings_vet_user_id', 'bookings', ['vet_user_id'])
    
    # Marketplace products table
    op.create_table(
        'marketplace_products',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('seller_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('category', sa.Enum('ANIMAL', 'FEED', 'MEDICINE', 'EQUIPMENT', 'ACCESSORY', name='productcategory'), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('currency', sa.String(), default='UGX'),
        sa.Column('stock_qty', sa.Integer(), default=0),
        sa.Column('location_lat', sa.Float(), nullable=True),
        sa.Column('location_lng', sa.Float(), nullable=True),
        sa.Column('district', sa.String(), nullable=True),
        sa.Column('verified', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['seller_user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_marketplace_products_seller_user_id', 'marketplace_products', ['seller_user_id'])
    
    # Product images table
    op.create_table(
        'product_images',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('image_url', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['product_id'], ['marketplace_products.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_product_images_product_id', 'product_images', ['product_id'])
    
    # Orders table
    op.create_table(
        'orders',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('buyer_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('seller_user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.Enum('REQUESTED', 'ACCEPTED', 'REJECTED', 'FULFILLED', 'CANCELLED', name='orderstatus'), default='REQUESTED'),
        sa.Column('total_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('delivery_option', sa.Enum('PICKUP', 'DELIVERY', name='deliveryoption'), nullable=False),
        sa.Column('delivery_address', postgresql.JSONB(), nullable=True),
        sa.Column('delivery_district', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['buyer_user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['seller_user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_orders_buyer_user_id', 'orders', ['buyer_user_id'])
    op.create_index('ix_orders_seller_user_id', 'orders', ['seller_user_id'])
    
    # Order items table
    op.create_table(
        'order_items',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('order_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('product_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('qty', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.ForeignKeyConstraint(['order_id'], ['orders.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['product_id'], ['marketplace_products.id'], ondelete='SET NULL'),
    )
    op.create_index('ix_order_items_order_id', 'order_items', ['order_id'])
    
    # Notifications table
    op.create_table(
        'notifications',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(), nullable=True),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('message', sa.String(), nullable=False),
        sa.Column('payload', postgresql.JSONB(), nullable=True),
        sa.Column('read', sa.Boolean(), default=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])
    
    # Device tokens table
    op.create_table(
        'device_tokens',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('platform', sa.Enum('ANDROID', 'IOS', name='deviceplatform'), nullable=False),
        sa.Column('fcm_token', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
    )
    op.create_index('ix_device_tokens_user_id', 'device_tokens', ['user_id'])
    op.create_index('ix_device_tokens_fcm_token', 'device_tokens', ['fcm_token'], unique=True)


def downgrade() -> None:
    op.drop_table('device_tokens')
    op.drop_table('notifications')
    op.drop_table('order_items')
    op.drop_table('orders')
    op.drop_table('product_images')
    op.drop_table('marketplace_products')
    op.drop_table('bookings')
    op.drop_table('ai_assessments')
    op.drop_table('case_images')
    op.drop_table('cases')
    op.drop_table('animals')
    op.drop_table('vet_availability_slots')
    op.drop_table('vets')
    op.drop_table('refresh_tokens')
    op.drop_table('user_profiles')
    op.drop_table('users')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS deviceplatform')
    op.execute('DROP TYPE IF EXISTS orderstatus')
    op.execute('DROP TYPE IF EXISTS deliveryoption')
    op.execute('DROP TYPE IF EXISTS productcategory')
    op.execute('DROP TYPE IF EXISTS bookingstatus')
    op.execute('DROP TYPE IF EXISTS visittype')
    op.execute('DROP TYPE IF EXISTS severity')
    op.execute('DROP TYPE IF EXISTS predictionlabel')
    op.execute('DROP TYPE IF EXISTS casestatus')
    op.execute('DROP TYPE IF EXISTS userrole')
