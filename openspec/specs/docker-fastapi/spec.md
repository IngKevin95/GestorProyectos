# docker-fastapi Specification

## Purpose
TBD - created by archiving change docker-infra. Update Purpose after archive.
## Requirements
### Requirement: FastAPI backend in Docker
The system SHALL run the FastAPI backend in a container that waits for PostgreSQL to be healthy before starting the application server.

#### Scenario: Backend starts and listens on port 8000
- **WHEN** `docker-compose up -d` completes and postgres is healthy
- **THEN** `curl http://localhost:8000/health` responds with HTTP 200

#### Scenario: Backend waits for database before full startup
- **WHEN** postgres is not yet healthy when backend container starts
- **THEN** backend retries connection with exponential backoff (1s, 2s, 4s, 8s max) and starts once postgres is healthy

### Requirement: Health endpoint with database connectivity status
The system SHALL expose GET /health that returns JSON with status and database connection state.

#### Scenario: Health check reports db connected
- **WHEN** `GET /health` is called and postgres is responding
- **THEN** response is `{status: "ok", db: "connected"}` with HTTP 200

#### Scenario: Health check reports db disconnected
- **WHEN** `GET /health` is called and postgres is not responding
- **THEN** response is `{status: "degraded", db: "disconnected"}` with HTTP 503

### Requirement: Environment variables for configuration
The system SHALL accept DATABASE_URL, JWT_SECRET_KEY, DEBUG via environment variables.

#### Scenario: Backend uses injected environment
- **WHEN** docker-compose.yml sets DATABASE_URL=postgresql://... and JWT_SECRET_KEY=secret123
- **THEN** backend connects using those credentials and doesn't log them to stdout

### Requirement: SQLAlchemy 2.0 async engine
The system SHALL use SQLAlchemy 2.0 with async engine (asyncpg driver) for database connections.

#### Scenario: Async connection pool works
- **WHEN** multiple concurrent requests arrive at an endpoint using `async def` handler
- **THEN** responses complete without blocking (verify via load test: >50 concurrent requests in <5s)

