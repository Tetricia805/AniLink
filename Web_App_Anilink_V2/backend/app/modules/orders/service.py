from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

from app.modules.orders.models import Order, OrderItem, OrderStatus, DeliveryOption
from app.modules.orders.repository import OrderRepository
from app.modules.marketplace.models import Product
from app.modules.notifications.models import Notification


class OrderService:
    """Service for order business logic."""
    
    def __init__(self, db: Session):
        self.repository = OrderRepository(db)
        self.db = db
    
    def create_order(self, buyer_user_id: UUID, order_data: dict) -> Order:
        """Create a new order."""
        items = order_data["items"]
        
        # Get seller from first product
        first_product_id = UUID(items[0]["productId"])
        first_product = self.db.query(Product).filter(Product.id == first_product_id).first()
        if not first_product:
            raise ValueError("Product not found")
        
        seller_user_id = first_product.seller_user_id
        
        # Calculate total
        total = Decimal(0)
        order_items_data = []
        for item_data in items:
            product_id = UUID(item_data["productId"])
            product = self.db.query(Product).filter(Product.id == product_id).first()
            if not product:
                raise ValueError(f"Product {product_id} not found")
            
            # Verify all items are from same seller
            if product.seller_user_id != seller_user_id:
                raise ValueError("All products must be from the same seller")
            
            quantity = item_data["quantity"]
            price = Decimal(str(item_data["price"]))
            subtotal = price * quantity
            total += subtotal
            order_items_data.append({
                "product_id": product_id,
                "seller_id": product.seller_user_id,
                "product_name": product.title,
                "qty": quantity,
                "unit_price": price,
                "subtotal": subtotal,
            })
        
        # Create order
        order_dict = {
            "buyer_user_id": buyer_user_id,
            "seller_user_id": seller_user_id,
            "total_price": total,
            "delivery_option": DeliveryOption[order_data["deliveryType"]],
            "delivery_district": order_data.get("deliveryDistrict"),
            "delivery_address": {"address": order_data.get("deliveryAddress")} if order_data.get("deliveryAddress") else None,
            "status": OrderStatus.pending,
        }
        
        order = self.repository.create(order_dict)
        self.db.flush()
        
        # Create order items
        for item_data in order_items_data:
            order_item = OrderItem(
                order_id=order.id,
                **item_data,
            )
            self.db.add(order_item)

        # Notify seller of new order
        seller_notification = Notification(
            user_id=seller_user_id,
            type="ORDER",
            title="New order",
            message=f"A customer has placed an order. Order total: UGX {float(total):,.0f}.",
            payload={
                "entity_type": "order",
                "entity_id": str(order.id),
                "action_url": f"/seller/orders?focus={order.id}",
            },
            read=False,
        )
        self.db.add(seller_notification)

        self.db.commit()
        self.db.refresh(order)
        return order
    
    def get_user_orders(self, user_id: UUID, status: Optional[str] = None) -> List[Order]:
        """Get orders for a user (both as buyer and seller)."""
        return self.repository.get_user_orders(user_id, status)

    def get_orders_for_buyer(self, buyer_id: UUID, status: Optional[str] = None) -> List[Order]:
        """BACKEND_DESIGN: GET /orders (owner) = list for owner as buyer only."""
        return self.repository.get_orders_for_buyer(buyer_id, status)
    
    def get_order(self, order_id: UUID) -> Optional[Order]:
        """Get order by ID."""
        return self.repository.get_by_id(order_id)
    
    def cancel_order(self, order_id: UUID, user_id: UUID) -> Order:
        """Cancel an order."""
        order = self.repository.get_by_id(order_id)
        if not order:
            raise ValueError("Order not found")
        
        # Authorization: buyer or seller can cancel
        if order.buyer_user_id != user_id and order.seller_user_id != user_id:
            raise ValueError("Not authorized to cancel this order")
        
        # Only pending or confirmed orders can be cancelled
        if order.status not in [OrderStatus.pending, OrderStatus.confirmed]:
            raise ValueError(f"Cannot cancel order with status {order.status.value}")
        
        order.status = OrderStatus.cancelled
        self.db.commit()
        self.db.refresh(order)
        return order
