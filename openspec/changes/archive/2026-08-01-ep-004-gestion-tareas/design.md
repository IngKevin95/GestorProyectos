# Design: EP-004 — Gestión de Tareas por Proyecto

## Context

El sistema actual mantiene un listado de proyectos (EP-001) con sus atributos operativos (responsable, estado, prioridad, etc.) pero las tareas son entidad no estructurada. El motor de salud (EP-002) infiere riesgo a partir de `open_tasks` y `overdue_tasks`, pero estos son contadores estáticos sin fuente real de dato. Los AC de HU-010 y HU-011 exigen CRUD de tareas accesible desde la UI de detalle de proyecto, con filtrado por estado y persistencia en BD.

**Stakeholders:** Delivery Lead (usuario de tareas), Architecture (modelo de datos), Security (validación de input).

## Goals / Non-Goals

**Goals:**
- Estructurar tareas como entidad de BD con schema Task vinculada a Project.
- Exponer CRUD vía endpoints REST `/api/v1/projects/{id}/tasks` con autenticación JWT.
- Permitir filtrado backend por estado (abierta, vencida, bloqueada, cerrada) con query params.
- Implementar UI (TaskFormModal, TaskList) integrada en ProjectDetailPage.
- Calculador dinámico de `project.open_tasks` y `project.overdue_tasks` a partir de Task.
- Validar entrada (título ≤500 chars, prioridad enum, conflicto de versión).

**Non-Goals:**
- Asignación de tareas a múltiples usuarios (one-to-one task-assignee).
- Subtareas o dependencies entre tareas.
- Notificaciones o webhooks de cambio de tarea.
- Exportación de tareas a CSV (scope post-MVP).
- Campos de tarea extensibles (custom fields).

## Decisions

### D1: Schema de Task — Atributos y relaciones

**Decision:** Modelo `Task` con campos: `id, project_id, title, status, assignee, priority, due_date, created_at, updated_at, version`.

**Why:** 
- `project_id` → FK a Project, garantiza propiedad.
- `title` → requerido, max 500 chars (HU-010 AC5).
- `status` → enum (abierta, vencida, bloqueada, cerrada); determinista para filtrado y health engine.
- `assignee` → string simple (no FK a User, pre-MVP), requerido.
- `priority` → enum (alta, media, baja); influyente en score de riesgo.
- `due_date` → datetime nullable; vencimiento calculado en aplicación (si today > due_date → vencida).
- `version` → incremento para detectar conflictos concurrentes (HU-010 AC4).

**Alternatives considered:**
- Store assignee as FK to User: Rechazado, EP-006 (auth) no forma parte de MVP; string es suficiente.
- Subtareas: Rechazado (non-goal); complejidad fuera de alcance.
- Task history/audit: Rechazado (EP-007 lo cubrirá).

### D2: Calculador de open_tasks y overdue_tasks

**Decision:** Función `calculate_project_stats()` en backend (`backend/services/task_stats.py`) que:
- `open_tasks` = COUNT(tasks WHERE project_id = X AND status IN ('abierta', 'bloqueada'))
- `overdue_tasks` = COUNT(tasks WHERE project_id = X AND status = 'vencida')

Llamada al guardar/actualizar tarea, no en time.time() (determinista, no IA).

**Why:**
- Determinístico: no hay lógica de IA, cálculo puro (regla de negocio).
- Caché de lectura: proyecto guarda `open_tasks` y `overdue_tasks` como campos de BD (desnormalización controlada), calculados al evento.
- EP-002 consume `project.open_tasks` y `project.overdue_tasks` sin I/O adicional.

**Alternatives considered:**
- Trigger en BD: PostgreSQL triggers son complejos para migración; Python es más mantenible en MVP.
- Real-time stream: Kafka/websocket rechazado (complejidad post-MVP, COULD).

### D3: Endpoints REST — Ruta y método

**Decision:** Endpoints anidados bajo proyecto:
```
POST   /api/v1/projects/{project_id}/tasks          → crear
GET    /api/v1/projects/{project_id}/tasks          → listar (con ?status=abierta)
GET    /api/v1/projects/{project_id}/tasks/{id}     → detalle
PUT    /api/v1/projects/{project_id}/tasks/{id}     → editar
DELETE /api/v1/projects/{project_id}/tasks/{id}     → eliminar
```

**Why:**
- Anidamiento RESTful es clara propiedad (tarea pertenece a proyecto).
- Query param `?status=abierta,vencida` permite OR filter en una llamada.
- Versionado via bearer JWT (auth ya existe en EP-001).

**Alternatives considered:**
- Flat route `/api/v1/tasks?project_id=X`: Rechazado, perdemos propiedad explícita.

### D4: Validación de entrada — Cliente vs Servidor

**Decision:** 
- **Frontend (React):** validación de campo en tiempo real (requerido, max 500 chars). Usamos Zustand + TailwindCSS validation states.
- **Backend (Pydantic):** Esquemas `TaskCreate`, `TaskUpdate` con validaciones (max_length=500, enum status, required title). Rechazamos request inválido con 422 + detalle de error.

**Why:**
- UX: feedback inmediato en cliente sin round-trip.
- Seguridad: nunca confiar en cliente; servidor es fuente de verdad.

### D5: Edición inline vs Modal — Componentes React

**Decision:**
- `TaskFormModal.tsx`: Modal para crear tarea (HU-010 AC1). Campos requeridos abiertos. Validación en submit.
- `TaskList.tsx`: Tabla read-only con botón "Editar" que abre modal en modo edición (HU-010 AC2). Cambio de estado inline via select (HU-010 AC2) sin modal.
- Integración en `ProjectDetailPage`: TaskList renderiza bajo sección "Tareas del proyecto".

**Why:**
- Modal para creación aislada, limpia.
- Inline para estado (UX ágil, HU-010 AC2 "sin abrir un modal").
- TaskList sin props complejas (datos vienen de Zustand store o API fetch en ComponentDidMount).

### D6: Persistencia y Rollback de cambios de estado

**Decision:**
- Al editar estado via select (TaskList), POST inmediato a `/api/v1/projects/{id}/tasks/{task_id}` con nuevo status.
- Error de red: Toast notificación, tarea revierte a estado anterior en UI (optimistic update con rollback).
- Conflicto 409 (version mismatch): Modal ofrece opciones (sobrescribir, descartar, recargar desde servidor).

**Why:**
- Evita estado huérfano en cliente.
- Transaccional: persistencia garantizada o rollback visible.

## Risks / Trade-offs

**[Risk] Status enum fijo (abierta, vencida, bloqueada, cerrada) puede ser inflexible.**
- Mitigation: Documentar en AC que estos cuatro estados cubren 95% de casos; extensión a custom status es post-MVP (EP-007 templates).

**[Risk] Cálculo de overdue_tasks en Python (no en BD) introduce latencia si hay muchas tareas.**
- Mitigation: Índice en (project_id, status) en BD; test performance con 1000+ tareas por proyecto. Escalabilidad: cache Redis post-MVP.

**[Risk] Versionado simplista (field `version` ++) no maneja rebase de conflictos.**
- Mitigation: HU-010 AC4 solo detecta; ofrece descartar/recargar (suficiente para MVP).

**[Risk] Asignado como string, no FK → sin validación que sea miembro del equipo.**
- Mitigation: Pre-MVP, Delivery Lead garantiza datos válidos. EP-006 (auth) añade validación.

## Migration Plan

1. **DB Migration (Alembic):** Crear tabla `tasks` con FK a `projects`, índices.
2. **Backend Rollout:**
   - Deploy `task.py` (modelo), `tasks.py` (router), `task_stats.py` (servicio).
   - Endpoint GET `/api/v1/projects/{id}/tasks` lista vacía inicialmente (sin seed).
3. **Frontend Rollout:**
   - Deploy `TaskFormModal`, `TaskList`, `taskStore.ts`.
   - Integrar en `ProjectDetailPage` — inicialmente sin datos (awaiting seed).
4. **Data Seed (EP-005):** Carga CSV Tasks.csv → tareas de ejemplo con estado variado.
5. **Rollback:** DROP table tasks, revert componentes React, revert routers.

## Open Questions

1. ¿Asignado puede ser múltiples usuarios (many-to-many) o siempre one?
   - **Tentativa:** One (simple); many en EP-008 (Team Capacity).
2. ¿Crear tarea → asignar automáticamente al proyecto owner, o dejar en blanco?
   - **Tentativa:** Modal ofrece selector de assignee (requerido).
3. ¿Soft delete (marcado como deleted) o hard delete de tareas?
   - **Tentativa:** Hard delete (MVP); soft delete en EP-007 audit.
