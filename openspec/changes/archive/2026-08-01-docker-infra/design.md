## Context

Desarrolladores deben poder levantar el stack completo (PostgreSQL, FastAPI backend, React frontend) con un solo comando (`docker-compose up`). Actualmente no existe orquestación containerizada; cada servicio se configura manualmente. Esto bloquea:
- Reproducibilidad entre máquinas (dev local, CI, staging, prod)
- Onboarding rápido de nuevos developers
- Consistencia entre desarrollo y producción

Stakeholders: developers, DevOps, release engineering. Constraint: debe funcionar en Windows, macOS, Linux. Stack target: PostgreSQL 15, Python 3.11, Node 18 LTS.

## Goals / Non-Goals

**Goals:**
- Stack completo levanta con `docker-compose up -d` en <1 minuto
- Cada servicio está health-checked; docker-compose espera a que upstream esté listo antes de iniciar downstream (postgres → backend → frontend)
- Datos persisten en volúmenes (DB no se borra con `docker-compose down`)
- Environment vars configurables (DB password, JWT secret, API URL del frontend)
- Optional: seed de dataset Aztec en startup si `SEED_DATA=true`
- Developers sin Docker expertise pueden usar el stack sin entender Dockerfile internals

**Non-Goals:**
- Producción-ready (TLS, secrets management avanzada, multi-host orchestration quedan para Kubernetes)
- Load balancing o autoscaling (local dev, single instance)
- Soporte para GPUs o hardware especializado
- Monitoring/logging centralizado (health checks locales sí; centralization es épica futura)

## Decisions

### 1. Containerización de los 3 servicios (DB, Backend, Frontend)
**Decisión**: Cada servicio en su propio container con Dockerfile dedicado.
**Rationale**: Aislamiento, reproducibilidad, cada servicio controlado independientemente.
**Alternativa considerada**: Stack en un solo container → rechazado porque es antipatrón (violet separation of concerns, difícil de debuggear).

### 2. PostgreSQL 15 con volumen persistente
**Decisión**: PostgreSQL:15-alpine en volumen Docker `pgdata`. Init script en `docker-entrypoint-initdb.d/` crea BD y tablas automáticamente.
**Rationale**: Alpine = imagen pequeña (~150 MB vs ~300 MB debian). Entrypoint hooks = inicialización one-time automática, idempotente.
**Alternativa considerada**: Usar migrate tool en aplicación → rechazado porque agrega latencia al startup del backend, no es dev-friendly.

### 3. FastAPI backend con health check en GET /health
**Decisión**: Backend expone endpoint `/health` que retorna `{status: "ok", db: "connected"}`. Docker health check: `curl localhost:8000/health` cada 5s, fail después de 3 intentos.
**Rationale**: Health check permite a docker-compose saber cuándo el backend está listo; `/health` también útil para frontend para verificar conectividad.
**Alternativa considerada**: Usar solo TCP port check → rechazado porque no detecta aplicación stuck (port open pero app crashed).

### 4. React frontend con fallback UI en caso de desconexión del backend
**Decisión**: Frontend intenta GET /health cada 2s; si falla, muestra "Conectando..." con retry automático. Una vez conecta, carga la app.
**Rationale**: Mejor UX durante startup; developer ve feedback visual de qué está pasando. Environment var `VITE_API_URL` configurable (default: `http://localhost:8000`).
**Alternativa considerada**: Bloquear render hasta que backend esté listo → rechazado porque ralentiza startup y no es user-friendly en dev.

### 5. Orden de startup: postgres → backend → frontend
**Decisión**: Docker-compose depends_on + health checks. Backend espera a que postgres sea healthy; frontend espera a que backend sea healthy.
**Rationale**: Dependencias claras, evita race conditions. Cada paso valida que upstream respondió.
**Alternativa considerada**: Ordenar por nombres en docker-compose (alphabetic) → rechazado, no es determinístico.

### 6. Environment vars en docker-compose.yml vs .env vs .env.example
**Decisión**: 
- `docker-compose.yml`: environment vars con valores sensatos para dev (DEBUG=true, DATABASE_URL=postgresql://gestor:password@postgres:5432/gestor_proyectos)
- `.env.example`: template documentado (no en Git)
- `.env`: generado por developer o script (en .gitignore)
**Rationale**: Developers pueden copiar `.env.example` → `.env` y personalizar. Prod usará secrets manager (future).

### 7. Seed de datos (opcional)
**Decisión**: Si `SEED_DATA=true`, backend ejecuta script que importa `backend/data/projects.csv` y `backend/data/tasks.csv` al startup.
**Rationale**: Permite demo rápido con datos reales del reto. Optional = no bloquea si archivo no existe.
**Alternativa considerada**: Fixture en pytest → rechazado porque es test-only, no sirve para demo local.

### 8. Volúmenes y .gitignore
**Decisión**: 
- `pgdata/` volumen Docker (no en Git, docker-compose crea automáticamente)
- `backend/.venv/`, `frontend/node_modules/` ignorados (buildados en container)
- `backend/db/migrations/` versionado (schema histórico)
**Rationale**: Clean git history, container-native; developers no tienen que instalar python/node localmente.

## Risks / Trade-offs

| Risk | Mitigation |
|---|---|
| Docker not installed en dev machine | Documentar setup; proporcionar link a Docker Desktop. Fallback: local install (manual, no soportado por factory) |
| Database password hardcoded en docker-compose | OK para dev; prod usa `docker secret` o Kubernetes secrets. Documento lo advierte explícitamente |
| Port conflicts (5432, 8000, 3000) si ya en uso | docker-compose ports mapping configurable; documento incluye command para cambiar. Fallback: `docker ps` para ver puertos en uso |
| `docker-compose down` borra volumen si developer lo hace mal | Volumen named (`pgdata`) persiste. Agregar comment en docker-compose.yml advirtiendo `docker volume rm <name>` borra datos |
| Frontend conectando a backend en localhost:3000→8000 | VITE_API_URL env var permite override. CORS headers en backend permiten localhost:3000 |
| Init SQL script falla silenciosamente | Health check incluye query simple (`SELECT 1`); si falla, backend no marca healthy y docker-compose no avanza |

## Migration Plan

**Deploy**: 
1. `git checkout feature/docker-infra`
2. `cp .env.example .env` (developer personaliza si necesario)
3. `docker-compose up -d`
4. Esperar ~30s; confirmar `docker-compose ps` muestra 3 servicios `Up`
5. Acceder a http://localhost:3000 → debe cargar app
6. Acceder a http://localhost:8000/health → debe retornar `{status: "ok", db: "connected"}`

**Rollback**: `docker-compose down; git checkout main`

**For CI**: Dockerfile para backend/frontend incluye `RUN npm ci` / `pip install` en build stage, no depende de .env local.

## Open Questions

1. ¿Incluir docker-compose para prod (con prod.yml overlay)? → Decisión en relase gate, fuera de scope EP-000.
2. ¿Backups automáticos de pgdata? → Futura épica de DevOps.
3. ¿Logging centralizado (docker logs → ELK/Loki)? → Futura épica de Observabilidad.
