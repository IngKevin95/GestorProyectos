---
id: HU-006
titulo: Detectar automáticamente proyectos sin siguiente paso claro
epica: EP-002
prioridad: Must
complejidad: S
estado: borrador
---

# HU-006 — Detectar automáticamente proyectos sin siguiente paso claro

**Como** Delivery Lead,
**quiero** que el sistema marque automáticamente un proyecto como "sin rumbo" cuando el campo "siguiente paso" está vacío,
**para** identificar rápidamente cuáles proyectos necesitan definir qué hacer next.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 1 (objetivo); Sección 6 (Must: motor de detección con reglas explícitas).
Enunciado: "detectar proyectos en riesgo, bloqueados o sin siguiente paso claro".

## Definición de "sin rumbo"

Regla explícita: Un proyecto está sin rumbo si:
- Campo `siguiente_paso` (o equivalente) está vacío (null o string vacío).

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — Verificación de campo vacío es trivial y determinista.
- **Pequeña**: ✓ — Una única condición simple.
- **con Test claro**: ✓ — Proyectos con/sin siguiente paso, verificar etiqueta.
- **Valiosa**: ✓
- **Independiente**: ✓ — Aprobado.
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Proyecto sin siguiente paso (campo vacío)
```gherkin
Dado que un proyecto tiene siguiente_paso=""
Cuando cargo el proyecto
Entonces el campo health muestra "Sin rumbo"
Y aparece un badge visual indicando "Sin rumbo"
```

### Escenario 2: Proyecto CON siguiente paso definido
```gherkin
Dado que un proyecto tiene siguiente_paso="Revisar especificación con cliente"
Cuando cargo el proyecto
Entonces el health NO muestra "Sin rumbo"
Y muestra "Ok" u otro estado
```

### Escenario 3: Crear proyecto sin siguiente paso
```gherkin
Dado que estoy en la pantalla de crear proyecto
Y no lleno el campo siguiente_paso
Cuando presiono "Guardar"
Entonces el proyecto se crea
Y su estado health es "Sin rumbo"
```

### Escenario 4: Borde - siguiente paso con espacios en blanco solamente
```gherkin
Dado que un proyecto tiene siguiente_paso="   " (solo espacios)
Cuando cargo el proyecto
Entonces se detecta como "Sin rumbo" (espacios = vacío funcional)
```

### Escenario 5: Llenar siguiente paso en un proyecto sin rumbo
```gherkin
Dado que un proyecto tiene siguiente_paso="" y health="Sin rumbo"
Y tengo el formulario de edición abierto
Y he ingresado siguiente_paso="Contactar stakeholders para feedback"
Cuando presiono "Guardar"
Entonces el estado health se actualiza a "Ok"
Y el badge cambia visualmente de gris ("Sin rumbo") a verde ("Ok")
```
