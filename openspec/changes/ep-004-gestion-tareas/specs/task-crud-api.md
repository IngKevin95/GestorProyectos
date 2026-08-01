# Spec: task-crud-api

## Summary
REST endpoints para operaciones CRUD de tareas asociadas a un proyecto. Incluye autenticación JWT, validación de payload, manejo de conflicto de versión, y cálculo automático de contadores `open_tasks`/`overdue_tasks` del proyecto.

## Covered User Stories
- HU-010: Crear y editar tareas (AC1, AC2, AC3, AC4, AC5)
- HU-011: Ver lista de tareas (depende de GET)

## Endpoints

### POST /api/v1/projects/{project_id}/tasks
Crear nueva tarea.

**Request Headers:**
```
Authorization: Bearer {jwt_token}
Content-Type: application/json
```

**Request Body (Pydantic TaskCreate):**
```json
{
  "title": "string (required, max 500)",
  "status": "abierta | vencida | bloqueada | cerrada (default: abierta)",
  "assignee": "string (required)",
  "priority": "alta | media | baja (default: media)",
  "due_date": "ISO8601 date or null (default: null)"
}
```

**Success Response (201 Created):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "Implementar API tareas",
  "status": "abierta",
  "assignee": "Alice",
  "priority": "alta",
  "due_date": "2026-09-15",
  "created_at": "2026-08-02T10:30:00Z",
  "updated_at": "2026-08-02T10:30:00Z",
  "version": 1
}
```

**Error Responses:**
- 400: `title` vacío o > 500 caracteres
- 401: Token JWT inválido o expirado
- 404: Proyecto no existe
- 422: Campo `priority` no en enum, `due_date` formato inválido

---

### GET /api/v1/projects/{project_id}/tasks
Listar tareas (con filtrado opcional).

**Query Parameters:**
- `status`: Filtro por estado; valores: `abierta`, `vencida`, `bloqueada`, `cerrada`. Múltiples: `?status=abierta,bloqueada`.
- `page`: Número de página (default: 1)
- `page_size`: Elementos por página (default: 20, max: 100)

**Response (200 OK):**
```json
{
  "items": [
    {
      "id": "uuid",
      "project_id": "uuid",
      "title": "Tarea 1",
      "status": "abierta",
      "assignee": "Bob",
      "priority": "media",
      "due_date": null,
      "created_at": "2026-08-01T09:00:00Z",
      "updated_at": "2026-08-01T09:00:00Z",
      "version": 1
    }
  ],
  "total": 5,
  "page": 1,
  "page_size": 20
}
```

**Error Responses:**
- 401: Token JWT inválido
- 404: Proyecto no existe
- 422: Parámetro `status` valor no válido

---

### GET /api/v1/projects/{project_id}/tasks/{task_id}
Obtener detalle de tarea.

**Response (200 OK):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "Tarea 1",
  "status": "abierta",
  "assignee": "Bob",
  "priority": "media",
  "due_date": null,
  "created_at": "2026-08-01T09:00:00Z",
  "updated_at": "2026-08-01T09:00:00Z",
  "version": 2
}
```

**Error Responses:**
- 401: Token JWT inválido
- 404: Tarea o proyecto no existe

---

### PUT /api/v1/projects/{project_id}/tasks/{task_id}
Editar tarea existente.

**Request Body (Pydantic TaskUpdate, todos campos opcionales):**
```json
{
  "title": "string (max 500, optional)",
  "status": "abierta | vencida | bloqueada | cerrada (optional)",
  "assignee": "string (optional)",
  "priority": "alta | media | baja (optional)",
  "due_date": "ISO8601 or null (optional)",
  "version": 1 (required para optimistic lock)
}
```

**Success Response (200 OK):**
```json
{
  "id": "uuid",
  "project_id": "uuid",
  "title": "Tarea editada",
  "status": "bloqueada",
  "assignee": "Charlie",
  "priority": "alta",
  "due_date": "2026-09-20",
  "created_at": "2026-08-01T09:00:00Z",
  "updated_at": "2026-08-02T14:45:00Z",
  "version": 2
}
```

**Error Responses:**
- 400: `version` no enviado o campo inválido
- 401: Token JWT inválido
- 404: Tarea o proyecto no existe
- 409 (Conflict): `version` no coincide (otro usuario editó). Respuesta:
  ```json
  {
    "error": "Conflict: version mismatch",
    "expected_version": 2,
    "current_version": 2,
    "message": "La tarea fue modificada. Opciones: recargar, descartar, sobrescribir."
  }
  ```
- 422: Campo `status` no en enum, `title` > 500 chars, etc.

---

### DELETE /api/v1/projects/{project_id}/tasks/{task_id}
Eliminar tarea.

**Response (204 No Content)**
(sin body)

**Error Responses:**
- 401: Token JWT inválido
- 404: Tarea o proyecto no existe

---

## Side Effects on Task Mutation

Toda creación, edición o eliminación de tarea gatilla recálculo de:
- `project.open_tasks` (COUNT tasks WHERE status IN ('abierta', 'bloqueada'))
- `project.overdue_tasks` (COUNT tasks WHERE status = 'vencida')

Estos valores se actualizan en la tabla `projects` y se retornan en respuesta.

## Authentication & Authorization

- Todos los endpoints requieren JWT token válido en header `Authorization: Bearer {token}`.
- El usuario debe tener acceso al proyecto (verificación en router antes de operación).
- Pre-MVP: sin roles granulares; cualquier usuario autenticado puede CRUD.

## Pagination & Sorting

- GET lista soporta paginación (page, page_size).
- Orden default: `created_at DESC` (más recientes primero).
- Parámetro `sort` rechazado en MVP (post-MVP extensión).

## Rate Limiting & Concurrency

- Rate limit general del proyecto (EP-001) aplica también a tasks.
- Optimistic locking via campo `version` en PUT (incremento automático en servidor).

## Testing

**Contratos verificables:**
1. POST crea tarea con status=abierta (default) → GET retorna tarea en lista.
2. PUT con version correcta → status se actualiza, version incrementa.
3. PUT con version incorrecta → 409, no hay cambios.
4. GET con ?status=abierta → solo tareas con status='abierta'.
5. DELETE → 204, GET posterior 404.
6. POST sin title → 422 + detalle "required".
7. POST title > 500 chars → 400.
8. Proyecto no existe → 404.
