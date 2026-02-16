# Running Frontend and Backend Separately

This guide shows you how to run only the frontend or only the backend using Docker Compose.

## Prerequisites

Make sure you're in the project directory:
```powershell
cd "C:\Users\USER\Desktop\AniLink_new\AniLink\Anilink final V3"
```

## Running Backend Only

### Start Backend with Dependencies (Database, MinIO, etc.)
```powershell
docker compose up backend db minio model-service init
```

**What this does:**
- Starts database (required for backend)
- Starts MinIO (file storage)
- Starts model-service (AI service)
- Runs init (migrations)
- Starts backend API

**Or start in background:**
```powershell
docker compose up -d backend db minio model-service init
```

### Start Backend Only (if dependencies already running)
```powershell
docker compose up backend
```

**In background:**
```powershell
docker compose up -d backend
```

### View Backend Logs
```powershell
docker compose logs -f backend
```

### Stop Backend
```powershell
docker compose stop backend
```

## Running Frontend Only

### Start Frontend (requires backend to be running)
```powershell
docker compose up frontend
```

**In background:**
```powershell
docker compose up -d frontend
```

### View Frontend Logs
```powershell
docker compose logs -f frontend
```

### Stop Frontend
```powershell
docker compose stop frontend
```

## Common Scenarios

### Scenario 1: Backend Only (for API testing)
```powershell
# Start backend with all dependencies
docker compose up -d db minio model-service init backend

# Check status
docker compose ps

# View backend logs
docker compose logs -f backend

# Access: http://localhost:8000/docs
```

### Scenario 2: Frontend Only (backend already running)
```powershell
# Start frontend
docker compose up -d frontend

# View logs
docker compose logs -f frontend

# Access: http://localhost:5173
```

### Scenario 3: Restart Just Backend
```powershell
docker compose restart backend
```

### Scenario 4: Restart Just Frontend
```powershell
docker compose restart frontend
```

## Running Without Docker (Local Development)

### Backend (Python/FastAPI)

**Prerequisites:**
- Python 3.11+
- PostgreSQL running (or use Docker for just DB)
- MinIO running (or use Docker for just MinIO)

**Commands:**
```powershell
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or use .env file)
$env:DATABASE_URL="postgresql://anilink:anilink123@localhost:54320/anilink_db"
$env:MINIO_ENDPOINT="localhost:9000"
$env:MINIO_ACCESS_KEY="minioadmin"
$env:MINIO_SECRET_KEY="minioadmin"
$env:SECRET_KEY="dev-secret-key-change-in-production"

# Run migrations
alembic upgrade head

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React/Vite)

**Prerequisites:**
- Node.js 20+
- npm

**Commands:**
```powershell
# Navigate to frontend
cd anilink-web

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Quick Reference

| Task | Command |
|------|---------|
| Start backend only | `docker compose up backend` |
| Start frontend only | `docker compose up frontend` |
| Start backend + deps | `docker compose up backend db minio model-service` |
| View backend logs | `docker compose logs -f backend` |
| View frontend logs | `docker compose logs -f frontend` |
| Restart backend | `docker compose restart backend` |
| Restart frontend | `docker compose restart frontend` |
| Stop backend | `docker compose stop backend` |
| Stop frontend | `docker compose stop frontend` |

## Dependencies

**Backend needs:**
- Database (db)
- MinIO (minio)
- Model Service (model-service)
- Init (runs once for migrations)

**Frontend needs:**
- Backend (backend) - to make API calls

## Tips

1. **Backend first:** Always start backend dependencies before starting backend
2. **Check status:** Use `docker compose ps` to see what's running
3. **View logs:** Use `-f` flag to follow logs in real-time
4. **Background mode:** Use `-d` flag to run in background
5. **Dependencies:** Frontend can't work without backend running
