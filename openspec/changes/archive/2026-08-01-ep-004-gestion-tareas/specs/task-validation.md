# Spec: task-validation

## Summary
Reglas de validación de entrada para operaciones CRUD de tareas, aplicadas tanto en cliente (UX) como en servidor (seguridad). Cubre validación de campos requeridos, formatos, límites de tamaño y detección de conflicto de concurrencia.

## Covered User Stories
- HU-010: Crear y editar tareas (AC3, AC4, AC5)

## Validation Rules by Field

### Field: title

| Propiedad | Valor |
|---|---|
| **Requerido** | Sí (tanto en POST como PUT con edición de título) |
| **Tipo** | String |
| **Min length** | 1 |
| **Max length** | 500 |
| **Trimming** | Sí (strip leading/trailing whitespace) |
| **Especiales** | UTF-8 soportado (acentos, emojis, etc.) |

**Validación:**
- Cliente: campo vacío → error "Requerido".
- Cliente: > 500 chars → error "Máximo 500 caracteres", deshabilitar botón guardar.
- Servidor (Pydantic): `Field(min_length=1, max_length=500)`.
- Servidor: entrada > 500 → 422 + detalle "ensure this value has at most 500 characters".

**AC Coverage (HU-010 AC3, AC5):**
- AC3: Presionar guardar sin título → error "Requerido", tarea no se crea.
- AC5: Título de 1000 chars → backend rechaza, frontend muestra "Máximo 500 caracteres".

---

### Field: status

| Propiedad | Valor |
|---|---|
| **Requerido** | No (default: 'abierta') |
| **Tipo** | Enum |
| **Valores válidos** | 'abierta', 'vencida', 'bloqueada', 'cerrada' |
| **Immutable** | No (editable en PUT) |

**Validación:**
- Cliente: Dropdown con opciones fijas (sin opción de text libre).
- Servidor: `Enum(TaskStatus)` donde TaskStatus = 'abierta' | 'vencida' | 'bloqueada' | 'cerrada'.
- Servidor: valor no en enum → 422 + "value is not a valid enumeration member".

**Edge cases:**
- POST sin status → default a 'abierta'.
- PUT status a 'vencida' → no afecta validación (user puede forzar cualquier estado).

---

### Field: assignee

| Propiedad | Valor |
|---|---|
| **Requerido** | Sí (tanto en POST como PUT con edición) |
| **Tipo** | String |
| **Min length** | 1 |
| **Max length** | 255 |
| **Format** | Libre (nombre, email, ID, etc.) |
| **No validado contra** | Tabla users (pre-MVP; EP-006 añade validación) |

**Validación:**
- Cliente: campo vacío → error "Requerido".
- Servidor: `Field(min_length=1, max_length=255)`.
- Servidor: valor vacío → 422 + "ensure this value has at least 1 character".

---

### Field: priority

| Propiedad | Valor |
|---|---|
| **Requerido** | No (default: 'media') |
| **Tipo** | Enum |
| **Valores válidos** | 'alta', 'media', 'baja' |
| **Immutable** | No (editable en PUT) |

**Validación:**
- Cliente: Dropdown con opciones fijas.
- Servidor: Enum validación.
- Servidor: valor no en enum → 422.

**Default:**
- POST sin priority → default a 'media'.

---

### Field: due_date

| Propiedad | Valor |
|---|---|
| **Requerido** | No (nullable) |
| **Tipo** | ISO8601 date (YYYY-MM-DD) o null |
| **Past allowed** | Sí (puede ser fecha vencida al crear) |
| **Format** | ISO 8601 datetime (backend convierte a date) |

**Validación:**
- Cliente: `<input type="date">` nativo (solo permite fechas válidas).
- Servidor: Pydantic `datetime` con validador `@validator('due_date')`.
- Servidor: string no ISO8601 → 422 + "invalid datetime format".

**Edge cases:**
- NULL due_date: tarea no tiene plazo, nunca se marca vencida.
- Past due_date: permitido (user puede crear con vencimiento pasado).

---

### Field: version

| Propiedad | Valor |
|---|---|
| **Requerido** | Sí en PUT (optimistic locking) |
| **Tipo** | Integer |
| **Inicial** | 1 (al crear) |
| **Increment** | +1 cada PUT exitoso |
| **Check** | Servidor: `IF request.version != db.version THEN 409 Conflict` |

**Validación:**
- Cliente: NO se envía en PUT a menos que sea edit mode con version conocida.
- Servidor: PUT sin version → 422 + "field required".
- Servidor: version mismatch → 409 Conflict.

**AC Coverage (HU-010 AC4):**
- Dos usuarios editan tarea en paralelo.
- Usuario A GET version=2.
- Usuario B GET version=2.
- Usuario A PUT version=2 → éxito, version becomes 3.
- Usuario B PUT version=2 → 409 Conflict, ofrece opciones (recargar, descartar, sobrescribir).

---

## Validation Flow

### POST /api/v1/projects/{id}/tasks

```
1. Cliente: validación previa
   - title presente y 1-500 chars?
   - assignee presente?
   - priority en enum o ausente?
   - due_date ISO8601 válido o null?
   
2. Cliente: envía POST si todo pasa
   
3. Servidor: Pydantic parsing
   - Schema TaskCreate: title (required, max=500), status (optional, default='abierta'),
     assignee (required, max=255), priority (optional, default='media'), due_date (optional)
   - Parse fallido → 422 Unprocessable Entity
   
4. Servidor: Lógica de negocio
   - Proyecto existe? → 404 si no
   - Crear task row, set version=1
   
5. Servidor: Respuesta 201 + task object
```

### PUT /api/v1/projects/{id}/tasks/{task_id}

```
1. Cliente: obtiene task con GET (para saber version actual)
   
2. Cliente: abre modal de edición, user modifica campos
   
3. Cliente: validación previa (igual que POST)
   
4. Cliente: envía PUT + version actual
   
5. Servidor: Pydantic parsing (TaskUpdate: todos campos optional excepto version)
   - version requerido
   - otros campos: validados si presentes
   
6. Servidor: Optimistic lock check
   - IF request.version != db.version → 409 Conflict, no cambios
   - ELSE: actualizar campos presentes, version += 1, updated_at = now()
   
7. Servidor: Respuesta 200 + task object con nueva version
```

### Frontend Error Handling

**Validación de Cliente:**
```tsx
// En TaskFormModal.tsx
const [errors, setErrors] = useState({});

const validateForm = () => {
  const newErrors = {};
  if (!formData.title || formData.title.trim().length === 0) {
    newErrors.title = 'Requerido';
  }
  if (formData.title && formData.title.length > 500) {
    newErrors.title = 'Máximo 500 caracteres';
  }
  if (!formData.assignee || formData.assignee.trim().length === 0) {
    newErrors.assignee = 'Requerido';
  }
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};

const handleSubmit = async () => {
  if (!validateForm()) return;
  // POST/PUT request
};
```

**Manejo de Errores del Servidor:**
```tsx
const response = await api.post(`/tasks`, payload);

if (response.status === 422) {
  // Pydantic validation error
  const detail = response.data.detail; // array de {"loc": [...], "msg": "..."}
  // Display to user by field
} else if (response.status === 409) {
  // Version conflict
  showModal({
    title: 'Conflicto de edición',
    message: 'La tarea fue modificada. Elige una opción:',
    actions: [
      { label: 'Recargar', fn: () => reloadTask() },
      { label: 'Descartar cambios', fn: () => closeModal() },
      { label: 'Sobrescribir', fn: () => forcePutWithVersion() }
    ]
  });
}
```

---

## Testing

**Contratos verificables:**

1. **POST sin title** → 422 + error message "ensure this value has at least 1 character"
2. **POST title > 500 chars** → 400
3. **POST sin assignee** → 422
4. **POST priority='invalid'** → 422
5. **POST due_date='not-a-date'** → 422
6. **POST valid payload** → 201, task created, version=1
7. **PUT version mismatch** → 409, no changes, current_version en response
8. **PUT version match** → 200, task updated, version incremented
9. **Frontend: title empty → save button disabled**
10. **Frontend: title > 500 → error message shown**
11. **Frontend: 409 response → modal with options shown**
12. **UTF-8 en title** → preservado (acentos, emojis, caracteres chinos)
