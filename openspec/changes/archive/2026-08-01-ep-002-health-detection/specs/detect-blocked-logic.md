# Spec — detect-blocked-logic

## Capability

Función determinista que clasifica un proyecto como "bloqueado" si tiene bloqueos registrados o demasiadas tareas vencidas.

## Contract

```python
def detect_blocked(blockers: str, overdue_tasks: int) -> bool:
    """
    Args:
        blockers: Texto libre con descripción de bloqueos (puede ser null/"").
        overdue_tasks: Contador de tareas vencidas (int >= 0).
    
    Returns:
        True si proyecto está bloqueado, False otherwise.
    
    Regla:
        bloqueado = (blockers.strip() != "") OR (overdue_tasks >= 3)
    """
```

## Test Cases (HU-004)

### AC1: Proyecto bloqueado por blockers registrados (flujo feliz)
```
Entrada: blockers="Pendiente aprobación legal", overdue_tasks=0
Esperado: True (bloqueado)
```

### AC2: Proyecto bloqueado por overdue_tasks excesivas
```
Entrada: blockers="", overdue_tasks=5
Esperado: True (bloqueado, 5 >= 3)
```

### AC3: Proyecto NO bloqueado (vacío + bajo umbral)
```
Entrada: blockers="", overdue_tasks=1
Esperado: False
```

### AC4: Borde — múltiples blockers
```
Entrada: blockers="Espera presupuesto; Falta recurso senior", overdue_tasks=0
Esperado: True (blockers no vacío)
```

### AC5: Actualización dinámica de blockers
```
Setup: proyecto con bloqueado=False (blockers="" + overdue_tasks=1)
Acción: editar para blockers="Espera cliente"
Verificar: detect_blocked retorna True
```

## Edge Cases

- `blockers=None` → tratar como "" (no bloqueado por sí solo).
- `blockers="   "` (espacios) → `.strip()` lo convierte a "", no bloqueado.
- `overdue_tasks=3` (exactamente umbral) → bloqueado.
- `overdue_tasks=2` (justo debajo) → no bloqueado.

## No In Scope

- Crear/editar blockers (eso es CRUD en EP-001).
- Mostrar badges visuales (eso es frontend, fuera de esta capability).
- Persistencia de health (cache opcional en la tabla, no crítico para lógica).
