# Spec: project-crud-api

**Capability**: Endpoints REST para crear, leer, actualizar, eliminar proyectos.

## Contracts

### POST /projects
**Create a new project**

Request:
```json
{
  "nombre": "Diagnóstico de infraestructura",
  "responsable": "Alice",
  "estado": "Activo",
  "prioridad": "Alta",
  "fecha_límite": "2026-12-31T00:00:00Z",
  "siguiente_paso": "Revisar brief con cliente",
  "bloqueos": "Pendiente aprobación presupuesto",
  "notas": "Proyecto piloto XYZ",
  "tipo_proyecto": "Diagnóstico"
}
```

Response (201 Created):
```json
{
  "id": 1,
  "nombre": "Diagnóstico de infraestructura",
  "responsable": "Alice",
  "estado": "Activo",
  "prioridad": "Alta",
  "fecha_límite": "2026-12-31T00:00:00Z",
  "siguiente_paso": "Revisar brief con cliente",
  "bloqueos": "Pendiente aprobación presupuesto",
  "notas": "Proyecto piloto XYZ",
  "tipo_proyecto": "Diagnóstico",
  "created_at": "2026-08-01T18:00:00Z",
  "updated_at": "2026-08-01T18:00:00Z"
}
```

Error (400 Bad Request — campo requerido faltante):
```json
{
  "detail": "El campo 'Responsable' es obligatorio"
}
```

---

### GET /projects?estado=Activo&responsable=Alice
**List projects with optional filters**

Response (200 OK):
```json
{
  "items": [
    {
      "id": 1,
      "nombre": "Diagnóstico de infraestructura",
      "responsable": "Alice",
      "estado": "Activo",
      "prioridad": "Alta",
      "fecha_límite": "2026-12-31T00:00:00Z",
      "siguiente_paso": "Revisar brief con cliente",
      "bloqueos": null,
      "notas": "Proyecto piloto XYZ",
      "tipo_proyecto": "Diagnóstico",
      "created_at": "2026-08-01T18:00:00Z",
      "updated_at": "2026-08-01T18:00:00Z"
    }
  ],
  "total": 1
}
```

---

### GET /projects/{id}
**Get a single project by ID**

Response (200 OK):
```json
{
  "id": 1,
  "nombre": "Diagnóstico de infraestructura",
  "responsable": "Alice",
  "estado": "Activo",
  "prioridad": "Alta",
  "fecha_límite": "2026-12-31T00:00:00Z",
  "siguiente_paso": "Revisar brief con cliente",
  "bloqueos": "Pendiente aprobación presupuesto",
  "notas": "Proyecto piloto XYZ",
  "tipo_proyecto": "Diagnóstico",
  "created_at": "2026-08-01T18:00:00Z",
  "updated_at": "2026-08-01T18:00:00Z"
}
```

Error (404 Not Found):
```json
{
  "detail": "Proyecto no encontrado"
}
```

---

### PUT /projects/{id}
**Update a project**

Request (same schema as POST):
```json
{
  "estado": "En Pausa",
  "siguiente_paso": "Esperar feedback cliente"
}
```

Response (200 OK — full updated object returned).

---

### DELETE /projects/{id}
**Delete a project**

Response (204 No Content).

Error (404 Not Found) — si el proyecto no existe.

## Validation Rules

| Field | Type | Required | Enum Values | Notes |
|---|---|---|---|---|
| nombre | string(255) | ✓ | — | — |
| responsable | string(100) | ✓ | — | indexed |
| estado | string(50) | ✓ | Activo, En Pausa, Cancelado, Completado | indexed |
| prioridad | string(50) | ✓ | Alta, Media, Baja | — |
| fecha_límite | datetime | ✗ | — | optional |
| siguiente_paso | string(255) | ✗ | — | optional |
| bloqueos | text | ✗ | — | optional, >1000 chars allowed |
| notas | text | ✗ | — | optional, >1000 chars allowed |
| tipo_proyecto | string(50) | ✓ | Mantenimiento, Recurrente, Diagnóstico, Proyecto | — |

## Error Codes

- 201: Proyecto creado exitosamente
- 200: Operación exitosa (GET, PUT)
- 204: Eliminación exitosa
- 400: Validación fallida (campo requerido, enum inválido)
- 404: Proyecto no encontrado
- 500: Error del servidor

## Performance

- GET /projects con filtros debe responder en <100ms (índices en responsable, estado)
- Listado sin límite de resultados en MVP (escalará en épicas futuras con paginación)
