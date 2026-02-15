from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class OrderItemCreate(BaseModel):
    """Order item creation schema."""
    productId: str
    quantity: int
    price: float


class OrderCreate(BaseModel):
    """Order creation schema - matches frontend."""
    items: List[OrderItemCreate]
    deliveryType: str  # PICKUP, DELIVERY
    deliveryAddress: Optional[str] = None
    deliveryDistrict: Optional[str] = None


class OrderItemResponse(BaseModel):
    """Order item response - matches frontend OrderItemDto."""
    productId: str
    productTitle: str
    price: float
    quantity: int
    productImageUrl: Optional[str] = None
    
    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Order response - matches frontend OrderDto exactly."""
    id: str
    items: List[OrderItemResponse]
    totalAmount: float
    deliveryType: str
    deliveryAddress: Optional[str] = None
    deliveryDistrict: Optional[str] = None
    status: str
    sellerId: Optional[str] = None
    sellerName: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }
