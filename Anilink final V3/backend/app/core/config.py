from pydantic_settings import BaseSettings
from pydantic import field_validator
from typing import List, Optional, Union
import os


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", "postgresql://anilink:anilink123@localhost:5432/anilink_db"
    )
    
    # JWT
    SECRET_KEY: str = os.getenv(
        "SECRET_KEY", "dev-secret-key-change-in-production"
    )
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "15"))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
    
    # MinIO / S3
    MINIO_ENDPOINT: str = os.getenv("MINIO_ENDPOINT", "localhost:9000")
    MINIO_ACCESS_KEY: str = os.getenv("MINIO_ACCESS_KEY", "minioadmin")
    MINIO_SECRET_KEY: str = os.getenv("MINIO_SECRET_KEY", "minioadmin")
    MINIO_BUCKET_NAME: str = os.getenv("MINIO_BUCKET_NAME", "anilink-uploads")
    MINIO_USE_SSL: bool = os.getenv("MINIO_USE_SSL", "false").lower() == "true"
    
    # App
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", os.getenv("FRONTEND_ORIGIN", "http://localhost:5173"))

    # SMTP (password reset emails)
    SMTP_HOST: Optional[str] = os.getenv("SMTP_HOST")
    SMTP_PORT: int = int(os.getenv("SMTP_PORT", "587"))
    SMTP_USER: Optional[str] = os.getenv("SMTP_USER")
    SMTP_PASS: Optional[str] = os.getenv("SMTP_PASS")
    SMTP_FROM: Optional[str] = os.getenv("SMTP_FROM")

    # Google OAuth
    GOOGLE_CLIENT_ID: Optional[str] = os.getenv("GOOGLE_CLIENT_ID")
    # Public base URL for serving uploaded files (e.g. http://localhost:8000). If not set, request.base_url is used.
    API_PUBLIC_URL: Optional[str] = os.getenv("API_PUBLIC_URL", "")
    # Local uploads directory (avatars saved here when not using S3)
    UPLOADS_DIR: str = os.getenv("UPLOADS_DIR", os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads"))
    # Comma-separated origins for production (e.g. https://app.anilink.com). In DEBUG, all origins allowed.
    CORS_ORIGINS: Optional[List[str]] = None
    # Frontend dev origin (Vite default); set in .env for production
    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Union[str, List[str], None]) -> Optional[List[str]]:
        """Parse CORS origins from comma-separated string."""
        if v is None:
            return None
        if isinstance(v, str):
            origins = [origin.strip() for origin in v.split(",") if origin.strip()]
            return origins if origins else None
        return v
    
    # Model service (ONNX inference)
    MODEL_SERVICE_URL: str = os.getenv("MODEL_SERVICE_URL", "http://model-service:9002")

    # File upload
    MAX_UPLOAD_SIZE: int = 5 * 1024 * 1024  # 5MB
    ALLOWED_IMAGE_TYPES: List[str] = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
