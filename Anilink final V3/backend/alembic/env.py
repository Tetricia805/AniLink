from logging.config import fileConfig
from sqlalchemy import engine_from_config
from sqlalchemy import pool
from alembic import context
import os
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Import base and all models
from app.core.db import Base
from app.core.config import settings

# Import all models to ensure they're registered (order matters for relationships)
from app.modules.users.models import User, UserProfile
from app.modules.auth.models import RefreshToken, PasswordResetToken
from app.modules.vets.models import Vet, VetAvailabilitySlot
from app.modules.animals.models import Animal
from app.modules.cases.models import Case, CaseImage
from app.modules.ai.models import AIAssessment
from app.modules.ai_scan.models import ScanRecord
from app.modules.bookings.models import Booking
from app.modules.orders.models import Order, OrderItem  # Import before Product
from app.modules.marketplace.models import Product, ProductImage
from app.modules.notifications.models import Notification, DeviceToken
from app.modules.seller.models import SellerProfile
from app.modules.admin.models import PlatformSettings

# this is the Alembic Config object
config = context.config

# Interpret the config file for Python logging.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set SQLAlchemy URL from settings
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# add your model's MetaData object here for 'autogenerate' support
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
