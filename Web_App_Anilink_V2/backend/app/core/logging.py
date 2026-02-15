import logging
import sys
from logging.handlers import RotatingFileHandler
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

# Configure root logger
logger = logging.getLogger("anilink")
logger.setLevel(logging.INFO)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)

# Formatter
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
console_handler.setFormatter(formatter)

logger.addHandler(console_handler)


def setup_logging():
    """Setup application logging."""
    pass


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to add request ID to each request."""
    
    async def dispatch(self, request: Request, call_next):
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response
