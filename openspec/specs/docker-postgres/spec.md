# docker-postgres Specification

## Purpose
TBD - created by archiving change docker-infra. Update Purpose after archive.
## Requirements
### Requirement: PostgreSQL 15 container with persistent volume
The system SHALL run PostgreSQL 15 in a container with a named volume `pgdata` that persists data across `docker-compose down/up` cycles.

#### Scenario: Data persists across restarts
- **WHEN** `docker-compose up`, user creates a test table, then `docker-compose down` and `docker-compose up -d` again
- **THEN** the test table still exists and contains the same data

#### Scenario: Container starts and listens on port 5432
- **WHEN** `docker-compose up -d` completes
- **THEN** `psql -h localhost -U gestor -d gestor_proyectos` connects successfully

### Requirement: Automatic database and schema initialization
The system SHALL execute init scripts from `docker-entrypoint-initdb.d/` on first container startup, creating the database `gestor_proyectos` and tables (projects, tasks, team, audit_log) if they do not exist.

#### Scenario: Tables exist after first startup
- **WHEN** container starts for the first time
- **THEN** `\dt` in psql shows projects, tasks, team, audit_log tables

#### Scenario: Init script is idempotent
- **WHEN** container restarts (volume persists)
- **THEN** init script does not error; tables already exist

### Requirement: Health check via TCP connectivity
The system SHALL implement a health check that verifies PostgreSQL is accepting connections on port 5432.

#### Scenario: Health check reports healthy
- **WHEN** `docker-compose ps` runs after container startup
- **THEN** postgres service shows status "Up (healthy)"

### Requirement: Environment variables for credentials
The system SHALL accept DATABASE_USER, DATABASE_PASSWORD, DATABASE_NAME via environment variables in docker-compose.yml, with defaults for local development.

#### Scenario: Database created with specified credentials
- **WHEN** docker-compose.yml sets POSTGRES_USER=custom_user and POSTGRES_PASSWORD=custom_pass
- **THEN** `psql -h localhost -U custom_user -d gestor_proyectos` connects with that password

