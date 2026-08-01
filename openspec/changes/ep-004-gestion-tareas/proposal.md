# Proposal: EP-004 — Gestión de Tareas por Proyecto

## Why

EP-002 (Health Detection Engine) requiere contadores precisos de `open_tasks` y `overdue_tasks` para clasificar proyectos como en riesgo — actualmente esos campos son estáticos. El dataset provisto trae entidad `Tasks.csv` como dato de primer nivel, y el reto exige mostrar "cómo planteaste el manejo de tareas" en la demo. Sin tareas estructuradas y editables, el motor de salud no tiene fuente real.

## What Changes

- Crear schema `Task` en BD con campos requeridos: `title`, `status` (abierta/vencida/bloqueada/cerrada), `assignee`, `priority`, `due_date`, vinculada a `Project`.
- Implementar endpoints CRUD REST en `/api/v1/projects/{id}/tasks` (POST, GET, PUT, DELETE).
- Implementar filtrado backend por estado (query param `status`).
- Crear componentes React `TaskFormModal` (crear/editar inline) y `TaskList` (vista con tabla + filtros).
- Integrar TaskList en `ProjectDetailPage` bajo la sección de detalles del proyecto.
- Validación de datos (título requerido, max 500 caracteres, prioridad en enum, conflicto de concurrencia).
- Persistir cambios en BD y retroalimentar contadores `project.open_tasks` y `project.overdue_tasks` para EP-002.

## Capabilities

### New Capabilities
- `task-crud-api`: Endpoints REST POST/GET/PUT/DELETE /api/v1/projects/{id}/tasks con autenticación JWT.
- `task-list-view`: Componente React que renderiza tabla de tareas con columnas (ID, asignado, prioridad, estado, fecha vencimiento), paginación opcional, sin modal.
- `task-filtering`: Filtrado backend y frontend por estado (abierta, vencida, bloqueada, cerrada) con aplicación en tiempo real.
- `task-form-modal`: Componente React modal para crear/editar tareas con validación de campos en cliente.
- `task-validation`: Reglas de validación en backend (Pydantic) y cliente (React): título requerido, max 500 caracteres, prioridad en enum (alta/media/baja), due_date formato válido, detección de conflicto de concurrencia (field `version`).

### Modified Capabilities
- `health-detection-engine`: Su lógica de detección requiere acceso a `project.open_tasks` y `project.overdue_tasks` — estos ahora se calculan dinámicamente a partir del schema Task en lugar de ser campos estáticos.

## Impact

**Backend:**
- Nuevo modelo `Task` (SQLAlchemy) en `backend/app/models/task.py`.
- Nuevos endpoints en `backend/app/routers/tasks.py`: GET, POST, PUT, DELETE.
- Migraciones de DB (Alembic) para crear tabla `tasks`.
- Servicio de cálculo de `open_tasks` y `overdue_tasks` en `backend/services/task_stats.py`.

**Frontend:**
- Nuevos componentes en `frontend/src/components/TaskFormModal.tsx` y `TaskList.tsx`.
- Nuevas acciones Zustand en `frontend/src/store/taskStore.ts` para CRUD.
- Integración en `frontend/src/pages/ProjectDetailPage.tsx`.
- Nueva ruta opcional en API service (`frontend/src/services/api.ts`) para endpoints `/projects/{id}/tasks`.

**Database:**
- Tabla `tasks` con FK a `projects(id)`, índices en `project_id`, `status`.

**Dependencies:**
- Ninguna nueva; utiliza stack existente (Pydantic, SQLAlchemy, React hooks, Zustand, TailwindCSS).

**Data Model:**
- Task.open_tasks: conteo dinámico de tareas con `status IN ('abierta', 'bloqueada')`.
- Task.overdue_tasks: conteo dinámico de tareas con `status = 'vencida'`.
