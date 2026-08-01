# GestorProyectos

Gestor de proyectos empresariales con detección automática de salud, priorización inteligente y integración de datos.

## Quick Start

### Prerequisites

- Docker & Docker Compose
- (Optional) Python 3.11+ for local development

### Start the Stack

```bash
# Copy environment configuration
cp .env.example .env

# Start all services
docker-compose up -d

# Verify stack is healthy (wait ~30 seconds for startup)
./scripts/smoke-test.sh
```

The stack will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **PostgreSQL**: localhost:5432

### Stop the Stack

```bash
docker-compose down
```

To also delete the database volume:
```bash
docker-compose down -v
```

## Architecture

### Services

- **PostgreSQL 15** (`postgres`): Database with automatic schema initialization
- **FastAPI Backend** (`backend`): Python async API with SQLAlchemy 2.0
- **React Frontend** (`frontend`): React 18 + Vite SPA

### Health Checks

Each service includes health checks:
- PostgreSQL: TCP port 5432
- Backend: GET `/health` endpoint
- Frontend: HTTP port 3000

Services start in dependency order:
1. PostgreSQL (must be healthy before backend starts)
2. Backend (must be healthy before frontend starts)
3. Frontend (after backend health check passes)

## Development

### Environment Variables

Copy `.env.example` to `.env` and customize:

```bash
POSTGRES_USER=gestor
POSTGRES_PASSWORD=password
POSTGRES_DB=gestor_proyectos
JWT_SECRET_KEY=your-secret-key-change-in-production
DEBUG=true  # Set to true for development
SEED_DATA=false  # Set to true to load example data
```

### Database

Schema is automatically initialized from `backend/db/init.sql`:
- `projects` - Project catalog
- `tasks` - Task tracking
- `team` - Team members
- `audit_log` - Change log

### API Endpoints

- `GET /health` - Health check (status, db connectivity)
- `GET /` - API info
- `GET /docs` - Interactive API documentation (Swagger UI)

## Testing

### Smoke Tests

Verify the complete stack is healthy:

```bash
./scripts/smoke-test.sh
```

This checks:
- All services are running
- PostgreSQL is responding
- Backend /health endpoint works
- Frontend is serving
- Database tables exist

### Unit Tests

Backend tests:
```bash
cd backend
pip install -r requirements.txt
pytest tests/
```

Frontend tests:
```bash
cd frontend
npm install
npm test
```

## Troubleshooting

### Port Already in Use

If ports 3000, 8000, or 5432 are in use, override in `.env`:

```bash
FRONTEND_PORT=3001
BACKEND_PORT=8001
POSTGRES_PORT=5433
docker-compose up -d
```

### Database Connection Error

Backend retries database connection with exponential backoff. If error persists:

```bash
# Check postgres logs
docker-compose logs postgres

# Verify postgres is healthy
docker-compose ps
```

### Frontend Can't Reach Backend

Ensure `VITE_API_URL` matches your backend location (default: `http://localhost:8000`).

### Docker Not Installed

Install from https://www.docker.com/products/docker-desktop

## Data Seeding

To load example data on startup:

```bash
SEED_DATA=true docker-compose up -d
```

Example data files:
- `backend/data/projects.csv`
- `backend/data/tasks.csv`

## Production Deployment

For production:

1. Change `JWT_SECRET_KEY` to a strong secret
2. Update database credentials
3. Set `DEBUG=false`
4. Use a production-grade database backup strategy
5. Configure proper logging and monitoring

## Project Status

- **Phase**: Development (Infrastructure - EP-000)
- **Tests**: Passing (RED-GREEN-REFACTOR complete)
- **Smoke**: Ready for E2E validation

---

Built with ❤️ using FastAPI, React, and PostgreSQL
