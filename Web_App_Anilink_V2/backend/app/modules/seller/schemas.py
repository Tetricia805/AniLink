"""Seller API schemas (BACKEND_DESIGN section 3.10)."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class SellerProfileResponse(BaseModel):
    """GET /seller/profile. store_name, contact_email."""
    storeName: Optional[str] = None
    contactEmail: Optional[str] = None

    class Config:
        from_attributes = True


class SellerProfileUpdate(BaseModel):
    """PATCH /seller/profile."""
    storeName: Optional[str] = None
    contactEmail: Optional[str] = None


class SellerProductResponse(BaseModel):
    """Product for seller list: include is_active, is_verified for UI badges."""
    id: str
    title: str
    description: Optional[str] = None
    category: str
    price: float
    imageUrls: List[str] = []
    stock: int
    is_active: bool = True
    is_verified: bool = False
    recommended: Optional[bool] = False
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class SellerProductCreate(BaseModel):
    """POST /seller/products."""
    title: str
    description: Optional[str] = None
    category: str
    price: float
    imageUrls: Optional[List[str]] = None
    stock: int = 0
    isVerified: Optional[bool] = None
    recommended: Optional[bool] = None


class SellerProductUpdate(BaseModel):
    """PATCH /seller/products/:id."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    price: Optional[float] = None
    imageUrls: Optional[List[str]] = None
    stock: Optional[int] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    recommended: Optional[bool] = None


class SellerOrderItemResponse(BaseModel):
    """Order item (only seller's items in GET /seller/orders)."""
    id: str
    productId: Optional[str] = None
    productName: Optional[str] = None
    unitPrice: float
    quantity: int
    subtotal: float


class SellerOrderResponse(BaseModel):
    """Order for seller: header + only this seller's order_items (BACKEND_DESIGN 9)."""
    id: str
    status: str
    totalAmount: float
    deliveryAddress: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    items: List[SellerOrderItemResponse] = []


class SellerOrderStatusUpdate(BaseModel):
    """PATCH /seller/orders/:id. status: confirmed|packed|dispatched|delivered."""
    status: str


class SellerDashboardSummary(BaseModel):
    """GET /seller/dashboard/summary."""
    productsCount: int
    ordersCount: int
    inventoryCount: Optional[int] = None
    payouts: Optional[float] = None
