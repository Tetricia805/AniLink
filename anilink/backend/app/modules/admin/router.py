from fastapi import APIRouter, Depends, HTTPException, Query, Body
from app.core.security import get_current_user
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
from datetime import date

from app.core.db import get_db
from app.core.rbac import require_admin
from app.modules.users.models import User
from app.modules.admin.service import (
    get_admin_stats,
    list_admin_users,
    update_admin_user,
    list_admin_vets,
    approve_vet,
    reject_vet,
    list_admin_products,
    update_admin_product,
    get_reports_overview,
    get_admin_settings,
    update_admin_settings,
)
from app.modules.admin.schemas import (
    AdminStats,
    AdminUserListResponse,
    AdminUserResponse,
    AdminUserUpdate,
    AdminVetListResponse,
    AdminVetReject,
    AdminProductListResponse,
    AdminProductUpdate,
    ReportsOverview,
    AdminSettingsResponse,
    AdminSettingsUpdate,
)

router = APIRouter(dependencies=[Depends(require_admin)])


@router.get("/stats", response_model=AdminStats)
async def admin_stats(db: Session = Depends(get_db)):
    """Admin dashboard stats."""
    return get_admin_stats(db)


@router.get("/users", response_model=AdminUserListResponse)
async def admin_list_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List users with filters."""
    items, total = list_admin_users(
        db, search=search, role=role, status=status, is_active=is_active,
        page=page, page_size=page_size,
    )
    return AdminUserListResponse(items=items, total=total)


@router.patch("/users/{user_id}", response_model=AdminUserResponse)
async def admin_update_user(
    user_id: str,
    data: AdminUserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user (is_active, role). Prevents admin from deactivating themselves."""
    try:
        uid = UUID(user_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    update_dict = data.model_dump(exclude_unset=True)
    if not update_dict:
        user = db.query(User).filter(User.id == uid).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return AdminUserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            role=user.role.value,
            is_active=getattr(user, "is_active", True),
            createdAt=user.created_at,
        )
    try:
        user = update_admin_user(db, uid, update_dict, current_user_id=current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return AdminUserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=user.role.value,
        is_active=getattr(user, "is_active", True),
        createdAt=user.created_at,
    )


@router.get("/vets", response_model=AdminVetListResponse)
async def admin_list_vets(
    status: Optional[str] = Query(None, description="pending|approved|rejected"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List vets with status filter."""
    items, total = list_admin_vets(db, status=status, search=search, page=page, page_size=page_size)
    return AdminVetListResponse(items=items, total=total)


@router.patch("/vets/{vet_id}/approve")
async def admin_approve_vet(vet_id: str, db: Session = Depends(get_db)):
    """Approve a vet."""
    try:
        vid = UUID(vet_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vet ID")
    vet = approve_vet(db, vid)
    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found")
    return {"ok": True, "message": "Vet approved"}


@router.patch("/vets/{vet_id}/reject")
async def admin_reject_vet(
    vet_id: str,
    body: AdminVetReject | None = Body(None),
    db: Session = Depends(get_db),
):
    """Reject a vet (optional reason)."""
    try:
        vid = UUID(vet_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid vet ID")
    reason = body.reason if body else None
    vet = reject_vet(db, vid, reason=reason)
    if not vet:
        raise HTTPException(status_code=404, detail="Vet not found")
    return {"ok": True, "message": "Vet rejected"}


@router.get("/products", response_model=AdminProductListResponse)
async def admin_list_products(
    status: Optional[str] = Query(None, description="active|inactive|flagged"),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """List products with filters."""
    items, total = list_admin_products(db, status=status, search=search, page=page, page_size=page_size)
    return AdminProductListResponse(items=items, total=total)


@router.patch("/products/{product_id}")
async def admin_update_product(
    product_id: str,
    data: AdminProductUpdate,
    db: Session = Depends(get_db),
):
    """Update product (is_active, is_flagged, admin_note)."""
    try:
        pid = UUID(product_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid product ID")
    update_dict = data.model_dump(exclude_unset=True)
    if not update_dict:
        raise HTTPException(status_code=400, detail="No fields to update")
    product = update_admin_product(db, pid, update_dict)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return {
        "ok": True,
        "product": {
            "id": str(product.id),
            "isActive": product.is_active,
            "isFlagged": getattr(product, "is_flagged", False),
            "adminNote": getattr(product, "admin_note", None),
        },
    }


@router.get("/reports/overview", response_model=ReportsOverview)
async def admin_reports_overview(
    start: Optional[date] = Query(None, description="Start date YYYY-MM-DD"),
    end: Optional[date] = Query(None, description="End date YYYY-MM-DD"),
    from_date: Optional[date] = Query(None, alias="from"),
    to_date: Optional[date] = Query(None, alias="to"),
    db: Session = Depends(get_db),
):
    """Reports overview with date range. Use start/end or from/to."""
    f = start or from_date
    t = end or to_date
    return get_reports_overview(db, from_date=f, to_date=t)


@router.get("/settings", response_model=AdminSettingsResponse)
async def admin_get_settings(db: Session = Depends(get_db)):
    """Get platform settings."""
    return get_admin_settings(db)


@router.put("/settings", response_model=AdminSettingsResponse)
async def admin_update_settings(
    data: dict[str, str] = Body(...),
    db: Session = Depends(get_db),
):
    """Update platform settings. Body: key/value map (string->string). Returns updated settings."""
    return update_admin_settings(db, data)
