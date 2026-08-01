# Tasks: EP-004 — Gestión de Tareas por Proyecto

Checklist de 5 fases y 16 tareas para implementación completa del CRUD de tareas, integración con UI, y verificación de contrato con EP-002 (health engine).

---

## Fase 1: Backend Base (DB + Models + Service)

- [ ] **1.1** Crear migration Alembic: tabla `tasks` con campos (id, project_id, title, status, assignee, priority, due_date, created_at, updated_at, version). Índices en (project_id, status).
- [ ] **1.2** Implementar Pydantic schemas `TaskCreate`, `TaskUpdate`, `TaskResponse` en `backend/app/schemas/task.py` con validaciones (title max_length=500, status enum, version requerido en UPDATE).
- [ ] **1.3** Crear modelo SQLAlchemy `Task` en `backend/app/models/task.py` con relación FK a `Project`.
- [ ] **1.4** Implementar servicio `calculate_project_stats()` en `backend/services/task_stats.py` que retorna (`open_tasks`, `overdue_tasks`).

---

## Fase 2: API Endpoints

- [ ] **2.1** Crear router `backend/app/routers/tasks.py` con endpoint `POST /api/v1/projects/{project_id}/tasks` (crear tarea). Testing: payload válido → 201, tarea con status='abierta' (default).
- [ ] **2.2** Implementar `GET /api/v1/projects/{project_id}/tasks` con filtrado por `?status=abierta,vencida`. Testing: ?status=abierta → solo abierta; sin param → todas.
- [ ] **2.3** Implementar `GET /api/v1/projects/{project_id}/tasks/{task_id}` (detalle). Testing: task existe → 200, tarea no existe → 404.
- [ ] **2.4** Implementar `PUT /api/v1/projects/{project_id}/tasks/{task_id}` con optimistic locking (version check). Testing: versión match → 200, versión mismatch → 409.
- [ ] **2.5** Implementar `DELETE /api/v1/projects/{project_id}/tasks/{task_id}`. Testing: delete → 204, GET posterior → 404.
- [ ] **2.6** Agregar reporte de errores Pydantic 422 (title vacío, priority inválida, etc.) con detalle de campo.

---

## Fase 3: Frontend Components & Store

- [ ] **3.1** Crear Zustand store `frontend/src/store/taskStore.ts` con estado (tasks[], selectedStatus, loading, error). Acciones: setTasks, addTask, updateTask, deleteTask, setSelectedStatus, clearFilter.
- [ ] **3.2** Crear servicio API `frontend/src/services/taskService.ts` con métodos: createTask, getTasks, getTask, updateTask, deleteTask. Base URL: `/api/v1/projects/{id}/tasks`.
- [ ] **3.3** Crear componente `frontend/src/components/TaskFormModal.tsx` (modal de crear/editar). Campos: title, assignee, priority, due_date. Validación cliente (title vacío, > 500 chars). Submit → POST/PUT.
- [ ] **3.4** Crear componente `frontend/src/components/TaskList.tsx` (tabla read-only). Columnas: ID, Asignado, Prioridad, Estado, Fecha vencimiento. Botón "Editar" abre modal. Styling: vencidas en rojo.
- [ ] **3.5** Integrar TaskList + TaskFormModal en `frontend/src/pages/ProjectDetailPage.tsx`. Sección "Tareas del Proyecto" debajo de detalles. Botón "Nueva Tarea" abre modal.
- [ ] **3.6** Agregar filtro por estado en TaskList (dropdown Estado + botón Limpiar). onChange → actualiza Zustand store.

---

## Fase 4: Integration & Data Flow

- [ ] **4.1** Wiring: ProjectDetailPage → fetch tasks al cargar via taskService.getTasks(projectId). Guardar en taskStore.
- [ ] **4.2** Wiring: TaskFormModal submit → POST/PUT via taskService → taskStore.addTask/updateTask → refetch lista.
- [ ] **4.3** Wiring: TaskList estado inline select → PUT task status → recalcular project.open_tasks, mostrar actualización en badge de proyecto.
- [ ] **4.4** Error handling: Pydantic 422 → mostrar error por campo en modal. Versión 409 → modal de opciones (recargar, descartar, sobrescribir).
- [ ] **4.5** Optimistic update: UI actualiza inmediatamente al hacer cambio; rollback automático si error de red.

---

## Fase 5: Testing, Verification & E2E

- [ ] **5.1** Test unitarios backend: `backend/tests/test_task_crud.py`. Casos: POST crear (201), GET lista (200), GET detalle (404 si no existe), PUT versión (409 conflict), DELETE (204).
- [ ] **5.2** Test API contracts: Postman/Newman suite para task-crud-api.md. Validación: requests/responses contra spec. ~8 requests, 16 assertions.
- [ ] **5.3** Test filtrado: `backend/tests/test_task_filtering.py`. Casos: ?status=abierta, ?status=vencida, ?status=abierta,bloqueada, sin param.
- [ ] **5.4** Test validación: `backend/tests/test_task_validation.py`. Casos: title vacío (422), > 500 chars (422), priority inválida (422), version mismatch (409).
- [ ] **5.5** Test frontend: `frontend/tests/TaskList.test.tsx`, `TaskFormModal.test.tsx`. Casos: renderiza tabla, click edit abre modal, submit llama taskService, filtro actualiza vista, error 409 muestra opciones.
- [ ] **5.6** E2E smoke test: Playwright `e2e/tasks.spec.ts`. Journey: abrir proyecto → crear tarea → ver en lista → editar estado → filtrar vencidas → verificar proyecto.open_tasks incrementó.

---

## Task Dependency Map

```
Phase 1 (DB/Models):  1.1 → 1.2 → 1.3 → 1.4 (secuencial, bloquea Phase 2)
Phase 2 (Endpoints):  2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 (secuencial, bloquea Phase 3)
Phase 3 (Components): 3.1 → 3.2 → 3.3 → 3.4 → 3.5 → 3.6 (secuencial, bloquea Phase 4)
Phase 4 (Integration): 4.1 → 4.2 → 4.3 → 4.4 → 4.5 (secuencial, requiere Phase 2+3)
Phase 5 (Tests):      5.1, 5.2, 5.3, 5.4 en paralelo (requieren Phase 1+2); 5.5 en paralelo (requiere Phase 3); 5.6 requiere todas
```

---

## Acceptance Criteria per Task

### 1.1 Alembic Migration
- ✓ Tabla `tasks` creada con columnas requeridas.
- ✓ FK a `projects(id)` con ON DELETE CASCADE.
- ✓ Índices en (project_id), (project_id, status).
- ✓ `version INT DEFAULT 1`.
- ✓ Rollback script reversa cambios.

### 1.2 Pydantic Schemas
- ✓ TaskCreate: title (min=1, max=500, required), status (default='abierta'), assignee (required), priority (default='media'), due_date (optional).
- ✓ TaskUpdate: todos optional excepto version (required).
- ✓ TaskResponse: completo, incluye version.

### 2.1–2.5 Endpoints
- ✓ Cada endpoint retorna contratos spec-driven-product task-crud-api.md.
- ✓ Autenticación JWT verificada.
- ✓ Paginación en GET lista (page, page_size).
- ✓ Optimistic locking en PUT.

### 3.1–3.6 Frontend
- ✓ TaskFormModal abre/cierra sin errores.
- ✓ TaskList renderiza tabla con filtro.
- ✓ Validación cliente en tiempo real.
- ✓ Integración en ProjectDetailPage sin romper UI existente.

### 4.1–4.5 Integration
- ✓ Crear tarea → aparece en lista sin recargar página.
- ✓ Editar estado → contador project.open_tasks se actualiza.
- ✓ Conflicto 409 → modal de opciones aparece.

### 5.1–5.6 Testing
- ✓ Cobertura de AC de HU-010 y HU-011.
- ✓ Contratos verificables (request/response matching spec).
- ✓ E2E journey completo: create → read → filter → edit → verify.

---

## Effort Estimate

| Fase | Tareas | Estimado |
|---|---|---|
| Fase 1 | 4 | 2h (DB simple, modelos estándar) |
| Fase 2 | 6 | 3h (5 endpoints CRUD estándar, validación) |
| Fase 3 | 6 | 3h (componentes React standard, Zustand) |
| Fase 4 | 5 | 2h (wiring, error handling) |
| Fase 5 | 6 | 3h (unit + API + E2E tests) |
| **Total** | **16** | **~13h** |

---

## Success Criteria (DoD)

- [ ] Todos los endpoints cumplen spec task-crud-api.md.
- [ ] Filtrado backend y frontend funciona según task-filtering.md.
- [ ] Validación de campos según task-validation.md.
- [ ] HU-010 AC 1-5 cubiertos por tests.
- [ ] HU-011 AC 1-5 cubiertos por tests.
- [ ] E2E journey verde (create → list → filter → edit → verify health engine).
- [ ] Zero breaking changes en EP-001 existentes.
- [ ] project.open_tasks y project.overdue_tasks calculados dinámicamente (EP-002 ready).
