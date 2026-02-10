from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import os
from dotenv import load_dotenv

from app.core.config import settings
from app.core.db import engine, Base
from app.core.logging import setup_logging
from app.core.exceptions import (
    validation_exception_handler,
    anilink_exception_handler,
    AniLinkException,
)
from fastapi.exceptions import RequestValidationError
from fastapi.staticfiles import StaticFiles
from sqlalchemy.exc import IntegrityError

# Load environment variables
load_dotenv()

# Ensure uploads directory exists for local avatar storage
UPLOADS_DIR = settings.UPLOADS_DIR
AVATARS_DIR = os.path.join(UPLOADS_DIR, "avatars")
os.makedirs(AVATARS_DIR, exist_ok=True)

# Setup logging
setup_logging()

# Create database tables (for dev - use Alembic in production)
# Base.metadata.create_all(bind=engine)

# Initialize FastAPI app. All API routes use /v1 prefix (e.g. /v1/auth, /v1/seller, /v1/marketplace).
app = FastAPI(
    title="AniLink API",
    description="AI-driven animal health and veterinary platform backend. Base path: /v1 (e.g. /v1/auth/login, /v1/marketplace/products, /v1/seller/products).",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
)

# CORS middleware
if settings.DEBUG:
    # In debug mode, allow all origins for local development
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Allow all origins in debug
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )
else:
    # Production: use CORS_ORIGINS or fallback to frontend origin
    origins = settings.CORS_ORIGINS or [settings.FRONTEND_ORIGIN]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
    )

# Global exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(AniLinkException, anilink_exception_handler)

# Include routers
from app.modules.auth.router import router as auth_router
from app.modules.users.router import router as users_router
from app.modules.vets.router import router as vets_router
from app.modules.bookings.router import router as bookings_router
from app.modules.animals.router import router as animals_router
from app.modules.cases.router import router as cases_router
from app.modules.ai.router import router as ai_router
from app.modules.marketplace.router import router as marketplace_router
from app.modules.orders.router import router as orders_router
from app.modules.notifications.router import router as notifications_router
from app.modules.seller.router import router as seller_router
from app.modules.admin.router import router as admin_router

# AI scan router - calls model-service for ONNX inference
from app.modules.ai_scan.router import router as ai_scan_router
app.include_router(ai_scan_router, prefix="/v1/ai-scan", tags=["ai-scan"])

app.include_router(auth_router, prefix="/v1/auth", tags=["auth"])
app.include_router(users_router, prefix="/v1/users", tags=["users"])
app.include_router(vets_router, prefix="/v1/vets", tags=["vets"])
app.include_router(bookings_router, prefix="/v1/bookings", tags=["bookings"])
app.include_router(animals_router, prefix="/v1/animals", tags=["animals"])
app.include_router(cases_router, prefix="/v1/cases", tags=["cases"])
app.include_router(ai_router, prefix="/v1/ai", tags=["ai"])
app.include_router(marketplace_router, prefix="/v1/marketplace", tags=["marketplace"])
app.include_router(orders_router, prefix="/v1/orders", tags=["orders"])
app.include_router(notifications_router, prefix="/v1/notifications", tags=["notifications"])
app.include_router(seller_router, prefix="/v1/seller", tags=["seller"])
app.include_router(admin_router, prefix="/v1/admin", tags=["admin"])

# Serve uploaded files (avatars, etc.) at /uploads
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")


@app.get("/")
async def root():
    return {"message": "AniLink API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
