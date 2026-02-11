from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_active_user
from app.modules.users.models import User
from app.modules.orders.schemas import OrderCreate, OrderResponse, OrderItemResponse
from app.modules.orders.service import OrderService
from app.modules.orders.models import Order

router = APIRouter()


def _order_to_response(order: Order) -> OrderResponse:
    """Convert Order to OrderResponse matching frontend OrderDto."""
    # Build order items
    items = []
    for item in order.items:
        product_title = item.product.title if item.product else "Unknown Product"
        product_image = item.product.images[0].image_url if item.product and item.product.images else None
        
        items.append(OrderItemResponse(
            productId=str(item.product_id) if item.product_id else "",
            productTitle=product_title,
            price=float(item.unit_price),
            quantity=item.qty,
            productImageUrl=product_image,
        ))
    
    # Get seller info
    seller_name = None
    if order.seller:
        seller_name = order.seller.name
    
    # Get delivery address from JSONB
    delivery_address = None
    if order.delivery_address and isinstance(order.delivery_address, dict):
        delivery_address = order.delivery_address.get("address")
    
    return OrderResponse(
        id=str(order.id),
        items=items,
        totalAmount=float(order.total_price),
        deliveryType=order.delivery_option.value,
        deliveryAddress=delivery_address,
        deliveryDistrict=order.delivery_district,
        status=order.status.value,
        sellerId=str(order.seller_user_id),
        sellerName=seller_name,
        createdAt=order.created_at,
        updatedAt=order.updated_at,
    )


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Create a new order.
    Matches frontend: POST /orders
    """
    try:
        service = OrderService(db)
        order = service.create_order(current_user.id, order_data.dict())
        return _order_to_response(order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    List orders for owner (BACKEND_DESIGN: GET /orders = list for owner, as buyer only).
    Sellers use GET /seller/orders for their orders.
    """
    service = OrderService(db)
    orders = service.get_orders_for_buyer(current_user.id, status)
    return [_order_to_response(order) for order in orders]


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Get order by ID.
    Matches frontend: GET /orders/:id
    """
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID",
        )
    
    service = OrderService(db)
    order = service.get_order(order_uuid)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    
    # BACKEND_DESIGN: GET /orders/:id = OWNER (own). Only buyer can view order detail.
    if order.buyer_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this order",
        )
    
    return _order_to_response(order)


@router.put("/{order_id}/status", response_model=OrderResponse)
async def update_order_status(
    order_id: str,
    new_status: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Update order status (for sellers).
    Matches requirement: PUT /orders/{id}/status
    """
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID",
        )
    
    service = OrderService(db)
    order = service.get_order(order_uuid)
    
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found",
        )
    
    # Authorization: only seller can update status
    if order.seller_user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only seller can update order status",
        )
    
    try:
        from app.modules.orders.models import OrderStatus
        
        # Design enum: pending, confirmed, packed, dispatched, delivered, cancelled
        try:
            status_enum = OrderStatus(new_status.lower())
        except (ValueError, KeyError):
            raise ValueError(f"Invalid status: {new_status}; use design values")
        if status_enum not in (OrderStatus.confirmed, OrderStatus.packed, OrderStatus.dispatched, OrderStatus.delivered):
            raise ValueError("Seller may only set status to confirmed|packed|dispatched|delivered")
        
        valid_transitions = {
            OrderStatus.pending: [OrderStatus.confirmed, OrderStatus.cancelled],
            OrderStatus.confirmed: [OrderStatus.packed, OrderStatus.dispatched, OrderStatus.delivered],
            OrderStatus.packed: [OrderStatus.dispatched, OrderStatus.delivered],
            OrderStatus.dispatched: [OrderStatus.delivered],
        }
        allowed = valid_transitions.get(order.status, [])
        if status_enum not in allowed:
            raise ValueError(f"Invalid transition from {order.status.value} to {status_enum.value}")
        
        order.status = status_enum
        db.commit()
        db.refresh(order)
        
        return _order_to_response(order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


@router.put("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(
    order_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
):
    """
    Cancel an order.
    Matches frontend: PUT /orders/:id/cancel
    """
    try:
        order_uuid = UUID(order_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid order ID",
        )
    
    service = OrderService(db)
    
    try:
        order = service.cancel_order(order_uuid, current_user.id)
        return _order_to_response(order)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
