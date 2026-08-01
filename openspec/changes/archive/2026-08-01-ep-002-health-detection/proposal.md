## Why

El reto exige detectar automáticamente proyectos bloqueados, en riesgo o sin rumbo. Sin una lógica explícita y determinista, el Delivery Lead tendría que revisar manualmente cada proyecto para identificar cuáles necesitan atención urgente. EP-002 es el diferencial del sistema: pasar de datos crudos a alertas accionables con reglas claras y defendibles.

## What Changes

- **Nuevo**: Función `detect_health()` en el backend que clasifica un proyecto en uno de cuatro estados: `Ok`, `Bloqueado`, `En riesgo`, `Sin rumbo`.
- **Nuevo**: Campo `health` en la tabla `projects` (PostgreSQL) que persiste la clasificación (denormalización por performance).
- **Nuevo**: Endpoints REST modificados para incluir `health` en respuestas:
  - `GET /projects/{id}` — retorna proyecto con health calculado.
  - `GET /projects` — retorna lista con health para cada proyecto.
- **Nuevo**: Reglas documentadas de detección:
  - **Bloqueado**: `blockers != ""` O `overdue_tasks >= 3`.
  - **En riesgo**: `target_date <= hoy + 7 días` Y `open_tasks > 0`.
  - **Sin rumbo**: `siguiente_paso == ""`.
  - **Ok**: ninguna de las anteriores.

## Capabilities

### New Capabilities
- `detect-blocked-logic`: Función `detect_blocked(blockers, overdue_tasks)` → bool. Determinista, sin I/O ni dependencias externas.
- `detect-at-risk-logic`: Función `detect_at_risk(target_date, open_tasks)` → bool. Calcula días restantes contra hoy, compara contra umbral.
- `detect-no-next-step-logic`: Función `detect_no_next_step(siguiente_paso)` → bool. Verifica cadena vacía (null o ""), trim espacios.

### Modified Capabilities
- `project-api`: Endpoint `GET /projects/{id}` ahora retorna campo `health: str` junto a datos del proyecto.
- `project-list-api`: Endpoint `GET /projects` ahora retorna `health` para cada proyecto en la lista.

## Impact

- **Código afectado**:
  - Backend: `backend/app/services/health.py` (nuevas funciones detect_*).
  - Backend: `backend/app/routers/projects.py` (modificar GET /projects, GET /projects/{id} para incluir health).
  - Backend: `backend/app/models.py` (agregar campo `health: str` al modelo Project).
  - Database: Migración para agregar columna `health` a tabla `projects`.
  - Tests: `backend/tests/test_ep002_health_detection.py` (15 test cases, 5 por capability).
- **APIs**: 2 endpoints modificados (`GET /projects`, `GET /projects/{id}`) con nuevo campo `health`.
- **Dependencias**: ninguna nueva.
- **Integración**: EP-003 (cartera) depende de este endpoint para mostrar badges de health.
- **BD**: Columna `health: varchar(50)` en tabla `projects` con valores: "Ok", "Bloqueado", "En riesgo", "Sin rumbo".

## Trazabilidad

- **Épica**: EP-002
- **Historias de Usuario**: HU-004 (detectar bloqueado), HU-005 (detectar en riesgo), HU-006 (detectar sin rumbo)
- **Alineación PRD**: §5 Objetivos — "detecte automáticamente proyectos en riesgo/bloqueados/sin rumbo"; §6 Must — "motor de detección con reglas explícitas"; Enunciado — "detectar proyectos en riesgo, bloqueados o sin siguiente paso claro"
