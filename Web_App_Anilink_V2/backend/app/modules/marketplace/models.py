from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Boolean, Integer, Numeric, Enum as SQLEnum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.db import Base


class ProductCategory(str, enum.Enum):
    """Product category enumeration."""
    ANIMAL = "ANIMAL"
    FEED = "FEED"
    MEDICINE = "MEDICINE"
    EQUIPMENT = "EQUIPMENT"
    ACCESSORY = "ACCESSORY"


class Product(Base):
    """Marketplace product model."""
    __tablename__ = "marketplace_products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    seller_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(SQLEnum(ProductCategory), nullable=False)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    currency = Column(String, default="UGX")
    stock_qty = Column(Integer, default=0)
    location_lat = Column(Float, nullable=True)
    location_lng = Column(Float, nullable=True)
    district = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    verified = Column(Boolean, default=False)
    recommended = Column(Boolean, default=False)
    is_flagged = Column(Boolean, default=False, nullable=False)
    admin_note = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    seller = relationship("User", foreign_keys=[seller_user_id])
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="product")


class ProductImage(Base):
    """Product image model."""
    __tablename__ = "product_images"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    product_id = Column(UUID(as_uuid=True), ForeignKey("marketplace_products.id", ondelete="CASCADE"), nullable=False, index=True)
    image_url = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    product = relationship("Product", back_populates="images")
