from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class ProductCreate(BaseModel):
    """Product creation schema."""
    category: str
    title: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    locationLat: Optional[float] = None
    locationLng: Optional[float] = None
    district: Optional[str] = None


class ProductResponse(BaseModel):
    """Product response - matches frontend ProductDto exactly."""
    id: str
    title: str
    category: str
    price: float
    description: Optional[str] = None
    imageUrls: List[str] = []
    sellerId: str
    sellerName: Optional[str] = None
    sellerLocation: Optional[str] = None
    sellerDistance: Optional[float] = None  # Calculated distance
    stock: int
    isVerified: Optional[bool] = False
    rating: Optional[float] = None  # Could calculate from reviews
    reviewCount: Optional[int] = None
    createdAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID: lambda v: str(v),
        }
