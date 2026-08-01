# Spec — detect-at-risk-logic

## Capability

Función determinista que clasifica un proyecto como "en riesgo" si la fecha límite está próxima (≤7 días) y tiene tareas abiertas.

## Contract

```python
def detect_at_risk(target_date: date, open_tasks: int) -> bool:
    """
    Args:
        target_date: Fecha límite del proyecto (date object).
        open_tasks: Contador de tareas abiertas de cualquier prioridad (int >= 0).
    
    Returns:
        True si proyecto está en riesgo, False otherwise.
    
    Regla:
        en_riesgo = (target_date - date.today()).days <= 7 AND open_tasks > 0
    
    Umbral: 7 días (inclusive). Si target_date == hoy + 7 días, está en riesgo.
    """
```

## Test Cases (HU-005)

### AC1: Proyecto en riesgo (fecha próxima + tareas abiertas)
```
Hoy: 2026-07-31
Entrada: target_date=2026-08-05 (6 días), open_tasks=2
Esperado: True (en riesgo)
```

### AC2: Proyecto con fecha próxima pero SIN tareas abiertas
```
Hoy: 2026-07-31
Entrada: target_date=2026-08-05, open_tasks=0
Esperado: False (no en riesgo sin tareas)
```

### AC3: Proyecto con tareas pero fecha LEJANA
```
Hoy: 2026-07-31
Entrada: target_date=2026-12-31 (>7 días), open_tasks=5
Esperado: False (fecha no cercana)
```

### AC4: Borde — exactamente 7 días
```
Hoy: 2026-07-31
Entrada: target_date=2026-08-07 (exactamente 7 días), open_tasks=1
Esperado: True (incluye el umbral)
```

### AC5: Actualización dinámica de target_date
```
Setup: proyecto con en_riesgo=False (target_date=2026-12-31, open_tasks=2)
Acción: editar para target_date=2026-08-05 (6 días restantes)
Verificar: detect_at_risk retorna True
```

## Edge Cases

- `target_date=None` → False (no en riesgo).
- `target_date < hoy` (pasado) → False (proyecto vencido, responsabilidad de otro estado).
- `target_date=hoy` (hoy es fecha límite) → True si open_tasks > 0.
- `target_date=hoy + 8 días` → False (apenas fuera de umbral).

## Dependencia Temporal

Función es determinista solo si `date.today()` es fijo dentro de un test. En tests, congelar fecha con `freezegun` o pasar hoy como parámetro.

## No In Scope

- Cálculo de tareas abiertas (eso es EP-004, CRUD de tareas).
- Persistencia de open_tasks (viene de conteo en DB).
- Mostrar badges visuales.
