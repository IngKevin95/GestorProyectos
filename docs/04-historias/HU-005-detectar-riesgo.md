---
id: HU-005
titulo: Detectar automáticamente proyectos en riesgo
epica: EP-002
prioridad: Must
complejidad: M
estado: borrador
---

# HU-005 — Detectar automáticamente proyectos en riesgo

**Como** Delivery Lead,
**quiero** que el sistema marque automáticamente un proyecto como "en riesgo" cuando la fecha límite está próxima y hay tareas abiertas críticas,
**para** priorizar mi acción antes de que se vuelva bloqueado.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 1 (objetivo); Sección 6 (Must: motor de detección con reglas explícitas).
Enunciado: "detectar proyectos en riesgo, bloqueados o sin siguiente paso claro".

## Definición de "en riesgo"

Regla explícita (alineada con PRD §7 y ADR-003): Un proyecto está en riesgo si:
- `target_date` está a ≤7 días (configurable), Y
- `open_tasks` > 0 (de cualquier prioridad).

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — La clasificación es determinista: se compara fecha y cuenta de tareas abiertas altas.
- **Pequeña**: ✓ — Una única condición de doble factor, sin orquestación de otros estados.
- **con Test claro**: ✓ — Proyectos con fecha cercana + tareas altas, sin tareas, con tareas bajas, verificar etiqueta.
- **Valiosa**: ✓
- **Independiente**: ✓ — Aprobado.
- **Negociable**: ✓ — Aprobado (los umbrales "7 días", "tareas altas" son parametrizables).
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Proyecto en riesgo (fecha próxima + tareas altas abiertas)
```gherkin
Dado que un proyecto tiene target_date="2026-08-05" (6 días desde hoy 2026-07-31)
Y open_tasks con prioridad "Alta" = 2
Cuando cargo el proyecto
Entonces el campo health muestra "En riesgo"
Y aparece un badge visual indicando "En riesgo"
```

### Escenario 2: Proyecto con fecha próxima pero SIN tareas altas
```gherkin
Dado que un proyecto tiene target_date="2026-08-05"
Y open_tasks con prioridad "Alta" = 0 (solo tareas bajas)
Cuando cargo el proyecto
Entonces el health NO muestra "En riesgo"
Y muestra "Ok" u otro estado
```

### Escenario 3: Proyecto con tareas altas pero fecha LEJANA
```gherkin
Dado que un proyecto tiene target_date="2026-12-31" (>7 días)
Y open_tasks con prioridad "Alta" = 5
Cuando cargo el proyecto
Entonces el health NO muestra "En riesgo"
Y muestra "Ok"
```

### Escenario 4: Borde - exactamente en el umbral de 7 días
```gherkin
Dado que un proyecto tiene target_date="2026-08-07" (exactamente 7 días desde hoy)
Y open_tasks alta=1
Cuando cargo el proyecto
Entonces se detecta como "En riesgo" (incluye el día 7)
```

### Escenario 5: Actualizar fecha y verificar cambio de estado
```gherkin
Dado que un proyecto tiene target_date="2026-12-31" y health="Ok"
Y tengo el formulario de edición abierto
Y he ingresado target_date="2026-08-05" (6 días restantes)
Y el proyecto tiene open_tasks_alta=2
Cuando presiono "Guardar"
Entonces el estado health se actualiza a "En riesgo"
Y aparece badge visual con color ámbar
```
