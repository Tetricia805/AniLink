from typing import Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar('T')


class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    items: List[T]
    total: int
    page: int
    limit: int
    has_next: bool
    has_prev: bool


def paginate_query(query, page: int = 1, limit: int = 20):
    """
    Paginate a SQLAlchemy query.
    
    Returns:
        tuple: (paginated_query, total_count)
    """
    offset = (page - 1) * limit
    total = query.count()
    paginated = query.offset(offset).limit(limit).all()
    return paginated, total
