---
id: HU-004
titulo: Detectar automáticamente proyectos bloqueados
epica: EP-002
prioridad: Must
complejidad: M
estado: lista
---

# HU-004 — Detectar automáticamente proyectos bloqueados

**Como** Delivery Lead,
**quiero** que el sistema marque automáticamente un proyecto como "bloqueado" cuando tiene bloqueos registrados o muchas tareas vencidas,
**para** identificar sin revisar manualmente cuál es mi cuello de botella.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 1 (objetivo); Sección 6 (Must: motor de detección con reglas explícitas).
Enunciado: "detectar proyectos en riesgo, bloqueados o sin siguiente paso claro".

## Definición de "bloqueado"

Regla explícita: Un proyecto está bloqueado si:
- Campo `blockers` (texto libre) no está vacío, O
- `overdue_tasks` > umbral definido (ej: 3+)

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — La clasificación es determinista: se aplica la regla, sí o no.
- **Pequeña**: ✓ — Una única condición, sin orquestación de otros estados.
- **con Test claro**: ✓ — Proyectos con/sin bloqueos, proyectos con tareas vencidas, verificar etiqueta.
- **Valiosa**: ✓
- **Independiente**: ✓ — Aprobado (puede ejecutarse sin HU-005/HU-006, pero el UI final integra los tres).
- **Negociable**: ✓ — Aprobado (la regla "3+ overdue_tasks" es parametrizable).
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Proyecto bloqueado por bloqueos registrados (flujo feliz)
```gherkin
Dado que un proyecto tiene blockers="Pendiente aprobación legal"
Cuando cargo el proyecto o consulto su estado
Entonces el campo health/status muestra "Bloqueado"
Y aparece un badge visible indicando "Bloqueado"
```

### Escenario 2: Proyecto bloqueado por tareas vencidas excesivas
```gherkin
Dado que un proyecto tiene overdue_tasks=5 (umbral es 3+)
Cuando cargo el proyecto
Entonces el campo health muestra "Bloqueado"
Y el badge visual refleja este estado
```

### Escenario 3: Proyecto no bloqueado (sin bloqueos, tareas vencidas < umbral)
```gherkin
Dado que un proyecto tiene blockers="" y overdue_tasks=1
Cuando cargo el proyecto
Entonces el campo health NO muestra "Bloqueado"
Y el badge muestra "Ok" u otro estado
```

### Escenario 4: Borde - múltiples bloqueos registrados
```gherkin
Dado que un proyecto tiene blockers="Espera presupuesto; Falta recurso senior"
Cuando cargo el proyecto
Entonces se detecta como "Bloqueado" (cualquier bloqueo cuenta)
```

### Escenario 5: Actualizar bloqueos y verificar cambio de estado
```gherkin
Dado que un proyecto tiene blockers="" y health="Ok"
Y tengo el formulario de edición abierto
Y he ingresado blockers="Espera cliente"
Cuando presiono "Guardar"
Entonces el estado health se actualiza a "Bloqueado"
Y el proyecto se renderiza con badge visual "Bloqueado"
```
