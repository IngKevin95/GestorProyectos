---
id: HU-011
titulo: Ver tareas de proyecto con filtrado por estado
epica: EP-004
prioridad: Must
complejidad: M
estado: lista
---

# HU-011 — Ver tareas de proyecto con filtrado por estado

**Como** Delivery Lead,
**quiero** ver todas las tareas de un proyecto (mostrando ID, asignado, prioridad, estado, fecha) y poder filtrar por estado (abierta, vencida, bloqueada),
**para** entender rápidamente qué problemas tiene cada proyecto y enfocarme en qué tipo de tarea atender.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 3 (historia: "ver las tareas de un proyecto"); Sección 6 (Should: vista de tareas con filtrado).

## Estados de tarea a filtrar

- Abierta (open, active)
- Vencida (overdue)
- Bloqueada (blocked, dependency unmet)
- Cerrada (closed, done — opcional)

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — Lista de tareas y filtros son visibles.
- **Pequeña**: ✓ — Lectura + filtrado simple.
- **con Test claro**: ✓ — AC claros cubriendo lista + cada filtro.
- **Valiosa**: ✓
- **Independiente**: ✓ — No requiere que otra historia esté lista (datos de tareas son input externo).
- **Negociable**: ✓ — Aprobado (qué columnas mostrar, orden).
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Ver lista completa de tareas (sin filtro)
```gherkin
Dado que un proyecto tiene 5 tareas asociadas
Cuando abro el detalle del proyecto
Entonces veo una sección "Tareas" con tabla mostrando 5 filas
Y cada fila muestra: task_code, assignee, priority, status, due_date, title
```

### Escenario 2: Filtrar tareas por estado "abierta"
```gherkin
Dado que un proyecto tiene 5 tareas: 3 abierta, 1 vencida, 1 cerrada
Cuando aplico filtro [Estado ▼] seleccionando "Abierta"
Entonces veo solo las 3 tareas con status="abierta"
Y el filtro aparece aplicado visualmente en la UI
```

### Escenario 3: Filtrar tareas por estado "vencida" (con indicador visual)
```gherkin
Dado que un proyecto tiene tareas con due_date pasadas
Cuando aplico filtro "Vencida"
Entonces veo solo las tareas vencidas
Y cada tarea aparece con indicador visual (color rojo, ícono ⚠️)
```

### Escenario 4: Filtro sin resultados
```gherkin
Dado que un proyecto NO tiene tareas "cerradas"
Cuando aplico filtro "Cerrada"
Entonces la lista aparece vacía
Y veo mensaje "No hay tareas en este estado"
```

### Escenario 5: Limpiar filtro
```gherkin
Dado que tengo aplicado un filtro (mostrando 2 de 5 tareas)
Cuando hago clic en "Limpiar filtro" o reseteo los filtros
Entonces vuelvo a ver todas las 5 tareas
Y el filtro desaparece de la UI
```
