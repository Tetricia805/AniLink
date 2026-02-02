from sqlalchemy.orm import Session
from sqlalchemy import and_
from typing import List, Optional
from uuid import UUID

from app.modules.orders.models import Order, OrderItem, OrderStatus


class OrderRepository:
    """Repository for order operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, order_data: dict) -> Order:
        """Create a new order."""
        order = Order(**order_data)
        self.db.add(order)
        return order
    
    def get_by_id(self, order_id: UUID) -> Optional[Order]:
        """Get order by ID."""
        return self.db.query(Order).filter(Order.id == order_id).first()
    
    def get_user_orders(
        self,
        user_id: UUID,
        status: Optional[str] = None,
    ) -> List[Order]:
        """Get orders for a user (both as buyer and seller)."""
        query = self.db.query(Order).filter(
            (Order.buyer_user_id == user_id) | (Order.seller_user_id == user_id)
        )
        if status:
            try:
                status_enum = OrderStatus(status.lower())
                query = query.filter(Order.status == status_enum)
            except (KeyError, ValueError):
                pass
        return query.order_by(Order.created_at.desc()).all()

    def get_orders_for_buyer(
        self,
        buyer_id: UUID,
        status: Optional[str] = None,
    ) -> List[Order]:
        """BACKEND_DESIGN: GET /orders (owner) = list for owner as buyer only."""
        query = self.db.query(Order).filter(Order.buyer_user_id == buyer_id)
        if status:
            try:
                status_enum = OrderStatus(status.lower())
                query = query.filter(Order.status == status_enum)
            except (KeyError, ValueError):
                pass
        return query.order_by(Order.created_at.desc()).all()

    def get_orders_for_seller(
        self,
        seller_id: UUID,
        status: Optional[str] = None,
    ) -> List[Order]:
        """
        BACKEND_DESIGN 9: Orders that contain at least one order_item whose seller_id = seller_id.
        """
        subq = (
            self.db.query(OrderItem.order_id)
            .filter(OrderItem.seller_id == seller_id)
            .distinct()
        )
        query = self.db.query(Order).filter(Order.id.in_(subq))
        if status:
            try:
                status_enum = OrderStatus(status.lower())
                query = query.filter(Order.status == status_enum)
            except (KeyError, ValueError):
                pass
        return query.order_by(Order.created_at.desc()).all()

    def get_order_items_for_seller(self, order_id: UUID, seller_id: UUID) -> List[OrderItem]:
        """BACKEND_DESIGN 9: Only order_items where seller_id = seller_id (no leakage)."""
        return (
            self.db.query(OrderItem)
            .filter(
                OrderItem.order_id == order_id,
                OrderItem.seller_id == seller_id,
            )
            .all()
        )
