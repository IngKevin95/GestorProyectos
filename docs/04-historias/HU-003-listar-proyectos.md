---
id: HU-003
titulo: Listar proyectos con soporte a filtros básicos
epica: EP-001
prioridad: Must
complejidad: M
estado: lista
dependencias: [HU-002]
---

# HU-003 — Listar proyectos con soporte a filtros básicos

**Como** Delivery Lead,
**quiero** ver una lista de todos los proyectos con la opción de filtrar por estado, salud y responsable,
**para** encontrar rápidamente los proyectos que necesito revisar.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 6 (Must: vista de cartera ordenada con filtros básicos).

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — Lista completa y filtros aplicables son objetivos.
- **Pequeña**: ✓ — Lectura y filtrado, sin lógica de salud (eso es EP-002).
- **con Test claro**: ✓ — Crear varios proyectos, filtrar por cada dimensión, verificar resultados.
- **Valiosa**: ✓
- **Independiente**: ✓ — Aprobado (depende de EP-002 para la columna "salud").
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Listar todos los proyectos (sin filtro)
```gherkin
Dado que existen 5 proyectos en el sistema
Cuando voy a la pantalla de cartera
Entonces veo una lista mostrando los 5 proyectos
Y cada fila muestra al menos: nombre, responsable, estado, fecha_límite
```

### Escenario 2: Filtrar por estado
```gherkin
Dado que existen 5 proyectos: 3 "Activo", 2 "En Pausa"
Cuando aplico filtro estado="Activo"
Entonces la lista muestra solo los 3 proyectos "Activo"
Y el filtro aparece aplicado (visible en la UI)
```

### Escenario 3: Filtrar por responsable
```gherkin
Dado que existen 5 proyectos: 2 de Alice, 3 de Bob
Cuando aplico filtro responsable="Alice"
Entonces la lista muestra solo los 2 proyectos de Alice
```

### Escenario 4: Filtro sin resultados
```gherkin
Dado que existen 5 proyectos
Cuando aplico filtro estado="Cancelado" (ninguno tiene ese estado)
Entonces la lista aparece vacía
Y veo un mensaje "No hay proyectos que coincidan con el filtro"
```

### Escenario 5: Limpiar filtro
```gherkin
Dado que tengo aplicado un filtro (estado="Activo") mostrando 3 proyectos
Cuando hago clic en "Limpiar filtro" o similar
Entonces la lista vuelve a mostrar todos los 5 proyectos
Y el filtro desaparece de la UI
```

## Nota de Diseño

**Filtros disponibles en MVP**: estado, responsable.
**Filtro de salud** (bloqueado/riesgo/sin rumbo/ok) se agrega en HU-007 (Vista de Cartera) donde la clasificación de salud está disponible
`
