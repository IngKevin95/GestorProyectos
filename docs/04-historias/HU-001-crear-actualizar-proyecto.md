---
id: HU-001
titulo: Crear y actualizar proyecto con campos operativos clave
epica: EP-001
prioridad: Must
complejidad: M
estado: borrador
---

# HU-001 — Crear y actualizar proyecto con campos operativos clave

**Como** Delivery Lead,
**quiero** crear y actualizar proyectos con responsable, estado, prioridad, fecha límite, siguiente paso, bloqueos, notas y tipo de proyecto,
**para** mantener el estado real de la cartera y clasificar trabajo por tipo (Mantenimiento, Recurrente, Diagnóstico, Proyecto).

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 3 (historia de origen) y Sección 6 (Must: CRUD de proyectos).

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — AC pendientes de `/factory-product-ac`, pero el criterio de éxito (campos editables) es objetivamente comprobable.
- **Pequeña**: ✓ — cubre alta + edición de un único proyecto con 8 campos (incluido tipo), sin lógica de salud/priorización (eso es EP-002/EP-003).
- **con Test claro**: ✓ — probar creando y editando un proyecto con los 7 campos.
- **Valiosa**: ✓
- **Independiente**: ✓ — Aprobado (depende del modelo de datos base, pero no de otras historias de negocio).
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Crear proyecto con todos los campos (flujo feliz)
```gherkin
Dado que soy un Delivery Lead en la pantalla de crear proyecto
Y he ingresado: responsable="Alice", estado="Activo", prioridad="Alta", fecha_límite="2026-12-31", siguiente_paso="Revisar brief con cliente", bloqueos="Pendiente aprobación presupuesto", notas="Proyecto piloto XYZ", tipo_proyecto="Diagnóstico"
Cuando presiono "Guardar"
Entonces el proyecto se crea y aparece en la lista de cartera
Y todos los 8 campos son visibles con los valores exactos que ingresé
```

### Escenario 2: Actualizar estado y siguiente paso de proyecto existente
```gherkin
Dado que existe un proyecto con estado="Activo" y responsable="Bob"
Y abro el formulario de edición del proyecto
Y cambio el estado a "En Pausa" y el siguiente_paso a "Esperar feedback cliente"
Cuando presiono "Guardar"
Entonces el proyecto se actualiza en la base de datos
Y la lista de cartera refleja los cambios de inmediato
```

### Escenario 3: Fallo - campo requerido faltante
```gherkin
Dado que estoy en la pantalla de crear proyecto
Y he llenado todos los campos excepto "responsable"
Cuando presiono "Guardar"
Entonces aparece un mensaje de error "El campo 'Responsable' es obligatorio"
Y el proyecto NO se crea
```

### Escenario 4: Borde - texto muy largo en notas
```gherkin
Dado que estoy creando un proyecto
Y he ingresado un valor de 1000 caracteres en el campo "notas"
Cuando presiono "Guardar"
Entonces el proyecto se crea correctamente
Y el campo "notas" retiene todo el texto sin truncarlo
```

### Escenario 5: Borde - caracteres especiales en nombre y responsable
```gherkin
Dado que estoy creando un proyecto
Y he ingresado caracteres especiales (ñ, &, /, @, €) en el nombre
Y he ingresado "Cliente: Ñoño & Cía. (USA)" en el campo responsable
Cuando presiono "Guardar"
Entonces el proyecto se crea correctamente
Y los caracteres aparecen sin corrupción al consultarlo
```

## Siguiente paso

`/factory-product-invest HU-001` para validar la T (Testable) de INVEST con estos AC como evidencia
`
