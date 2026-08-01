---
id: HU-007
titulo: Mostrar vista de cartera con badges de salud
epica: EP-003
prioridad: Must
complejidad: M
estado: borrador
---

# HU-007 — Mostrar vista de cartera con badges de salud

**Como** Delivery Lead,
**quiero** ver un dashboard/tablero de proyectos donde cada uno muestra un badge visual (color, ícono, etiqueta) indicando su estado de salud (bloqueado, en riesgo, sin rumbo, ok),
**para** captar de un vistazo qué problemas hay en la cartera.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 5 (vista de cartera con badges); Sección 6 (Must: vista de cartera con filtros y badges).

## Componentes visuales

- Badge de estado: ícono + etiqueta + color distintivo (rojo bloqueado, ámbar riesgo, gris sin rumbo, verde ok).
- Accesibilidad: no solo color, sino también ícono y texto (WCAG).

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — Presencia de badge, color correcto, etiqueta correcta son visibles.
- **Pequeña**: ✓ — Presentación de datos ya clasificados, sin lógica de cálculo.
- **con Test claro**: ✓ — Cargar proyecto con salud conocida, verificar badge.
- **Valiosa**: ✓
- **Independiente**: ✓ — Puede desarrollarse simulando datos de estado (mocks) sin esperar a EP-002.
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Ver dashboard con badges de salud (flujo feliz)
```gherkin
Dado que existen 4 proyectos: 1 "Bloqueado", 1 "En riesgo", 1 "Sin rumbo", 1 "Ok"
Cuando accedo a la vista de cartera
Entonces veo una lista/tablero de 4 filas
Y cada fila muestra un badge visual distinto (color + ícono + etiqueta)
```

### Escenario 2: Badge "Bloqueado" es visualmente distintivo
```gherkin
Dado que hay un proyecto con health="Bloqueado"
Cuando veo el dashboard
Entonces el badge muestra color rojo (o similar)
Y muestra ícono de bloqueo (🚫 u otro)
Y muestra etiqueta "Bloqueado" (accesibilidad: no solo color)
```

### Escenario 3: Badge "En riesgo" diferenciable
```gherkin
Dado que hay un proyecto con health="En riesgo"
Cuando veo el dashboard
Entonces el badge muestra color ámbar/naranja
Y muestra ícono de alerta (⚠️ u otro)
Y muestra etiqueta "En riesgo"
```

### Escenario 4: Borde - proyecto "Ok" también tiene badge visible
```gherkin
Dado que hay un proyecto con health="Ok"
Cuando veo el dashboard
Entonces tiene un badge visible (no desaparece)
Y muestra color verde o similar
```

### Escenario 5: Cambiar salud de un proyecto se refleja en el dashboard
```gherkin
Dado que un proyecto muestra badge "Ok" (verde) en el dashboard
Y tengo el formulario de edición abierto
Y he ingresado blockers="Dependencia crítica no resuelta"
Cuando presiono "Guardar"
Entonces vuelvo al dashboard y el badge del proyecto cambia a "Bloqueado" (rojo)
Y la actualización ocurre sin necesidad de refrescar manualmente
```
