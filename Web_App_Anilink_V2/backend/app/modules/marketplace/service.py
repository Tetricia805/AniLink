from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from app.modules.marketplace.models import Product, ProductCategory
from app.modules.marketplace.repository import ProductRepository
from app.shared.geo import haversine_distance


class ProductService:
    """Service for product business logic."""
    
    def __init__(self, db: Session):
        self.repository = ProductRepository(db)
        self.db = db
    
    def create_product(self, seller_user_id: UUID, product_data: dict) -> Product:
        """Create a new product. BACKEND_DESIGN: seller must NOT set is_verified/is_active; default is_verified=False."""
        cat = product_data.get("category")
        if isinstance(cat, str):
            try:
                cat = ProductCategory[cat.upper()]
            except KeyError:
                cat = ProductCategory.ANIMAL
        # Seller cannot self-verify or set is_active; only admin can. Force defaults.
        product_dict = {
            "seller_user_id": seller_user_id,
            "category": cat,
            "title": product_data["title"],
            "description": product_data.get("description"),
            "price": product_data["price"],
            "stock_qty": product_data.get("stock", 0),
            "location_lat": product_data.get("locationLat"),
            "location_lng": product_data.get("locationLng"),
            "district": product_data.get("district"),
            "verified": False,  # BACKEND_DESIGN: seller-created products default pending approval
            "is_active": True,   # New products active; admin can deactivate
            "recommended": product_data.get("recommended", False),
        }
        product = self.repository.create(product_dict)
        self.db.commit()
        self.db.refresh(product)
        return product
    
    async def search_products(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        latitude: Optional[float] = None,
        longitude: Optional[float] = None,
        radius_km: Optional[float] = None,
        page: int = 1,
        limit: int = 20,
        owner_marketplace_only: bool = False,
    ) -> tuple[List[tuple[Product, Optional[float]]], int]:
        """
        Search products. If owner_marketplace_only=True, only is_verified AND is_active (BACKEND_DESIGN 9).
        Returns:
            Tuple of (products with distance, total count)
        """
        products, total = self.repository.search(
            query=query,
            category=category,
            page=page,
            limit=limit,
            owner_marketplace_only=owner_marketplace_only,
        )
        
        # Calculate distance if coordinates provided
        results = []
        for product in products:
            distance = None
            if latitude and longitude and product.location_lat and product.location_lng:
                distance = haversine_distance(
                    latitude, longitude,
                    product.location_lat, product.location_lng,
                )
                
                # Filter by radius if specified
                if radius_km is not None and distance > radius_km:
                    continue
            
            results.append((product, distance))
        
        # Sort by distance if calculated
        if latitude and longitude:
            results.sort(key=lambda x: x[1] if x[1] is not None else float('inf'))
        
        return results, total
    
    def get_product(self, product_id: UUID) -> Optional[Product]:
        """Get product by ID."""
        return self.repository.get_by_id(product_id)
