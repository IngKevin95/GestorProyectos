---
id: HU-023
titulo: Visualizar y entender el criterio de priorización
epica: EP-003
prioridad: Must
complejidad: M
estado: borrador
dependencias: [HU-008]
---

# HU-023 — Visualizar y entender el criterio de priorización

**Como** Delivery Lead,
**quiero** ver explicado en la UI cuál es el criterio y los pesos usados,
**para** entender por qué un proyecto está posicionado en un lugar específico.

## Fuente

PRD §5 (KPI: "Criterio de priorización es explicable en una sola frase, sin revisar código"). EP-003.

## Chequeo INVEST

- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Panel de criterio visible en Dashboard
```gherkin
Dado que estoy en el Dashboard viendo la cartera
Cuando veo la lista ordenada de proyectos
Entonces hay un panel/badge visible que dice:
  "Priorizamos por: Salud (30%), Urgencia (25%), Valor (25%), Tareas Críticas (20%)"
```

### Escenario 2: Desglose de score en detalle de proyecto
```gherkin
Dado que abro un proyecto
Cuando veo su score de prioridad (ej: 7.2)
Entonces puedo ver un breakdown de cómo se calculó:
  "Score = (Salud: 0.3×8=2.4) + (Urgencia: 0.25×6=1.5) + (Valor: 0.25×9=2.25) + (Críticas: 0.2×5=1.0) = 7.2"
```

### Escenario 3: Estrategia Absoluta muestra claridad
```gherkin
Dado que un proyecto usa "Estrategia Absoluta: 8.5"
Cuando veo el breakdown del score
Entonces muestra claramente: "Score: 8.5 (configurado manualmente, estrategia Absoluta)"
Y NO aparece el desglose de fórmula
```

### Escenario 4: Explicación accesible en una frase
```gherkin
Dado que un usuario sin conocimiento técnico lee el criterio
Cuando lee el panel en el Dashboard
Entonces entiende en una sola frase cómo se prioriza
Y puede explicar a un tercero sin revisar código
```

### Escenario 5: Tooltip en cada factor
```gherkin
Dado que me paro sobre un factor (ej: "Salud 30%")
Cuando veo el tooltip
Entonces explica brevemente: "Salud: evaluada como Bloqueado/Riesgo/Sin Rumbo/Ok"
Y cada factor tiene un tooltip similar
```
