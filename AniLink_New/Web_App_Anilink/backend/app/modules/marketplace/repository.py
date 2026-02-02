from sqlalchemy.orm import Session
from typing import List, Tuple, Optional
from uuid import UUID
from sqlalchemy import or_

from app.modules.marketplace.models import Product, ProductCategory
from app.shared.pagination import paginate_query


class ProductRepository:
    """Repository for product operations."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create(self, product_data: dict) -> Product:
        """Create a new product."""
        product = Product(**product_data)
        self.db.add(product)
        return product
    
    def get_by_id(self, product_id) -> Optional[Product]:
        """Get product by ID."""
        return self.db.query(Product).filter(Product.id == product_id).first()
    
    def search(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        page: int = 1,
        limit: int = 20,
        owner_marketplace_only: bool = False,
    ) -> Tuple[List[Product], int]:
        """
        Search products. If owner_marketplace_only=True, return ONLY is_verified=True AND is_active=True
        (BACKEND_DESIGN section 9: never return draft/pending/unverified to owners).
        """
        db_query = self.db.query(Product)

        if owner_marketplace_only:
            db_query = db_query.filter(
                Product.verified == True,
                Product.is_active == True,
            )

        if query:
            db_query = db_query.filter(
                or_(
                    Product.title.ilike(f"%{query}%"),
                    Product.description.ilike(f"%{query}%"),
                )
            )

        if category:
            try:
                category_enum = ProductCategory[category.upper()]
                db_query = db_query.filter(Product.category == category_enum)
            except KeyError:
                pass

        total = db_query.count()
        products = db_query.order_by(Product.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

        return products, total

    def get_by_seller(self, seller_user_id: UUID) -> List[Product]:
        """All products for a seller (including unverified/inactive). BACKEND_DESIGN: GET /seller/products."""
        return (
            self.db.query(Product)
            .filter(Product.seller_user_id == seller_user_id)
            .order_by(Product.created_at.desc())
            .all()
        )

    def update_product(self, product_id: UUID, seller_user_id: UUID, data: dict) -> Optional[Product]:
        """Update product only if seller_id = seller_user_id. Returns updated product or None."""
        product = (
            self.db.query(Product)
            .filter(Product.id == product_id, Product.seller_user_id == seller_user_id)
            .first()
        )
        if not product:
            return None
        for key, value in data.items():
            if hasattr(product, key):
                setattr(product, key, value)
        return product
