from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_
from typing import List, Optional, Tuple
from uuid import UUID
from datetime import datetime, timedelta, date

from app.modules.users.models import User, UserRole, UserProfile
from app.modules.vets.models import Vet
from app.modules.marketplace.models import Product
from app.modules.orders.models import Order, OrderItem, OrderStatus
from app.modules.bookings.models import Booking, BookingStatus
from app.modules.cases.models import Case, CaseStatus
from app.modules.admin.models import PlatformSettings
from app.modules.notifications.models import Notification
from app.modules.admin.schemas import (
    AdminStats,
    AdminUserResponse,
    AdminVetResponse,
    AdminProductResponse,
    ReportsOverview,
    OrdersByDayItem,
    TopSellerItem,
    TopProductItem,
    AdminSettingsResponse,
    RecentBookingItem,
    RecentOrderItem,
)

DEFAULT_SETTINGS = {
    "platform_fee_percent": "0",
    "max_booking_distance_km": "50",
    "notifications_enabled": "true",
    "default_currency": "UGX",
}


def _get_setting(db: Session, key: str) -> str:
    row = db.query(PlatformSettings).filter(PlatformSettings.key == key).first()
    if row and row.value is not None:
        return row.value
    return DEFAULT_SETTINGS.get(key, "")


def get_admin_stats(db: Session, days: int = 30) -> AdminStats:
    from datetime import timedelta
    now = datetime.utcnow()
    end_date = now.date()
    start_date = (now - timedelta(days=days)).date()

    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_vets = db.query(Vet).count()
    pending_vets = db.query(Vet).filter(Vet.verified == False, Vet.rejection_reason == None).count()
    total_products = db.query(Product).count()
    flagged_products = db.query(Product).filter(Product.is_flagged == True).count()

    revenue_result = (
        db.query(func.coalesce(func.sum(Order.total_price), 0))
        .filter(
            Order.status.in_([OrderStatus.confirmed, OrderStatus.packed, OrderStatus.dispatched, OrderStatus.delivered]),
            func.date(Order.created_at) >= start_date,
            func.date(Order.created_at) <= end_date,
        )
        .scalar()
    )
    total_orders_amount = float(revenue_result) if revenue_result else None
    total_bookings = db.query(Booking).count()
    total_orders = db.query(Order).count()

    recent_bookings_raw = (
        db.query(Booking)
        .options(
            joinedload(Booking.owner),
            joinedload(Booking.vet).joinedload(Vet.user),
        )
        .order_by(Booking.scheduled_time.desc())
        .limit(5)
        .all()
    )
    recent_bookings = [
        RecentBookingItem(
            id=str(b.id),
            owner_name=b.owner.name if b.owner else None,
            owner_email=b.owner.email if b.owner else None,
            vet_name=b.vet.user.name if b.vet and b.vet.user else None,
            clinic_name=b.vet.clinic_name if b.vet else None,
            date=b.scheduled_time.isoformat() if b.scheduled_time else None,
            status=b.status.value,
            price=None,
        )
        for b in recent_bookings_raw
    ]

    recent_orders_raw = (
        db.query(Order)
        .options(joinedload(Order.buyer))
        .order_by(Order.created_at.desc())
        .limit(5)
        .all()
    )
    recent_orders = [
        RecentOrderItem(
            id=str(o.id),
            buyer_name=o.buyer.name if o.buyer else None,
            buyer_email=o.buyer.email if o.buyer else None,
            total_amount=float(o.total_price),
            status=o.status.value,
            created_at=o.created_at.isoformat() if o.created_at else None,
        )
        for o in recent_orders_raw
    ]

    return AdminStats(
        total_users=total_users,
        active_users=active_users,
        total_vets=total_vets,
        pending_vets=pending_vets,
        total_products=total_products,
        flagged_products=flagged_products,
        total_orders_amount=total_orders_amount,
        total_bookings=total_bookings,
        total_orders=total_orders,
        recent_bookings=recent_bookings,
        recent_orders=recent_orders,
    )


def list_admin_users(
    db: Session,
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    is_active: Optional[bool] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[AdminUserResponse], int]:
    query = db.query(User)
    if search:
        q = f"%{search}%"
        query = query.filter(or_(User.email.ilike(q), User.name.ilike(q)))
    if role:
        try:
            query = query.filter(User.role == UserRole[role.upper()])
        except KeyError:
            pass
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    elif status == "active":
        query = query.filter(User.is_active == True)
    elif status == "inactive":
        query = query.filter(User.is_active == False)

    total = query.count()
    users = query.order_by(User.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = [
        AdminUserResponse(
            id=str(u.id),
            email=u.email,
            name=u.name,
            role=u.role.value,
            is_active=getattr(u, "is_active", True),
            createdAt=u.created_at,
        )
        for u in users
    ]
    return items, total


def update_admin_user(db: Session, user_id: UUID, data: dict, current_user_id: Optional[UUID] = None) -> Optional[User]:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return None
    if "is_active" in data:
        if current_user_id and user_id == current_user_id and data["is_active"] is False:
            raise ValueError("Cannot deactivate yourself")
        user.is_active = data["is_active"]
    if "role" in data:
        try:
            user.role = UserRole[data["role"].upper()]
        except KeyError:
            pass
    db.commit()
    db.refresh(user)
    return user


def list_admin_vets(
    db: Session,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[AdminVetResponse], int]:
    query = db.query(Vet).join(User, Vet.user_id == User.id)
    if status == "pending":
        query = query.filter(Vet.verified == False, Vet.rejection_reason == None)
    elif status == "approved":
        query = query.filter(Vet.verified == True)
    elif status == "rejected":
        query = query.filter(Vet.rejection_reason != None)
    if search:
        q = f"%{search}%"
        query = query.filter(
            or_(
                User.name.ilike(q),
                User.email.ilike(q),
                Vet.clinic_name.ilike(q),
            )
        )
    total = query.count()
    vets = query.order_by(Vet.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for v in vets:
        u = v.user
        items.append(
            AdminVetResponse(
                id=str(v.user_id),
                userId=str(v.user_id),
                name=u.name,
                email=u.email,
                clinicName=v.clinic_name,
                district=v.district,
                address=v.address,
                verified=v.verified,
                rejectionReason=getattr(v, "rejection_reason", None),
                createdAt=v.created_at,
            )
        )
    return items, total


def approve_vet(db: Session, vet_id: UUID) -> Optional[Vet]:
    vet = db.query(Vet).filter(Vet.user_id == vet_id).first()
    if not vet:
        return None
    vet.verified = True
    vet.rejection_reason = None
    db.add(
        Notification(
            user_id=vet.user_id,
            type="VET",
            title="Vet approved",
            message="Your vet profile has been approved. You can now accept bookings.",
            payload={"action_url": "/vet/home"},
        )
    )
    db.commit()
    db.refresh(vet)
    return vet


def reject_vet(db: Session, vet_id: UUID, reason: Optional[str] = None) -> Optional[Vet]:
    vet = db.query(Vet).filter(Vet.user_id == vet_id).first()
    if not vet:
        return None
    vet.verified = False
    vet.rejection_reason = reason or "Rejected by admin"
    db.add(
        Notification(
            user_id=vet.user_id,
            type="VET",
            title="Vet rejected",
            message=reason or "Your vet profile has been rejected. Contact support for more information.",
            payload={"action_url": "/vet/home"},
        )
    )
    db.commit()
    db.refresh(vet)
    return vet


def list_admin_products(
    db: Session,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[AdminProductResponse], int]:
    query = db.query(Product).join(User, Product.seller_user_id == User.id)
    if status == "active":
        query = query.filter(Product.is_active == True)
    elif status == "inactive":
        query = query.filter(Product.is_active == False)
    elif status == "flagged":
        query = query.filter(Product.is_flagged == True)
    if search:
        q = f"%{search}%"
        query = query.filter(
            or_(Product.title.ilike(q), User.name.ilike(q))
        )
    total = query.count()
    products = query.order_by(Product.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    items = []
    for p in products:
        seller = p.seller
        items.append(
            AdminProductResponse(
                id=str(p.id),
                title=p.title,
                sellerId=str(p.seller_user_id),
                sellerName=seller.name if seller else None,
                price=float(p.price),
                stockQty=p.stock_qty or 0,
                isActive=p.is_active,
                isFlagged=getattr(p, "is_flagged", False),
                adminNote=getattr(p, "admin_note", None),
                category=p.category.value if hasattr(p.category, "value") else str(p.category),
                createdAt=p.created_at,
            )
        )
    return items, total


def update_admin_product(db: Session, product_id: UUID, data: dict) -> Optional[Product]:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        return None
    if "is_active" in data:
        product.is_active = data["is_active"]
    if "is_flagged" in data:
        product.is_flagged = data["is_flagged"]
    if "admin_note" in data:
        product.admin_note = data["admin_note"]
    should_notify = data.get("is_flagged") is True or data.get("is_active") is False
    if product.seller_user_id and should_notify:
        db.add(
            Notification(
                user_id=product.seller_user_id,
                type="ORDER",
                title="Product moderation",
                message="Your product has been moderated. Check your seller dashboard for details.",
                payload={"action_url": "/seller/products"},
            )
        )
    db.commit()
    db.refresh(product)
    return product


def get_reports_overview(
    db: Session,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
) -> ReportsOverview:
    now = datetime.utcnow()
    if not from_date:
        from_date = (now - timedelta(days=30)).date()
    if not to_date:
        to_date = now.date()

    orders_by_day = []
    day_query = (
        db.query(
            func.date(Order.created_at).label("dt"),
            func.count(Order.id).label("cnt"),
            func.coalesce(func.sum(Order.total_price), 0).label("tot"),
        )
        .filter(
            func.date(Order.created_at) >= from_date,
            func.date(Order.created_at) <= to_date,
        )
        .group_by(func.date(Order.created_at))
        .order_by(func.date(Order.created_at))
    )
    for row in day_query.all():
        orders_by_day.append(
            OrdersByDayItem(date=str(row.dt), count=row.cnt, total=float(row.tot))
        )

    bookings_by_status = {}
    for bs in BookingStatus:
        cnt = db.query(Booking).filter(Booking.status == bs).count()
        bookings_by_status[bs.value] = cnt

    top_sellers = []
    seller_agg = (
        db.query(
            User.id,
            User.name,
            func.count(Order.id).label("ord_cnt"),
            func.coalesce(func.sum(Order.total_price), 0).label("tot"),
        )
        .join(Order, Order.seller_user_id == User.id)
        .filter(
            func.date(Order.created_at) >= from_date,
            func.date(Order.created_at) <= to_date,
        )
        .group_by(User.id, User.name)
        .order_by(func.sum(Order.total_price).desc())
        .limit(10)
    )
    for row in seller_agg.all():
        top_sellers.append(
            TopSellerItem(id=str(row.id), name=row.name, orders=row.ord_cnt, total=float(row.tot))
        )

    top_products = []
    prod_agg = (
        db.query(
            Product.id,
            Product.title,
            func.count(OrderItem.id).label("ord_cnt"),
        )
        .join(OrderItem, OrderItem.product_id == Product.id)
        .join(Order, OrderItem.order_id == Order.id)
        .filter(
            func.date(Order.created_at) >= from_date,
            func.date(Order.created_at) <= to_date,
        )
        .group_by(Product.id, Product.title)
        .order_by(func.count(OrderItem.id).desc())
        .limit(10)
    )
    for row in prod_agg.all():
        top_products.append(
            TopProductItem(id=str(row.id), title=row.title, orders=row.ord_cnt)
        )

    return ReportsOverview(
        orders_by_day=orders_by_day,
        bookings_by_status=bookings_by_status,
        top_sellers=top_sellers,
        top_products=top_products,
    )


def get_admin_settings(db: Session) -> AdminSettingsResponse:
    return AdminSettingsResponse(
        platform_fee_percent=float(_get_setting(db, "platform_fee_percent") or 0),
        max_booking_distance_km=float(_get_setting(db, "max_booking_distance_km") or 50),
        notifications_enabled=_get_setting(db, "notifications_enabled").lower() in ("true", "1", "yes"),
        default_currency=_get_setting(db, "default_currency") or "UGX",
    )


def update_admin_settings(db: Session, data: dict) -> AdminSettingsResponse:
    for key, val in data.items():
        if key and val is not None:
            val_str = str(val) if not isinstance(val, bool) else ("true" if val else "false")
            row = db.query(PlatformSettings).filter(PlatformSettings.key == key).first()
            if row:
                row.value = val_str
            else:
                db.add(PlatformSettings(key=key, value=val_str or ""))
    db.commit()
    return get_admin_settings(db)
