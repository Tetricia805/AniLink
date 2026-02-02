from pydantic import BaseModel
from typing import Optional, List, Any
from datetime import datetime


# --- Stats ---
class RecentBookingItem(BaseModel):
    id: str
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None
    vet_name: Optional[str] = None
    clinic_name: Optional[str] = None
    date: Optional[str] = None
    status: str
    price: Optional[float] = None


class RecentOrderItem(BaseModel):
    id: str
    buyer_name: Optional[str] = None
    buyer_email: Optional[str] = None
    total_amount: float
    status: str
    created_at: Optional[str] = None


class AdminStats(BaseModel):
    total_users: int = 0
    active_users: int = 0
    total_vets: int = 0
    pending_vets: int = 0
    total_products: int = 0
    flagged_products: int = 0
    total_orders_amount: Optional[float] = None
    total_bookings: int = 0
    total_orders: int = 0
    recent_bookings: List[RecentBookingItem] = []
    recent_orders: List[RecentOrderItem] = []


# --- Users ---
class AdminUserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    is_active: bool
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminUserListResponse(BaseModel):
    items: List[AdminUserResponse]
    total: int


class AdminUserUpdate(BaseModel):
    is_active: Optional[bool] = None
    role: Optional[str] = None


# --- Vets ---
class AdminVetResponse(BaseModel):
    id: str
    userId: str
    name: str
    email: str
    clinicName: str
    district: Optional[str] = None
    address: Optional[str] = None
    verified: bool
    rejectionReason: Optional[str] = None
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminVetListResponse(BaseModel):
    items: List[AdminVetResponse]
    total: int


class AdminVetReject(BaseModel):
    reason: Optional[str] = None


# --- Products ---
class AdminProductResponse(BaseModel):
    id: str
    title: str
    sellerId: str
    sellerName: Optional[str] = None
    price: float
    stockQty: int
    isActive: bool
    isFlagged: bool
    adminNote: Optional[str] = None
    category: str
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True


class AdminProductListResponse(BaseModel):
    items: List[AdminProductResponse]
    total: int


class AdminProductUpdate(BaseModel):
    is_active: Optional[bool] = None
    is_flagged: Optional[bool] = None
    admin_note: Optional[str] = None


# --- Reports ---
class OrdersByDayItem(BaseModel):
    date: str
    count: int
    total: float


class TopSellerItem(BaseModel):
    id: str
    name: str
    orders: int
    total: float


class TopProductItem(BaseModel):
    id: str
    title: str
    orders: int


class ReportsOverview(BaseModel):
    orders_by_day: List[OrdersByDayItem] = []
    bookings_by_status: dict = {}
    top_sellers: List[TopSellerItem] = []
    top_products: List[TopProductItem] = []


# --- Settings ---
class AdminSettingsResponse(BaseModel):
    platform_fee_percent: float = 0.0
    max_booking_distance_km: float = 50.0
    notifications_enabled: bool = True
    default_currency: str = "UGX"


class AdminSettingsUpdate(BaseModel):
    platform_fee_percent: Optional[float] = None
    max_booking_distance_km: Optional[float] = None
    notifications_enabled: Optional[bool] = None
    default_currency: Optional[str] = None
