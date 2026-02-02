from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.core.db import get_db
from app.core.security import get_current_user
from app.core.rbac import require_owner
from app.modules.users.models import User
from app.modules.marketplace.schemas import ProductCreate, ProductResponse
from app.modules.marketplace.service import ProductService
from app.modules.marketplace.models import Product

router = APIRouter()


def _product_to_response(
    product: Product,
    seller_distance: Optional[float] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
) -> ProductResponse:
    """Convert Product to ProductResponse matching frontend ProductDto."""
    # Get image URLs
    image_urls = [img.image_url for img in product.images]
    
    # Get seller info
    seller_name = None
    seller_location = None
    if product.seller:
        seller_name = product.seller.name
        if product.district:
            seller_location = product.district
    
    # Calculate distance if user coordinates provided
    calculated_distance = seller_distance
    if calculated_distance is None and user_lat and user_lng and product.location_lat and product.location_lng:
        from app.shared.geo import haversine_distance
        calculated_distance = haversine_distance(
            user_lat, user_lng,
            product.location_lat, product.location_lng,
        )
    
    return ProductResponse(
        id=str(product.id),
        title=product.title,
        category=product.category.value,
        price=float(product.price),
        description=product.description,
        imageUrls=image_urls,
        sellerId=str(product.seller_user_id),
        sellerName=seller_name,
        sellerLocation=seller_location,
        sellerDistance=calculated_distance,
        stock=product.stock_qty,
        isVerified=product.verified,
        rating=None,  # Could calculate from reviews
        reviewCount=None,
        createdAt=product.created_at,
    )


@router.get("/products", response_model=List[ProductResponse])
async def list_products(
    q: Optional[str] = Query(None, description="Search query"),
    category: Optional[str] = Query(None),
    recommended: Optional[bool] = Query(None),
    page: Optional[int] = Query(1, ge=1),
    limit: Optional[int] = Query(20, ge=1, le=100),
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    radius_km: Optional[float] = Query(None),
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """
    List products for OWNER. BACKEND_DESIGN 9: ONLY is_verified=True AND is_active=True.
    Never return draft/pending/unverified to owners.
    """
    service = ProductService(db)
    products_with_distance, total = await service.search_products(
        query=q,
        category=category,
        latitude=latitude,
        longitude=longitude,
        radius_km=radius_km,
        page=page,
        limit=limit,
        owner_marketplace_only=True,
    )
    return [
        _product_to_response(product, distance, latitude, longitude)
        for product, distance in products_with_distance
    ]


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(
    product_id: str,
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    current_user: User = Depends(require_owner),
    db: Session = Depends(get_db),
):
    """
    Get product by ID for OWNER. BACKEND_DESIGN 9: only if is_verified=True AND is_active=True; else 404.
    """
    try:
        product_uuid = UUID(product_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid product ID",
        )
    service = ProductService(db)
    product = service.get_product(product_uuid)
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    if not product.verified or not product.is_active:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found",
        )
    return _product_to_response(product, None, latitude, longitude)


# Product creation is SELLER-only: use POST /seller/products (see seller router)
