"""
Seller module router. BACKEND_DESIGN section 3.10.
SELLER only: products (own, all states), orders (only orders with seller items, only their items), profile, dashboard.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from decimal import Decimal

from app.core.db import get_db
from app.core.rbac import require_seller
from app.modules.users.models import User
from app.modules.marketplace.models import Product
from app.modules.marketplace.repository import ProductRepository
from app.modules.marketplace.service import ProductService
from app.modules.orders.repository import OrderRepository
from app.modules.orders.models import Order, OrderItem, OrderStatus
from app.modules.seller.models import SellerProfile
from app.modules.seller.schemas import (
    SellerProfileResponse,
    SellerProfileUpdate,
    SellerProductResponse,
    SellerProductCreate,
    SellerProductUpdate,
    SellerOrderResponse,
    SellerOrderItemResponse,
    SellerOrderStatusUpdate,
    SellerDashboardSummary,
)

router = APIRouter()


def _product_to_seller_response(product: Product) -> SellerProductResponse:
    """Map Product to SellerProductResponse (include is_active, is_verified for UI badges)."""
    image_urls = [img.image_url for img in product.images] if product.images else []
    return SellerProductResponse(
        id=str(product.id),
        title=product.title,
        description=product.description,
        category=product.category.value if product.category else "",
        price=float(product.price),
        imageUrls=image_urls,
        stock=product.stock_qty,
        is_active=product.is_active,
        is_verified=product.verified,
        recommended=getattr(product, "recommended", False),
        createdAt=product.created_at,
    )


def _order_to_seller_response(order: Order, items: List[OrderItem]) -> SellerOrderResponse:
    """Build SellerOrderResponse: order header + only this seller's items."""
    addr = None
    if order.delivery_address and isinstance(order.delivery_address, dict):
        addr = order.delivery_address.get("address")
    item_resps = [
        SellerOrderItemResponse(
            id=str(it.id),
            productId=str(it.product_id) if it.product_id else "",
            productName=it.product_name,
            unitPrice=float(it.unit_price),
            quantity=it.qty,
            subtotal=float(it.subtotal) if it.subtotal else float(it.unit_price) * it.qty,
        )
        for it in items
    ]
    return SellerOrderResponse(
        id=str(order.id),
        status=order.status.value,
        totalAmount=float(order.total_price),
        deliveryAddress=addr,
        createdAt=order.created_at,
        updatedAt=order.updated_at,
        items=item_resps,
    )


# ----- Products -----


@router.get("/products", response_model=List[SellerProductResponse])
async def list_seller_products(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """
    GET /seller/products. BACKEND_DESIGN 9: only current seller's products,
    including draft/unverified/inactive (no is_verified/is_active filter).
    """
    repo = ProductRepository(db)
    products = repo.get_by_seller(current_user.id)
    return [_product_to_seller_response(p) for p in products]


@router.post("/products", response_model=SellerProductResponse, status_code=status.HTTP_201_CREATED)
async def create_seller_product(
    body: SellerProductCreate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """POST /seller/products. Product seller_id = currentUser.id. Seller cannot set is_verified/is_active."""
    service = ProductService(db)
    data = body.model_dump()
    # BACKEND_DESIGN: ignore is_verified / is_active from request; only admin can set
    data.pop("isVerified", None)
    data.pop("is_active", None)
    data["recommended"] = body.recommended if body.recommended is not None else False
    product = service.create_product(current_user.id, data)
    return _product_to_seller_response(product)


@router.get("/products/{product_id}", response_model=SellerProductResponse)
async def get_seller_product(
    product_id: str,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """GET single product only if product.seller_id = currentUser.id."""
    try:
        pid = UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product ID")
    repo = ProductRepository(db)
    product = repo.get_by_id(pid)
    if not product or product.seller_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    return _product_to_seller_response(product)


@router.patch("/products/{product_id}", response_model=SellerProductResponse)
async def update_seller_product(
    product_id: str,
    body: SellerProductUpdate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """PATCH /seller/products/:id. Only if product.seller_id = currentUser.id."""
    try:
        pid = UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid product ID")
    repo = ProductRepository(db)
    data = body.model_dump(exclude_unset=True)
    # BACKEND_DESIGN: seller must NOT change is_verified / is_active; only admin can
    data.pop("is_verified", None)
    data.pop("isVerified", None)
    data.pop("is_active", None)
    # Map schema -> model
    if "stock" in data:
        data["stock_qty"] = data.pop("stock")
    if "verified" in data:
        data.pop("verified")
    product = repo.update_product(pid, current_user.id, data)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    db.commit()
    db.refresh(product)
    # Reload for response (images etc.)
    product = repo.get_by_id(pid)
    return _product_to_seller_response(product)


# ----- Orders -----


@router.get("/orders", response_model=List[SellerOrderResponse])
async def list_seller_orders(
    status_filter: Optional[str] = None,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """
    GET /seller/orders. BACKEND_DESIGN 9: orders that contain at least one order_item
    with seller_id = currentUser.id; each order includes only this seller's order_items.
    """
    order_repo = OrderRepository(db)
    orders = order_repo.get_orders_for_seller(current_user.id, status_filter)
    result = []
    for order in orders:
        items = order_repo.get_order_items_for_seller(order.id, current_user.id)
        result.append(_order_to_seller_response(order, items))
    return result


@router.patch("/orders/{order_id}", response_model=SellerOrderResponse)
async def update_seller_order_status(
    order_id: str,
    body: SellerOrderStatusUpdate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """
    PATCH /seller/orders/:id. Only if order has at least one order_item with seller_id = currentUser.id.
    status: confirmed|packed|dispatched|delivered.
    """
    try:
        oid = UUID(order_id)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid order ID")
    order_repo = OrderRepository(db)
    order = order_repo.get_by_id(oid)
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")
    seller_items = order_repo.get_order_items_for_seller(oid, current_user.id)
    if not seller_items:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Order has no items from this seller",
        )
    # PATCH /seller/orders/:id accepts only confirmed|packed|dispatched|delivered (BACKEND_DESIGN)
    allowed = {"confirmed", "packed", "dispatched", "delivered"}
    s = body.status.lower().strip()
    if s not in allowed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status; use confirmed|packed|dispatched|delivered",
        )
    new_status = OrderStatus(s)
    order.status = new_status
    db.commit()
    db.refresh(order)
    items = order_repo.get_order_items_for_seller(oid, current_user.id)
    return _order_to_seller_response(order, items)


# ----- Profile -----


@router.get("/profile", response_model=SellerProfileResponse)
async def get_seller_profile(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """GET /seller/profile. Store name, contact email."""
    profile = db.query(SellerProfile).filter(SellerProfile.user_id == current_user.id).first()
    if not profile:
        return SellerProfileResponse()
    return SellerProfileResponse(
        storeName=profile.store_name,
        contactEmail=profile.contact_email,
    )


@router.patch("/profile", response_model=SellerProfileResponse)
async def update_seller_profile(
    body: SellerProfileUpdate,
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """PATCH /seller/profile. storeName, contactEmail."""
    profile = db.query(SellerProfile).filter(SellerProfile.user_id == current_user.id).first()
    if not profile:
        profile = SellerProfile(user_id=current_user.id)
        db.add(profile)
        db.flush()
    if body.storeName is not None:
        profile.store_name = body.storeName
    if body.contactEmail is not None:
        profile.contact_email = body.contactEmail
    db.commit()
    db.refresh(profile)
    return SellerProfileResponse(storeName=profile.store_name, contactEmail=profile.contact_email)


# ----- Dashboard -----


@router.get("/dashboard/summary", response_model=SellerDashboardSummary)
async def get_seller_dashboard_summary(
    current_user: User = Depends(require_seller),
    db: Session = Depends(get_db),
):
    """
    GET /seller/dashboard/summary.
    productsCount, ordersCount, inventoryCount (sum stock), payouts (placeholder).
    """
    product_repo = ProductRepository(db)
    order_repo = OrderRepository(db)
    products = product_repo.get_by_seller(current_user.id)
    products_count = len(products)
    inventory_count = sum(p.stock_qty for p in products)
    orders = order_repo.get_orders_for_seller(current_user.id, None)
    orders_count = len(orders)
    return SellerDashboardSummary(
        productsCount=products_count,
        ordersCount=orders_count,
        inventoryCount=inventory_count,
        payouts=None,
    )
