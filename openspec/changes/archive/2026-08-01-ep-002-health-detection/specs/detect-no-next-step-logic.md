# Spec — detect-no-next-step-logic

## Capability

Función determinista que clasifica un proyecto como "sin rumbo" si no tiene un siguiente paso definido.

## Contract

```python
def detect_no_next_step(siguiente_paso: str) -> bool:
    """
    Args:
        siguiente_paso: Texto libre con la próxima acción (puede ser null/"").
    
    Returns:
        True si proyecto está sin rumbo (no tiene siguiente paso), False otherwise.
    
    Regla:
        sin_rumbo = (siguiente_paso.strip() == "")
    """
```

## Test Cases (HU-006)

### AC1: Proyecto sin siguiente paso (campo vacío)
```
Entrada: siguiente_paso=""
Esperado: True (sin rumbo)
```

### AC2: Proyecto CON siguiente paso definido
```
Entrada: siguiente_paso="Revisar especificación con cliente"
Esperado: False (tiene rumbo)
```

### AC3: Crear proyecto sin siguiente paso
```
Setup: Proyecto recién creado sin llenar siguiente_paso
Verificar: detect_no_next_step retorna True
```

### AC4: Borde — siguiente paso con espacios en blanco solamente
```
Entrada: siguiente_paso="   " (solo espacios)
Esperado: True (espacios = vacío funcional tras .strip())
```

### AC5: Llenar siguiente paso en proyecto sin rumbo
```
Setup: proyecto con sin_rumbo=True (siguiente_paso="")
Acción: editar para siguiente_paso="Contactar stakeholders para feedback"
Verificar: detect_no_next_step retorna False
```

## Edge Cases

- `siguiente_paso=None` → tratar como "" (sin rumbo).
- `siguiente_paso="   "` (solo espacios) → `.strip()` lo convierte a "", sin rumbo.
- `siguiente_paso` con caracteres especiales → válido, no sin rumbo (ej: "✓ Revisar").

## No In Scope

- Crear/editar siguiente_paso (eso es CRUD en EP-001).
- Mostrar badges visuales (eso es frontend, fuera de esta capability).
- Persistencia de health (cache opcional en la tabla, no crítico para lógica).
