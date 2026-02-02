"""
Seed script for development data.
Run after migrations: python scripts/seed_data.py

IDEMPOTENCY: This script is safe to run multiple times.
- Users are looked up by email; if exists, reuse existing record.
- Vet/SellerProfile are looked up by user_id (PK).
- Products are looked up by seller_id + title.
- Notifications/orders/bookings are created only if user is newly created.
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

# Load all models (ensures SQLAlchemy relationships resolve; main imports all routers)
import app.main  # noqa: F401

from sqlalchemy.orm import Session
from app.core.db import SessionLocal, engine
from app.core.security import get_password_hash
from datetime import datetime, timedelta, timezone
from app.modules.users.models import User, UserProfile, UserRole
from app.modules.vets.models import Vet
from app.modules.seller.models import SellerProfile
from app.modules.orders.models import Order, OrderItem, OrderStatus, DeliveryOption
from app.modules.marketplace.models import Product, ProductCategory
from app.modules.notifications.models import Notification
from app.modules.bookings.models import Booking, VisitType, BookingStatus
from app.modules.animals.models import Animal
from app.modules.cases.models import Case, CaseStatus
from app.core.config import settings
from uuid import uuid4
from decimal import Decimal


def get_or_create_user(db: Session, email: str, **kwargs) -> tuple[User, bool]:
    """Get existing user by email or create new one. Returns (user, created)."""
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        return existing, False
    user = User(id=uuid4(), email=email, **kwargs)
    db.add(user)
    db.flush()
    return user, True


def get_or_create_user_profile(db: Session, user_id, **kwargs) -> UserProfile:
    """Get existing profile or create new one."""
    existing = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if existing:
        return existing
    profile = UserProfile(user_id=user_id, **kwargs)
    db.add(profile)
    return profile


def get_or_create_vet(db: Session, user_id, **kwargs) -> Vet:
    """Get existing vet profile or create new one."""
    existing = db.query(Vet).filter(Vet.user_id == user_id).first()
    if existing:
        return existing
    vet = Vet(user_id=user_id, **kwargs)
    db.add(vet)
    return vet


def get_or_create_seller_profile(db: Session, user_id, **kwargs) -> SellerProfile:
    """Get existing seller profile or create new one."""
    existing = db.query(SellerProfile).filter(SellerProfile.user_id == user_id).first()
    if existing:
        return existing
    profile = SellerProfile(user_id=user_id, **kwargs)
    db.add(profile)
    return profile


def get_or_create_product(db: Session, seller_user_id, title: str, **kwargs) -> tuple[Product, bool]:
    """Get existing product by seller+title or create new one. Returns (product, created)."""
    existing = db.query(Product).filter(
        Product.seller_user_id == seller_user_id,
        Product.title == title,
    ).first()
    if existing:
        return existing, False
    product = Product(id=uuid4(), seller_user_id=seller_user_id, title=title, **kwargs)
    db.add(product)
    db.flush()
    return product, True


def seed_data():
    """Seed development data. Safe to run multiple times (idempotent)."""
    db: Session = SessionLocal()
    
    try:
        # Create sample users (idempotent by email)
        print("Creating sample users...")
        
        # Owner user
        owner, owner_created = get_or_create_user(
            db,
            email="owner@example.com",
            role=UserRole.OWNER,
            name="John Doe",
            phone="+256700000001",
            password_hash=get_password_hash("password123"),
        )
        
        get_or_create_user_profile(
            db, owner.id,
            district="Kampala",
            region="Central",
            lat=0.3476,
            lng=32.5825,
        )
        
        # Vet user
        vet_user, vet_user_created = get_or_create_user(
            db,
            email="vet@example.com",
            role=UserRole.VET,
            name="Dr. Jane Smith",
            phone="+256700000002",
            password_hash=get_password_hash("password123"),
        )
        
        get_or_create_user_profile(
            db, vet_user.id,
            district="Kampala",
            region="Central",
            lat=0.3476,
            lng=32.5825,
        )
        
        # Vet profile
        get_or_create_vet(
            db, vet_user.id,
            clinic_name="Kampala Veterinary Clinic",
            license_number="VET001",
            services=["Vaccination", "Surgery", "Check-up", "Emergency"],
            specializations=["Livestock", "Poultry"],
            is_24_7=True,
            farm_visits=True,
            location_lat=0.3476,
            location_lng=32.5825,
            address="Kampala Road, Kampala",
            district="Kampala",
            verified=True,
            avg_rating=4.5,
            review_count=120,
        )
        
        # Another vet
        vet_user2, _ = get_or_create_user(
            db,
            email="vet2@example.com",
            role=UserRole.VET,
            name="Dr. Peter Okello",
            phone="+256700000003",
            password_hash=get_password_hash("password123"),
        )
        
        get_or_create_vet(
            db, vet_user2.id,
            clinic_name="Farm Animal Hospital",
            license_number="VET002",
            services=["Vaccination", "Farm Visits"],
            specializations=["Livestock", "Cattle"],
            is_24_7=False,
            farm_visits=True,
            location_lat=0.3156,
            location_lng=32.5821,
            address="Entebbe Road, Wakiso",
            district="Wakiso",
            verified=True,
            avg_rating=4.8,
            review_count=85,
        )
        
        # Seller user
        seller, seller_created = get_or_create_user(
            db,
            email="seller@example.com",
            role=UserRole.SELLER,
            name="Animal Feed Store",
            phone="+256700000004",
            password_hash=get_password_hash("password123"),
        )
        
        get_or_create_user_profile(
            db, seller.id,
            district="Kampala",
            region="Central",
            lat=0.3476,
            lng=32.5825,
        )
        get_or_create_seller_profile(
            db, seller.id,
            store_name="Animal Feed Store",
            contact_email="seller@example.com",
        )

        # Admin user
        admin, admin_created = get_or_create_user(
            db,
            email="admin@example.com",
            role=UserRole.ADMIN,
            name="Admin User",
            phone="+256700000005",
            password_hash=get_password_hash("password123"),
        )
        get_or_create_user_profile(db, admin.id, district="Kampala")
        
        # Sample products (idempotent by seller_id + title)
        print("Creating sample products...")
        
        product1, _ = get_or_create_product(
            db, seller.id,
            title="Premium Cattle Feed 50kg",
            category=ProductCategory.FEED,
            description="High quality cattle feed for dairy cows",
            price=150000.00,
            currency="UGX",
            stock_qty=100,
            location_lat=0.3476,
            location_lng=32.5825,
            district="Kampala",
            verified=True,
            is_active=True,
            recommended=True,
        )
        
        product2, _ = get_or_create_product(
            db, seller.id,
            title="Animal Antibiotics 100ml",
            category=ProductCategory.MEDICINE,
            description="Broad spectrum antibiotic for livestock",
            price=45000.00,
            currency="UGX",
            stock_qty=50,
            location_lat=0.3476,
            location_lng=32.5825,
            district="Kampala",
            verified=True,
            is_active=True,
            recommended=False,
        )

        product3, _ = get_or_create_product(
            db, seller.id,
            title="Draft Equipment (Unverified)",
            category=ProductCategory.EQUIPMENT,
            description="Pending approval",
            price=80000.00,
            currency="UGX",
            stock_qty=10,
            verified=False,
            is_active=False,
        )

        # Sample order (only create if owner is new to avoid duplicate orders)
        if owner_created:
            print("Creating sample order...")
            order1 = Order(
                id=uuid4(),
                buyer_user_id=owner.id,
                seller_user_id=seller.id,
                status=OrderStatus.confirmed,
                total_price=Decimal("195000.00"),
                delivery_option=DeliveryOption.DELIVERY,
                delivery_address={"address": "Kampala, Central"},
                delivery_district="Kampala",
            )
            db.add(order1)
            db.flush()
            oi1 = OrderItem(
                order_id=order1.id,
                product_id=product1.id,
                seller_id=seller.id,
                product_name=product1.title,
                qty=1,
                unit_price=Decimal("150000.00"),
                subtotal=Decimal("150000.00"),
            )
            db.add(oi1)
            oi2 = OrderItem(
                order_id=order1.id,
                product_id=product2.id,
                seller_id=seller.id,
                product_name=product2.title,
                qty=1,
                unit_price=Decimal("45000.00"),
                subtotal=Decimal("45000.00"),
            )
            db.add(oi2)
        else:
            print("Skipping sample order (owner already exists)...")

        # Sample notifications (only for newly created users)
        print("Creating sample notifications...")
        tz = timezone.utc
        notifications_to_create = []
        if owner_created:
            notifications_to_create.append((
                owner,
                ("ORDER", "Order confirmed", "Your order has been confirmed."),
                {"entity_type": "order", "entity_id": str(order1.id), "action_url": f"/orders/{order1.id}"}
            ))
        if vet_user_created:
            notifications_to_create.append((
                vet_user,
                ("BOOKING", "New booking request", "A new appointment has been requested."),
                {}  # Will be populated when booking is created below
            ))
        if seller_created:
            notifications_to_create.append((
                seller,
                ("ORDER", "New order received", "You have a new order from John Doe."),
                {}  # Will be populated with order ID if order created
            ))
        if admin_created:
            notifications_to_create.append((
                admin,
                ("REMINDER", "Admin reminder", "1 vet pending verification."),
                {"entity_type": "system", "action_url": "/admin/vets"}
            ))
        
        for user, nt, payload in notifications_to_create:
            db.add(Notification(
                user_id=user.id,
                type=nt[0],
                title=nt[1],
                message=nt[2],
                payload=payload if payload else None,
                read=False,
            ))
        if not notifications_to_create:
            print("  (No new notifications - users already exist)")
        
        # Commit notifications first so they exist before booking references them
        db.commit()

        # Sample booking (create if no bookings exist)
        existing_bookings = db.query(Booking).filter(
            Booking.owner_user_id == owner.id,
            Booking.vet_user_id == vet_user.id
        ).count()
        
        if existing_bookings == 0:
            print("Creating sample booking...")
            scheduled = datetime.now(tz) + timedelta(days=3)
            booking1 = Booking(
                owner_user_id=owner.id,
                vet_user_id=vet_user.id,
                visit_type=VisitType.CLINIC,
                scheduled_time=scheduled,
                status=BookingStatus.REQUESTED,  # REQUESTED so vet can Accept/Reject
                notes="Routine check-up for cattle",
            )
            db.add(booking1)
            db.flush()  # Get booking ID
            
            # Create vet notification with proper entity reference
            vet_notif = Notification(
                user_id=vet_user.id,
                type="BOOKING",
                title="New booking request",
                message="A new appointment has been requested by John Doe.",
                payload={
                    "entity_type": "booking",
                    "entity_id": str(booking1.id),
                    "action_url": f"/vet/appointments?status=requested&focus={booking1.id}"
                },
                read=False,
            )
            db.add(vet_notif)
        else:
            print("Skipping sample booking (already exists)...")

        # Sample animal + case assigned to vet (for VetCasesPage)
        existing_cases = db.query(Case).filter(Case.owner_user_id == owner.id).count()
        if existing_cases == 0:
            print("Creating sample animal and case...")
            animal1 = Animal(
                id=uuid4(),
                owner_user_id=owner.id,
                name="Bella",
                type="Dairy Cow",
                breed="Holstein",
                tag_number="UG-001",
                sex="FEMALE",
            )
            db.add(animal1)
            db.flush()
            case1 = Case(
                id=uuid4(),
                owner_user_id=owner.id,
                vet_user_id=vet_user.id,
                animal_id=animal1.id,
                animal_type="Dairy Cow",
                symptoms=["Lethargy", "Loss of appetite"],
                notes="Not eating well for 2 days",
                status=CaseStatus.SUBMITTED,
            )
            db.add(case1)
            db.flush()
            db.add(
                Notification(
                    user_id=owner.id,
                    type="CASE",
                    title="New case created",
                    message="A case was created for your animal.",
                    payload={
                        "entity_type": "case",
                        "entity_id": str(case1.id),
                        "action_url": f"/records?focusCase={case1.id}",
                    },
                    read=False,
                )
            )
            db.add(
                Notification(
                    user_id=vet_user.id,
                    type="CASE",
                    title="New case assigned",
                    message="A case has been assigned to you for review.",
                    payload={
                        "entity_type": "case",
                        "entity_id": str(case1.id),
                        "action_url": f"/vet/cases?focus={case1.id}",
                    },
                    read=False,
                )
            )
        else:
            print("Skipping sample case (already exists)...")

        db.commit()
        print("✅ Seed data created successfully!")
        print("\nSample accounts:")
        print("Owner: owner@example.com / password123")
        print("Vet: vet@example.com / password123")
        print("Seller: seller@example.com / password123")
        print("Admin: admin@example.com / password123")
        
    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_data()
