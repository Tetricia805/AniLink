# Running Frontend and Backend Locally (Without Docker)

These are the commands you'll run directly in your terminal, even when offline (after initial setup).

## Prerequisites

### For Frontend:
- Node.js 20+ installed
- npm installed (comes with Node.js)

### For Backend:
- Python 3.11+ installed
- PostgreSQL database running (or use Docker just for DB)
- MinIO running (or use Docker just for MinIO)

---

## 🎨 FRONTEND COMMANDS

### First Time Setup (One-time)
```powershell
# Navigate to frontend folder
cd anilink-web

# Install dependencies
npm install
```

### Run Frontend (Every time you want to start it)
```powershell
# From anilink-web folder
npm run dev
```

**What this does:**
- Starts Vite dev server
- Runs on http://localhost:5173
- Hot reload enabled (auto-refreshes on code changes)

**Alternative commands:**
```powershell
# Build for production
npm run build

# Preview production build
npm run preview
```

---

## 🐍 BACKEND COMMANDS

### First Time Setup (One-time)

#### 1. Install Python Dependencies
```powershell
# Navigate to backend folder
cd backend

# Install all Python packages
pip install -r requirements.txt
```

#### 2. Setup Database
You have two options:

**Option A: Use Docker just for database**
```powershell
# From project root
docker compose up -d db
```

**Option B: Install PostgreSQL locally**
- Install PostgreSQL
- Create database: `anilink_db`
- Update `.env` file with connection string

#### 3. Setup MinIO (File Storage)
You have two options:

**Option A: Use Docker just for MinIO**
```powershell
# From project root
docker compose up -d minio
```

**Option B: Install MinIO locally**
- Download MinIO from https://min.io/download
- Run MinIO server
- Create bucket: `anilink-uploads`

#### 4. Create .env File (if not exists)
```powershell
# In backend folder, create .env file with:
DATABASE_URL=postgresql://anilink:anilink123@localhost:54320/anilink_db
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=anilink-uploads
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
FRONTEND_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
```

#### 5. Run Database Migrations
```powershell
# From backend folder
alembic upgrade head
```

#### 6. Seed Data (Optional)
```powershell
# From backend folder
python scripts/seed_data.py
```

### Run Backend (Every time you want to start it)
```powershell
# From backend folder
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**What this does:**
- Starts FastAPI server
- Runs on http://localhost:8000
- `--reload` enables auto-reload on code changes
- `--host 0.0.0.0` makes it accessible from network
- `--port 8000` sets the port

**Alternative commands:**
```powershell
# Without auto-reload (faster, but no hot reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000

# Using Python module syntax
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

---

## 📋 QUICK REFERENCE

### Frontend
| Task | Command |
|------|---------|
| Install dependencies | `cd anilink-web && npm install` |
| Start dev server | `cd anilink-web && npm run dev` |
| Build for production | `cd anilink-web && npm run build` |

### Backend
| Task | Command |
|------|---------|
| Install dependencies | `cd backend && pip install -r requirements.txt` |
| Run migrations | `cd backend && alembic upgrade head` |
| Start server | `cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000` |
| Seed data | `cd backend && python scripts/seed_data.py` |

---

## 🚀 COMPLETE WORKFLOW

### First Time (Full Setup)

**Terminal 1 - Database & MinIO (Docker):**
```powershell
# From project root
docker compose up -d db minio
```

**Terminal 2 - Backend:**
```powershell
# Navigate to backend
cd backend

# Install dependencies (first time only)
pip install -r requirements.txt

# Run migrations (first time only)
alembic upgrade head

# Seed data (first time only, optional)
python scripts/seed_data.py

# Start backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 3 - Frontend:**
```powershell
# Navigate to frontend
cd anilink-web

# Install dependencies (first time only)
npm install

# Start frontend
npm run dev
```

### Daily Development (After First Time)

**Terminal 1 - Backend:**
```powershell
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```powershell
cd anilink-web
npm run dev
```

---

## 🔧 TROUBLESHOOTING

### Frontend Issues

**Port already in use:**
```powershell
# Kill process on port 5173 (Windows)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

**Dependencies outdated:**
```powershell
cd anilink-web
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Port already in use:**
```powershell
# Kill process on port 8000 (Windows)
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

**Database connection error:**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env file
- Check database exists: `psql -U anilink -d anilink_db`

**Module not found:**
```powershell
cd backend
pip install -r requirements.txt
```

**Migration errors:**
```powershell
cd backend
alembic upgrade head
# Or reset: alembic downgrade base && alembic upgrade head
```

---

## 📝 ENVIRONMENT VARIABLES

Create `backend/.env` file:
```env
DATABASE_URL=postgresql://anilink:anilink123@localhost:54320/anilink_db
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=anilink-uploads
SECRET_KEY=dev-secret-key-change-in-production
DEBUG=True
FRONTEND_ORIGIN=http://localhost:5173
CORS_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:8080
MODEL_SERVICE_URL=http://localhost:9002
```

---

## 🎯 ACCESS URLs

After starting:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **MinIO Console:** http://localhost:9001 (if using Docker)

---

## 💡 TIPS

1. **Use separate terminals** - One for backend, one for frontend
2. **Keep database running** - Use Docker just for DB: `docker compose up -d db`
3. **Hot reload** - Both `npm run dev` and `uvicorn --reload` auto-refresh on code changes
4. **Check ports** - Make sure ports 8000 and 5173 are not in use
5. **Environment variables** - Backend reads from `.env` file automatically

---

## 🔄 HYBRID APPROACH (Recommended)

Run database and MinIO with Docker, but run backend and frontend locally:

**Terminal 1:**
```powershell
# Start only database and MinIO
docker compose up -d db minio
```

**Terminal 2:**
```powershell
# Run backend locally
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 3:**
```powershell
# Run frontend locally
cd anilink-web
npm run dev
```

This gives you:
- ✅ Easy database management (Docker)
- ✅ Fast local development (no Docker overhead)
- ✅ Full control over backend/frontend code
- ✅ Hot reload works perfectly
