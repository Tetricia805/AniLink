from sqlalchemy import Column, String, DateTime, ForeignKey, Float, Enum as SQLEnum, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum

from app.core.db import Base


class DeliveryOption(str, enum.Enum):
    """Delivery option enumeration."""
    PICKUP = "PICKUP"
    DELIVERY = "DELIVERY"


class OrderStatus(str, enum.Enum):
    """Order status. BACKEND_DESIGN: pending, confirmed, packed, dispatched, delivered, cancelled."""
    pending = "pending"
    confirmed = "confirmed"
    packed = "packed"
    dispatched = "dispatched"
    delivered = "delivered"
    cancelled = "cancelled"


class Order(Base):
    """Order model."""
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    buyer_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    seller_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.pending)
    total_price = Column(Numeric(10, 2), nullable=False)
    delivery_option = Column(SQLEnum(DeliveryOption), nullable=False)
    delivery_address = Column(JSONB, nullable=True)  # Store as JSON but expose as string for frontend
    delivery_district = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    buyer = relationship("User", foreign_keys=[buyer_user_id])
    seller = relationship("User", foreign_keys=[seller_user_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")


class OrderItem(Base):
    """Order item model. seller_id required for seller-order visibility (BACKEND_DESIGN section 9)."""
    __tablename__ = "order_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    order_id = Column(UUID(as_uuid=True), ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    product_id = Column(UUID(as_uuid=True), ForeignKey("marketplace_products.id", ondelete="SET NULL"), nullable=True)
    seller_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    product_name = Column(String(255), nullable=True)
    qty = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    subtotal = Column(Numeric(10, 2), nullable=True)
    
    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
