# Tasks — docker-infra (EP-000)

Implementation checklist for Docker infrastructure (PostgreSQL, FastAPI, React, docker-compose).

## 1. Database Setup (HU-024)

- [ ] 1.1 Create `backend/Dockerfile.postgres` with PostgreSQL 15 base image
- [ ] 1.2 Create `backend/db/init.sql` with schema definition (projects, tasks, team, audit_log tables)
- [ ] 1.3 Configure health check in Dockerfile (TCP port 5432)
- [ ] 1.4 Test: Run postgres container standalone, verify tables created with `psql -h localhost -U gestor -d gestor_proyectos`

## 2. Backend FastAPI Dockerfile (HU-025)

- [ ] 2.1 Create `backend/Dockerfile` with Python 3.11-slim base
- [ ] 2.2 Install dependencies: FastAPI, uvicorn, SQLAlchemy 2.0, asyncpg, pydantic
- [ ] 2.3 Implement `backend/app/main.py` with FastAPI app instance
- [ ] 2.4 Create `/health` endpoint that returns `{status: "ok", db: "connected"}` with DB connectivity check
- [ ] 2.5 Implement database connection string parsing from DATABASE_URL env var
- [ ] 2.6 Implement startup health check (retry loop: 1s, 2s, 4s, 8s) before starting uvicorn
- [ ] 2.7 Configure CORS to allow localhost:3000 in FastAPI middleware
- [ ] 2.8 Test: Run backend container, verify `curl http://localhost:8000/health` returns 200

## 3. Frontend React Dockerfile (HU-026)

- [ ] 3.1 Create `frontend/Dockerfile` with Node 18-alpine base
- [ ] 3.2 Copy package.json, run `npm ci` in build stage
- [ ] 3.3 Build frontend with `npm run build`
- [ ] 3.4 Use multi-stage build: final stage runs `npm run preview` or vite preview on port 3000
- [ ] 3.5 Create `frontend/.env.example` with VITE_API_URL=http://localhost:8000
- [ ] 3.6 Implement `frontend/src/health.ts` module to check `GET /health` every 2s
- [ ] 3.7 Implement `frontend/src/App.tsx` loading state ("Conectando...") until backend is healthy
- [ ] 3.8 Test: Run frontend container, verify http://localhost:3000 loads and displays loading state initially

## 4. Docker-Compose Orchestration (HU-027)

- [ ] 4.1 Create `docker-compose.yml` at project root with 3 services (postgres, backend, frontend)
- [ ] 4.2 Configure postgres service: image postgres:15-alpine, environment vars, volume pgdata, health check
- [ ] 4.3 Configure backend service: depends_on postgres with condition service_healthy, environment vars (DATABASE_URL, JWT_SECRET_KEY, DEBUG), port 8000:8000
- [ ] 4.4 Configure frontend service: depends_on backend with condition service_healthy, environment var VITE_API_URL, port 3000:3000
- [ ] 4.5 Create `.env.example` with sample values: POSTGRES_USER, POSTGRES_PASSWORD, DATABASE_NAME, JWT_SECRET_KEY, DEBUG, SEED_DATA
- [ ] 4.6 Add .gitignore entries for `.env`, `pgdata/`, `backend/.venv/`, `frontend/node_modules/`
- [ ] 4.7 Test: Run `docker-compose up -d`, verify all services healthy in <30 seconds

## 5. Seed Data (Optional, HU-027)

- [ ] 5.1 Create `backend/db/seed.py` script that loads projects.csv and tasks.csv (if SEED_DATA=true)
- [ ] 5.2 Integrate seed script into backend startup: run after DB schema is ready if SEED_DATA env var set
- [ ] 5.3 Provide example `projects.csv` and `tasks.csv` files in `backend/data/`
- [ ] 5.4 Test: Run with SEED_DATA=true, verify frontend displays seeded data

## 6. Verification & E2E (HU-027)

- [ ] 6.1 Start fresh: `docker-compose down -v`, `docker-compose up -d`
- [ ] 6.2 Verify postgres is healthy: `docker-compose ps` shows postgres (Up, healthy)
- [ ] 6.3 Verify backend is healthy: `curl http://localhost:8000/health` returns `{status: "ok", db: "connected"}`
- [ ] 6.4 Verify frontend loads: http://localhost:3000 shows app
- [ ] 6.5 Verify frontend can call backend: browser console shows no CORS errors
- [ ] 6.6 Verify persistence: Create test table in postgres, `docker-compose down`, `docker-compose up -d`, verify table still exists
- [ ] 6.7 Verify cleanup: `docker-compose down` removes containers but volume pgdata persists

## 7. Documentation

- [ ] 7.1 Write `README.md` section "Quick Start" with `docker-compose up -d` instructions
- [ ] 7.2 Document environment variables in `.env.example` with comments
- [ ] 7.3 Add troubleshooting section: port conflicts, Docker not installed, database permission errors
- [ ] 7.4 Update CONTRIBUTING.md or dev setup guide to mention Docker setup
