# Docker Commands Guide for AniLink

This guide shows you how to run the AniLink application using Docker Compose from the terminal.

## Prerequisites

Make sure Docker Desktop is running on your Windows machine.

## Step-by-Step Commands

### 1. Navigate to Project Directory

```powershell
cd "C:\Users\USER\Desktop\AniLink_new\AniLink\Anilink final V3"
```

### 2. Check Docker is Running

```powershell
docker ps
```
**What this does:** Lists running containers. If Docker is working, you'll see a list (may be empty).

### 3. View Docker Compose Configuration

```powershell
docker compose config
```
**What this does:** Shows the parsed docker-compose.yml configuration. Useful to verify everything is correct.

### 4. Start All Services (Backend + Frontend)

```powershell
docker compose up
```
**What this does:** 
- Starts all services defined in docker-compose.yml
- Shows logs in real-time
- Press `Ctrl+C` to stop

**Alternative - Run in Background:**
```powershell
docker compose up -d
```
**What this does:** 
- `-d` flag runs in "detached" mode (background)
- Services run but you get your terminal back
- Use this if you want to continue using terminal

**First Time Build:**
```powershell
docker compose up --build
```
**What this does:** 
- `--build` rebuilds Docker images before starting
- Use this when dependencies change or first time setup

### 5. Check Service Status

```powershell
docker compose ps
```
**What this does:** Shows status of all services (running, stopped, etc.)

**Check Specific Service:**
```powershell
docker compose ps backend
docker compose ps frontend
```

### 6. View Logs

**All Services:**
```powershell
docker compose logs
```

**Follow Logs (Real-time):**
```powershell
docker compose logs -f
```
**What this does:** `-f` follows logs like `tail -f`, shows new log lines as they appear

**Specific Service:**
```powershell
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db
```

**Last N Lines:**
```powershell
docker compose logs --tail 50 frontend
```

### 7. Stop Services

**Stop (keeps containers):**
```powershell
docker compose stop
```
**What this does:** Stops services but keeps containers. Can restart with `docker compose start`

**Stop and Remove Containers:**
```powershell
docker compose down
```
**What this does:** Stops and removes containers, but keeps volumes (data persists)

**Stop and Remove Everything (including volumes):**
```powershell
docker compose down -v
```
**What this does:** Complete cleanup - removes containers, networks, and volumes. **WARNING:** This deletes database data!

### 8. Restart Services

**Restart All:**
```powershell
docker compose restart
```

**Restart Specific Service:**
```powershell
docker compose restart backend
docker compose restart frontend
```

### 9. Rebuild After Code Changes

**Rebuild and Start:**
```powershell
docker compose up --build
```

**Rebuild Specific Service:**
```powershell
docker compose build backend
docker compose build frontend
```

### 10. Execute Commands Inside Containers

**Run Command in Backend Container:**
```powershell
docker compose exec backend python --version
docker compose exec backend alembic upgrade head
```

**Open Shell in Container:**
```powershell
docker compose exec backend sh
docker compose exec frontend sh
```

**Exit shell:** Type `exit` or press `Ctrl+D`

### 11. Check Service Health

**Backend Health Check:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
```

**Or using curl (if installed):**
```powershell
curl http://localhost:8000/health
```

### 12. View Resource Usage

```powershell
docker stats
```
**What this does:** Shows CPU, memory, and network usage for all running containers

## Common Workflows

### First Time Setup
```powershell
# 1. Navigate to project
cd "C:\Users\USER\Desktop\AniLink_new\AniLink\Anilink final V3"

# 2. Build and start everything
docker compose up --build -d

# 3. Check status
docker compose ps

# 4. View logs
docker compose logs -f
```

### Daily Development
```powershell
# Start services
docker compose up -d

# View frontend logs
docker compose logs -f frontend

# Stop when done
docker compose down
```

### Troubleshooting
```powershell
# View all logs
docker compose logs

# Check specific service
docker compose logs backend

# Restart problematic service
docker compose restart backend

# Complete reset (removes data!)
docker compose down -v
docker compose up --build
```

## Understanding the Services

When you run `docker compose up`, these services start:

1. **db** - PostgreSQL database (port 54320)
2. **minio** - File storage (ports 9000, 9001)
3. **model-service** - AI inference service (internal)
4. **init** - Runs database migrations and seed data (runs once)
5. **backend** - FastAPI server (port 8000)
6. **frontend** - React/Vite dev server (port 5173)
7. **pgadmin** - Database admin tool (port 5050)

## Access URLs

After starting, access:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs
- **MinIO Console:** http://localhost:9001
- **pgAdmin:** http://localhost:5050

## Tips

1. **Use `-d` flag** to run in background and keep using terminal
2. **Use `-f` flag** with logs to follow in real-time
3. **Use `--build`** when dependencies or Dockerfiles change
4. **Use `docker compose ps`** to quickly check what's running
5. **Use `docker compose down`** to clean stop (keeps data)
6. **Use `docker compose down -v`** only when you want to reset everything
