---
id: HU-008
titulo: Ordenar vista de cartera por score de priorización
epica: EP-003
prioridad: Must
complejidad: M
estado: borrador
---

# HU-008 — Ordenar vista de cartera por score de priorización

**Como** Delivery Lead,
**quiero** que la vista de cartera ordene los proyectos automáticamente por un score de priorización que combine salud, urgencia (fecha límite próxima), valor de negocio y tareas críticas,
**para** saber exactamente en qué orden debo atenderlos.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` §7 (Must: score de priorización visible con criterio documentado); §6 (KPI: evaluador identifica en <30s qué proyectos requieren atención).

## Chequeo INVEST

- **Verificable**: ✓ — Orden de lista es observable; fórmula es verificable.
- **Pequeña**: ✓ — Cálculo y ordenamiento, sin UI compleja.
- **con Test claro**: ✓ — Crear proyectos con distintos scores, verificar orden resultante.
- **Valiosa**: ✓
- **Independiente**: ✓ — Puede desarrollarse con mocks (datos precalculados) sin depender de EP-002.
- **Negociable**: ✓ — Aprobado (pesos y fórmula son refinables).
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Dashboard ordenado por score de priorización (flujo feliz)
```gherkin
Dado que existen 3 proyectos:
  - P1: health=Bloqueado, urgencia=6 días, valor=10, tasks_críticas=2 (score alto)
  - P2: health=Ok, urgencia=30 días, valor=5, tasks_críticas=0 (score bajo)
  - P3: health=En riesgo, urgencia=5 días, valor=8, tasks_críticas=1 (score medio)
Cuando veo el dashboard
Entonces el orden visible es: P1, P3, P2 (score descendente)
```

### Escenario 2: Score se recalcula al cambiar proyecto
```gherkin
Dado que proyecto P2 está al final de la lista (score bajo)
Y tengo el formulario de edición abierto
Y he ingresado target_date="2026-08-05" (urgencia alta: 2 días) y open_tasks_alta=3
Cuando presiono "Guardar"
Entonces vuelvo al dashboard y P2 ahora aparece arriba en la lista (score aumentó)
```

### Escenario 3: Borde - dos proyectos con score idéntico
```gherkin
Dado que dos proyectos tienen exactamente el mismo score
Cuando veo el dashboard
Entonces se ordenan de forma determinista (ej: por nombre, o por fecha de creación)
Y no hay ambigüedad en el orden
```

### Escenario 4: Score con valor de negocio cero
```gherkin
Dado que un proyecto tiene business_value=0 (bajo valor)
Cuando calculo su score
Entonces se calcula correctamente sin errores
Y el score refleja que el valor es bajo
```

### Escenario 5: Dashboard con un solo proyecto
```gherkin
Dado que existe solo 1 proyecto en el sistema
Cuando veo el dashboard
Entonces el proyecto aparece (no hay error)
Y muestra su score
```
