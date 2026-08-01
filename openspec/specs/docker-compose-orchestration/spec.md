# docker-compose-orchestration Specification

## Purpose
TBD - created by archiving change docker-infra. Update Purpose after archive.
## Requirements
### Requirement: Docker-compose.yml orchestrates three services
The system SHALL define a docker-compose.yml at the project root that starts postgres, backend, and frontend services in dependency order with health checks.

#### Scenario: Single command starts the complete stack
- **WHEN** developer runs `docker-compose up -d` from project root
- **THEN** all three services start, health checks pass, and entire stack is operational in ~30 seconds

#### Scenario: Services listed in docker-compose ps
- **WHEN** `docker-compose ps` is run after startup
- **THEN** output shows:
  - postgres (Up, healthy)
  - backend (Up, healthy)
  - frontend (Up, healthy)

### Requirement: Startup dependencies (postgres → backend → frontend)
The system SHALL ensure that postgres starts first, backend waits for postgres health, and frontend waits for backend health via depends_on with health checks.

#### Scenario: Postgres starts first
- **WHEN** `docker-compose up` runs
- **THEN** postgres container is created before backend attempts connection

#### Scenario: Backend waits for postgres health
- **WHEN** postgres is initializing (healthy check not yet passing)
- **THEN** backend container does not start application server until postgres health check succeeds

#### Scenario: Frontend waits for backend health
- **WHEN** backend is starting or unhealthy
- **THEN** frontend displays "Conectando..." until backend /health responds 200

### Requirement: Named volumes for data persistence
The system SHALL use named volume `pgdata` for PostgreSQL data, persisting across `docker-compose down/up` cycles.

#### Scenario: Volume persists after down/up
- **WHEN** `docker-compose down` then `docker-compose up -d` again
- **THEN** database tables and data still exist

### Requirement: Environment file support
The system SHALL include .env.example with common configuration variables, allowing developers to copy to .env and customize.

#### Scenario: Developer can override defaults via .env
- **WHEN** .env file exists with custom DATABASE_PASSWORD=mypass
- **THEN** postgres container uses that password and backend connects successfully

### Requirement: All services accessible on localhost
The system SHALL expose all three services on standard localhost ports (postgres 5432, backend 8000, frontend 3000).

#### Scenario: Services reachable from host machine
- **WHEN** services are running
- **THEN** developer can access:
  - http://localhost:3000 (frontend HTML loads)
  - http://localhost:8000/health (backend responds)
  - psql -h localhost -U gestor (postgres connects)

### Requirement: Seed data loading (optional)
The system SHALL support optional seed data loading via SEED_DATA=true environment variable.

#### Scenario: Data seeds on first startup when SEED_DATA=true
- **WHEN** `SEED_DATA=true docker-compose up` is run
- **THEN** backend loads projects and tasks from CSV files and frontend displays example data

#### Scenario: No error if SEED_DATA=false or seed files missing
- **WHEN** `docker-compose up` runs with SEED_DATA=false or without seed files
- **THEN** stack starts normally; database is empty but usable

