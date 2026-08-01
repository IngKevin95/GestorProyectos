# Design — Health Detection Engine (EP-002)

## Arquitectura

### Lógica de Salud

Tres funciones puras y deterministas en `backend/app/services/health.py`:

```python
def detect_blocked(blockers: str, overdue_tasks: int) -> bool:
    """Retorna True si proyecto está bloqueado."""
    return bool(blockers.strip()) or overdue_tasks >= 3

def detect_at_risk(target_date: date, open_tasks: int) -> bool:
    """Retorna True si proyecto está en riesgo (≤7 días y tareas abiertas)."""
    if open_tasks == 0:
        return False
    days_remaining = (target_date - date.today()).days
    return days_remaining <= 7 and days_remaining >= 0

def detect_no_next_step(siguiente_paso: str) -> bool:
    """Retorna True si proyecto no tiene siguiente paso claro."""
    return not siguiente_paso.strip()

def calculate_health(project: Project) -> str:
    """Orquesta las tres funciones y retorna estado de salud."""
    if detect_blocked(project.blockers, project.overdue_tasks):
        return "Bloqueado"
    if detect_at_risk(project.target_date, project.open_tasks):
        return "En riesgo"
    if detect_no_next_step(project.siguiente_paso):
        return "Sin rumbo"
    return "Ok"
```

### Integración con API

**GET /projects/{id}**: Servicio `calculate_health()` se invoca en el endpoint, resultado se incluye en respuesta.

```python
@router.get("/projects/{id}", response_model=ProjectResponse)
async def get_project(id: int, db: AsyncSession = ...):
    project = await db.get(Project, id)
    project.health = calculate_health(project)
    return project
```

**GET /projects**: Loop sobre lista, calcula health para cada uno.

### Determinismo

Todas las funciones dependen solo de:
- Campos del modelo Project (no hay I/O, no hay IA, no hay llamadas externas).
- Fecha actual (date.today() es determinista dentro de un día).
- Sin estado compartido entre llamadas.

### Error Handling

- Si `target_date` es null/inválida en `detect_at_risk`, retorna False (no en riesgo).
- Si `blockers` es null, stripping lo convierte a "" → no bloqueado.
- Campos `open_tasks`, `overdue_tasks` tienen defaults (0) en schema.

## Campos de Entrada

Requeridos en tabla `projects`:
- `blockers: str` (null ok)
- `overdue_tasks: int` (default 0)
- `target_date: date` (null ok)
- `open_tasks: int` (default 0)
- `siguiente_paso: str` (null ok)

Todos existen en EP-001 (CRUD). EP-002 no modifica schema, solo los lee + agrega columna `health` para cache.

## Formato Salida

```json
{
  "id": 1,
  "nombre": "Proyecto X",
  "health": "Bloqueado",
  ...
}
```

Valores válidos: `"Ok"`, `"Bloqueado"`, `"En riesgo"`, `"Sin rumbo"`.

## Performance

- Funciones detect_* son O(1) (comparación simple).
- `calculate_health()` es O(1) (3 comparaciones).
- Sin índices nuevos requeridos (health es una columna que se calcula on-the-fly o se cache).
- Posible futura optimización: trigger en PostgreSQL o background job para actualizar health al cambiar blockers/target_date/siguiente_paso.

## Testing

Estrategia: Unit tests con Pytest, fixtures de proyectos con distintos estados.

- HU-004 (detect_blocked): 5 cases — blockers present, overdue_tasks >= 3, both empty, multiple blockers, update flow.
- HU-005 (detect_at_risk): 5 cases — fecha próxima + tareas, fecha próxima sin tareas, fecha lejana, umbral exacto (7 días), update flow.
- HU-006 (detect_no_next_step): 5 cases — vacío, definido, create sin llenar, whitespace, update flow.

Total: 15 tests, todos deterministas, sin mocking de datetime (freeze con freezegun si es necesario).
