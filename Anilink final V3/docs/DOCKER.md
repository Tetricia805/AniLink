# AniLink Docker Setup

Run backend + frontend (Vite/React) with Docker Compose. Run from **repo root** (`ANILINK/`).

## Prerequisites

- Docker and Docker Compose
- Repo cloned with `anilink-web/` and `backend/` at root

## Docker Dev (hot reload)

Frontend: Vite dev server at http://localhost:5173 with HMR  
Backend: FastAPI at http://localhost:8000 with `--reload`  
Code changes on the host reflect immediately; no rebuild needed unless dependencies change.

```bash
# From repo root (ANILINK/)
docker compose up

# Open app
# http://localhost:5173
```

On first run (or after `docker compose down -v`):
1. DB + MinIO start
2. Init service runs once: `alembic upgrade head` then `python scripts/seed_data.py`
3. Backend starts (waits for init)
4. Frontend starts with hot reload

Optional: include pgAdmin:

```bash
docker compose up
# pgAdmin at http://localhost:5050 (included by default)
```

## Docker Prod (nginx)

Frontend: nginx serving built static files at http://localhost:8080  
Backend: FastAPI at http://localhost:8000  
API calls go to same-origin `/v1`, proxied by nginx to the backend.

```bash
docker compose --profile prod up -d --build

# Open app
# http://localhost:8080
```

## Environment

| Mode              | VITE_API_BASE_URL | Notes                                      |
|-------------------|-------------------|--------------------------------------------|
| Local (no Docker) | http://localhost:8000/v1 | Set in `.env` or `.env.local`        |
| Docker dev        | /v1               | Passed in compose; Vite proxy → backend    |
| Docker prod       | /v1               | Baked at build; nginx proxy → backend      |

## Commands

| Action            | Command                                            |
|-------------------|----------------------------------------------------|
| Normal dev        | `docker compose up`                                |
| Dependencies changed | `docker compose up --build`                     |
| Nuclear reset     | `docker compose down -v && docker compose up --build` |
| View logs         | `docker compose logs -f frontend`                  |
| Stop              | `docker compose down`                              |
| Stop + volumes    | `docker compose down -v`                           |

## Troubleshooting

- **"key cannot contain a space"**: Fix or remove root `.env` if malformed. Compose loads it automatically.
- **Frontend build fails**: Ensure `npm run build` passes locally (TypeScript must compile).

## Validation

1. **Backend health**: `curl http://localhost:8000/health`
2. **Frontend**: Open http://localhost:5173 (dev) or http://localhost:8080 (prod)
3. **Login**: owner@example.com / password123
4. **Owner /vets**: Loads real data
5. **Notifications**: Load
6. **No CORS errors**: Check browser console

## Seed database (first run)

Migrations and seed run automatically on `docker compose up` via the `init` service.  
To re-run manually:

```bash
docker compose exec backend alembic upgrade head
docker compose exec backend python scripts/seed_data.py
```
