import boto3
from botocore.exceptions import ClientError
from fastapi import UploadFile, HTTPException, status
from typing import Optional
import uuid
from datetime import datetime, timedelta

from app.core.config import settings


class StorageService:
    """Service for handling file uploads to S3-compatible storage (MinIO)."""
    
    def __init__(self):
        self.client = boto3.client(
            's3',
            endpoint_url=f"http{'s' if settings.MINIO_USE_SSL else ''}://{settings.MINIO_ENDPOINT}",
            aws_access_key_id=settings.MINIO_ACCESS_KEY,
            aws_secret_access_key=settings.MINIO_SECRET_KEY,
            region_name='us-east-1',  # MinIO doesn't care about region
        )
        self.bucket_name = settings.MINIO_BUCKET_NAME
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Ensure the bucket exists, create if not."""
        try:
            self.client.head_bucket(Bucket=self.bucket_name)
        except ClientError:
            try:
                self.client.create_bucket(Bucket=self.bucket_name)
            except ClientError as e:
                raise Exception(f"Failed to create bucket: {e}")
    
    def _validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file."""
        # Check file size
        file.file.seek(0, 2)  # Seek to end
        file_size = file.file.tell()
        file.file.seek(0)  # Reset to start
        
        if file_size > settings.MAX_UPLOAD_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size exceeds {settings.MAX_UPLOAD_SIZE / 1024 / 1024}MB limit"
            )
        
        # Check content type
        if file.content_type not in settings.ALLOWED_IMAGE_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Allowed: {', '.join(settings.ALLOWED_IMAGE_TYPES)}"
            )
    
    def _generate_file_key(self, folder: str, filename: str) -> str:
        """Generate a unique file key for storage."""
        ext = filename.split('.')[-1] if '.' in filename else 'jpg'
        unique_id = str(uuid.uuid4())
        return f"{folder}/{unique_id}.{ext}"
    
    async def upload_file(
        self,
        file: UploadFile,
        folder: str = "uploads",
    ) -> str:
        """
        Upload a file to storage.
        
        Returns:
            Public URL of the uploaded file
        """
        self._validate_file(file)
        
        # Generate unique file key
        file_key = self._generate_file_key(folder, file.filename or "image.jpg")
        
        try:
            # Read file content
            file_content = await file.read()
            
            # Upload to S3/MinIO
            self.client.put_object(
                Bucket=self.bucket_name,
                Key=file_key,
                Body=file_content,
                ContentType=file.content_type,
            )
            
            # Generate public URL
            # For MinIO, construct URL directly
            protocol = "https" if settings.MINIO_USE_SSL else "http"
            public_url = f"{protocol}://{settings.MINIO_ENDPOINT}/{self.bucket_name}/{file_key}"
            
            return public_url
            
        except ClientError as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Failed to upload file: {str(e)}"
            )
    
    async def upload_multiple_files(
        self,
        files: list[UploadFile],
        folder: str = "uploads",
    ) -> list[str]:
        """Upload multiple files."""
        urls = []
        for file in files:
            url = await self.upload_file(file, folder)
            urls.append(url)
        return urls
    
    def delete_file(self, file_url: str) -> bool:
        """Delete a file from storage."""
        try:
            # Extract key from URL
            key = file_url.split(f"/{self.bucket_name}/")[-1]
            self.client.delete_object(Bucket=self.bucket_name, Key=key)
            return True
        except Exception:
            return False


# Global storage service instance
storage_service = StorageService()
