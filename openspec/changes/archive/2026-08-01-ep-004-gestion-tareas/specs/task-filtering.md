# Spec: task-filtering

## Summary
Lógica determinista de filtrado de tareas por estado (abierta, vencida, bloqueada, cerrada) tanto en backend (vía query params) como en frontend (vía componente de filtros). Cálculo de vencimiento según `due_date` y fecha actual.

## Covered User Stories
- HU-011: Ver tareas con filtrado por estado (AC2, AC3, AC4, AC5)

## State Values and Semantics

| Estado | Condición | Cálculo |
|---|---|---|
| **abierta** | status = 'abierta' | Ingreso manual en UI |
| **vencida** | due_date < TODAY y status != 'cerrada' | Backend: `date.today() > due_date` |
| **bloqueada** | status = 'bloqueada' | Ingreso manual en UI |
| **cerrada** | status = 'cerrada' | Ingreso manual en UI |

**Nota:** Vencimiento es calculado, no persistido. Se evalúa en tiempo de lectura (GET).

## Backend Filtering

### Query Parameter: `status`

**Formato:**
```
GET /api/v1/projects/{id}/tasks?status=abierta,vencida
```

**Parsing:**
- Valores: comma-separated string de estados.
- Valores válidos: `abierta`, `vencida`, `bloqueada`, `cerrada`.
- Valor inválido → 422 error.
- Ausente → retorna todas las tareas (sin filtro).

**Logic (SQL pseudocode):**
```sql
SELECT * FROM tasks
WHERE project_id = {id}
  AND (
    (status IN (?, ?, ...) AND status != 'cerrada')
    OR (due_date < CURRENT_DATE AND status != 'cerrada' AND 'vencida' IN params)
  )
ORDER BY created_at DESC
```

**Special case: vencida**
- Si cliente pide `?status=vencida`, backend retorna tasks con `due_date < TODAY` (sin considerar `status` field).
- Esto permite mostrar tareas que pasaron vencimiento aunque sigan marcadas como `abierta` en BD.

### Ejemplo de Queries

1. **Todas las abierta + bloqueada:**
   ```
   ?status=abierta,bloqueada
   ```
   Retorna: tasks donde `status IN ('abierta', 'bloqueada')`.

2. **Solo vencida:**
   ```
   ?status=vencida
   ```
   Retorna: tasks con `due_date < TODAY`.

3. **Abierta + vencida:**
   ```
   ?status=abierta,vencida
   ```
   Retorna: tasks con `status='abierta'` O (`due_date < TODAY`).

4. **Sin filtro (todas):**
   ```
   (sin parámetro status)
   ```
   Retorna: todas las tareas.

---

## Frontend Filtering

### Component: TaskList Filter Controls

**UI Elements:**
- Dropdown `<select>` labeled "Estado" con opciones:
  - "Todas" (value: null, clears filter)
  - "Abierta" (value: 'abierta')
  - "Vencida" (value: 'vencida')
  - "Bloqueada" (value: 'bloqueada')
  - "Cerrada" (value: 'cerrada')
- Button "Limpiar filtro" (resets dropdown a "Todas")

**State Management (Zustand taskStore):**
```typescript
// En taskStore.ts
const taskStore = create((set) => ({
  selectedStatus: null,  // null = sin filtro
  setSelectedStatus: (status) => set({ selectedStatus: status }),
  clearFilter: () => set({ selectedStatus: null }),
  
  // Derived: tareas filtradas en tiempo real
  get filteredTasks() {
    if (!this.selectedStatus) return this.tasks;
    return this.tasks.filter(task => {
      if (this.selectedStatus === 'vencida') {
        return new Date(task.due_date) < new Date() && task.status !== 'cerrada';
      }
      return task.status === this.selectedStatus;
    });
  }
}));
```

### HU-011 AC Coverage

- **AC2 (Filtrar abierta):** Dropdown selecciona 'abierta' → TaskList renderiza solo filas con status='abierta'.
- **AC3 (Filtrar vencida + visual):** Dropdown selecciona 'vencida' → TaskList renderiza tasks con due_date < TODAY; cada fila se colorea rojo (Tailwind `bg-red-50`, ícono ⚠️).
- **AC4 (Sin resultados):** Filtro seleccionado retorna 0 tareas → TaskList muestra "No hay tareas en este estado".
- **AC5 (Limpiar filtro):** Button "Limpiar filtro" resetea a null, muestra todas las tareas.

### Row Styling por Estado

```jsx
// En TaskList.tsx
const rowClass = (task) => {
  if (task.status === 'cerrada') return 'opacity-50';  // dimmed
  if (task.status === 'bloqueada') return 'bg-yellow-50';  // yellow tint
  if (new Date(task.due_date) < new Date() && task.status !== 'cerrada') {
    return 'bg-red-50 border-l-4 border-red-500';  // red highlight
  }
  return '';
};
```

---

## Edge Cases

1. **Tarea sin due_date:**
   - No se considera vencida (due_date IS NULL).
   - Filtro ?status=vencida no la retorna.

2. **Múltiples filtros en query:**
   - ?status=abierta&status=vencida → concatenar como `abierta,vencida` internamente.
   - Backend trata como OR lógico.

3. **Cambio de status inline en UI:**
   - Usuario clic en select "abierta" → PUT endpoint (tarea-crud-api.md).
   - Response 200: tarea actualizada.
   - Frontend reloadea lista (o optimistic update + refetch).

4. **Timezone handling:**
   - Vencimiento calculado usando `date.today()` (server time, sin offset).
   - Aclaración: si servidor está en UTC, vencimiento es end-of-day UTC.
   - Pre-MVP suficiente; post-MVP considerar zona horaria de usuario.

---

## Testing

**Contratos verificables:**

1. GET ?status=abierta → retorna solo tasks.status='abierta'
2. GET ?status=vencida → retorna solo tasks con due_date < TODAY
3. GET ?status=abierta,vencida → retorna unión de ambas
4. GET sin status → retorna todas
5. GET ?status=invalid → 422
6. Frontend: seleccionar filtro → TaskList re-renderiza instantáneamente
7. Frontend: "Limpiar filtro" → dropdown reset a "Todas", tabla muestra todas las tareas
8. Frontend: tarea vencida se colorea rojo con ícono ⚠️
9. Frontend: filtro sin resultados muestra "No hay tareas en este estado"
10. Concurrencia: usuario A ve filtro abierta=3 tareas; usuario B crea nueva → ambos ven 4 (refresh automático o polling)
