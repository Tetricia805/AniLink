# AniLink Backend API

FastAPI backend for AniLink - AI-driven animal health and veterinary platform.

## Tech Stack

- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Database
- **SQLAlchemy 2.0** - ORM
- **Alembic** - Database migrations
- **Pydantic v2** - Data validation
- **MinIO** - S3-compatible object storage
- **Docker Compose** - Local development environment

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI application entry
│   ├── core/                # Core utilities
│   │   ├── config.py        # Settings and configuration
│   │   ├── db.py            # Database setup
│   │   ├── security.py      # JWT and password hashing
│   │   ├── logging.py       # Logging configuration
│   │   └── exceptions.py    # Exception handlers
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   ├── vets/            # Veterinarian management
│   │   ├── cases/           # Animal health cases
│   │   ├── ai/              # AI assessment (returns PENDING)
│   │   ├── bookings/        # Appointment bookings
│   │   ├── animals/         # Animal records
│   │   ├── marketplace/     # Product marketplace
│   │   ├── orders/          # Order management
│   │   └── notifications/   # Notifications
│   └── shared/              # Shared utilities
│       ├── pagination.py    # Pagination helpers
│       ├── geo.py           # Geographic calculations
│       └── storage.py       # File upload/storage
├── alembic/                 # Database migrations
├── scripts/                 # Utility scripts
│   └── seed_data.py         # Seed development data
├── requirements.txt         # Python dependencies
├── Dockerfile               # Docker image
├── docker-compose.yml       # Local development stack
└── .env.example             # Environment variables template
```

## Quick Start

### Using Docker Compose (Recommended)

**What you need:** Docker and Docker Compose installed. No local Python, PostgreSQL, or MinIO required.

1. **Copy environment file** (optional; compose has defaults)
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

   This starts:
   - **PostgreSQL** (host port 54320; internal 5432)
   - **MinIO** – API 9000, Console 9001
   - **FastAPI backend** – http://localhost:8000
   - **pgAdmin** – http://localhost:5050 (optional)

3. **Run migrations**
   ```bash
   docker-compose exec backend alembic upgrade head
   ```

4. **Seed data (optional)**
   ```bash
   docker-compose exec backend python scripts/seed_data.py
   ```

5. **Use the API**
   - API: http://localhost:8000
   - API Docs: http://localhost:8000/docs
   - MinIO Console: http://localhost:9001 (minioadmin / minioadmin)
   - pgAdmin: http://localhost:5050 (admin@anilink.ug / admin123)

### Manual Setup

1. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Setup PostgreSQL**
   - Create database: `anilink_db`
   - Update `DATABASE_URL` in `.env`

3. **Setup MinIO** (or use Docker)
   - Install MinIO
   - Create bucket: `anilink-uploads`
   - Update MinIO settings in `.env`

4. **Run migrations**
   ```bash
   alembic upgrade head
   ```

5. **Seed data (optional)**
   ```bash
   python scripts/seed_data.py
   ```

6. **Run server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## API Endpoints

### Authentication
- `POST /v1/auth/register` - Register new user
- `POST /v1/auth/login` - Login
- `POST /v1/auth/refresh` - Refresh access token
- `POST /v1/auth/logout` - Logout

### Users
- `GET /v1/users/me` - Get current user
- `PUT /v1/users/me` - Update profile
- `GET /v1/users/me/profile` - Get user profile
- `PUT /v1/users/me/profile` - Update user profile

### Cases
- `POST /v1/cases` - Create case (multipart with images)
- `GET /v1/cases` - List cases
- `GET /v1/cases/{id}` - Get case details
- `POST /v1/cases/{id}/request-ai` - Request AI assessment

### Vets
- `GET /v1/vets` - Search vets (with proximity filters)
- `GET /v1/vets/{id}` - Get vet profile
- `PUT /v1/vets/me` - Update vet profile

### Bookings
- `POST /v1/bookings` - Create booking
- `GET /v1/bookings` - List bookings
- `GET /v1/bookings/{id}` - Get booking details
- `PUT /v1/bookings/{id}/status` - Update booking status

### Animals
- `POST /v1/animals` - Create animal record
- `GET /v1/animals` - List animals
- `GET /v1/animals/{id}` - Get animal details

### Marketplace
- `GET /v1/marketplace/products` - List products
- `GET /v1/marketplace/products/{id}` - Get product details
- `POST /v1/marketplace/products` - Create product (SELLER only)

### Orders
- `POST /v1/orders` - Create order
- `GET /v1/orders` - List orders
- `GET /v1/orders/{id}` - Get order details
- `PUT /v1/orders/{id}/cancel` - Cancel order

### Notifications
- `GET /v1/notifications` - List notifications
- `POST /v1/notifications/{id}/read` - Mark as read
- `POST /v1/notifications/register-device` - Register FCM token

### AI
- `POST /v1/ai/fmd/predict` - FMD prediction (returns PENDING)

## Environment Variables

See `.env.example` for all configuration options:

- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret key (use strong key in production)
- `MINIO_ENDPOINT` - MinIO server endpoint
- `MINIO_ACCESS_KEY` - MinIO access key
- `MINIO_SECRET_KEY` - MinIO secret key
- `MINIO_BUCKET_NAME` - Storage bucket name
- `CORS_ORIGINS` - Allowed CORS origins

## Database Migrations

### Create migration
```bash
alembic revision --autogenerate -m "description"
```

### Apply migrations
```bash
alembic upgrade head
```

### Rollback migration
```bash
alembic downgrade -1
```

## Development

### Running Tests
```bash
pytest
```

### Code Formatting
```bash
black .
isort .
```

### Type Checking
```bash
mypy app/
```

## Production Deployment

1. Set `DEBUG=False` in environment
2. Use strong `SECRET_KEY`
3. Configure production database
4. Setup S3/MinIO with proper access controls
5. Configure CORS for production domains
6. Use reverse proxy (nginx) for SSL
7. Run migrations before deployment

## Frontend Integration

The backend is designed to match the Flutter frontend exactly:

- All endpoints match frontend API calls
- Response schemas match frontend DTOs
- Field names match frontend expectations (camelCase)
- Distance calculations included in responses
- Multipart case creation supported

Base URL for frontend: `http://localhost:8000/v1` (dev)

## Notes

- AI assessment endpoint returns `PENDING` status until ML models are integrated
- Distance calculations use Haversine formula
- Image uploads are stored in MinIO (S3-compatible)
- JWT tokens: 15min access, 30 day refresh
- All timestamps are timezone-aware (UTC)

## Troubleshooting

### Database connection errors
- Check PostgreSQL is running
- Verify `DATABASE_URL` in `.env`
- Ensure database exists

### MinIO connection errors
- Check MinIO is running
- Verify endpoint and credentials
- Ensure bucket exists (created automatically)

### Migration errors
- Drop and recreate database if needed
- Check migration files are correct
- Ensure all models are imported in `alembic/env.py`

## License

Proprietary - AniLink Platform
