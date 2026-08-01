## Why

Sin un stack containerizado runnable no hay base ni para desarrollo local ni para demostración. La metodología Factory exige que la primera épica (EP-000) sea cimiento: PostgreSQL + backend FastAPI + frontend React orquestados en docker-compose para que `npm run dev` levante el sistema entero en localhost, listo para integrar features de negocio.

## What Changes

- **Nuevo**: Dockerfile para PostgreSQL 15 con scripts de inicialización automática (tablas: projects, tasks, team, audit_log)
- **Nuevo**: Dockerfile para FastAPI backend con SQLAlchemy 2.0 async, health checks, reintentos exponenciales contra DB
- **Nuevo**: Dockerfile para React 18 + Vite frontend con CORS configurado, environment vars para VITE_API_URL
- **Nuevo**: docker-compose.yml orquestando los 3 servicios (postgres, backend, frontend) con health checks, volúmenes, variables de entorno
- **Nuevo**: Script de seed opcional (SEED_DATA env var) para cargar dataset Aztec en DB al arrancar
- **Modificado**: .gitignore para excluir docker volumes y archivos locales de build

## Capabilities

### New Capabilities

- `docker-postgres`: PostgreSQL 15 containerizado con init scripts automáticos, volumen persistente, health checks de connectivity
- `docker-fastapi`: FastAPI backend containerizado con async SQLAlchemy 2.0, wait-for-db, environment config (JWT_SECRET_KEY, DEBUG, DATABASE_URL), salud en GET /health
- `docker-frontend`: React 18 + Vite frontend containerizado, environment-driven API_URL, salud checkeando health endpoint del backend, CORS permitido a localhost:8000
- `docker-compose-orchestration`: Orquestación completa via docker-compose con orden de startup (postgres → backend → frontend), health checks por servicio, volúmenes persistentes, red interna

### Modified Capabilities

<!-- No hay capabilities existentes que se modifiquen en requirements. EP-000 es greenfield. -->

## Impact

- **Código afectado**: creación de 3 Dockerfiles, docker-compose.yml, .env.example, scripts de init SQL en `backend/db/migrations/init.sql` (si aún no existe)
- **Dependencias nuevas**: ninguna a nivel de pip/npm (Docker + docker-compose CLI en dev machine)
- **APIs**: backend GET /health (nuevo endpoint de salud para verificar DB connectivity desde frontend)
- **Integración**: sesiones posteriores (EP-001, EP-002, etc.) heredan este stack como base; no puede haber features de negocio sin primero tener DB + API + frontend corriendo
- **Ambiente local**: developer ejecuta `docker-compose up -d` y toda la stack está lista en ~30 segundos; `docker-compose down` limpia todo

## Trazabilidad

- **Épica**: EP-000
- **Historias**: HU-024 (postgres), HU-025 (backend), HU-026 (frontend), HU-027 (orchestración)
- **Alineación PRD**: §10 Requisitos Técnicos (Docker, docker-compose, PostgreSQL 15, FastAPI, React)
