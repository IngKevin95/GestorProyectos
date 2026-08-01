---
id: HU-019
titulo: Gestionar plantillas de proyectos
epica: EP-007
prioridad: Should
complejidad: M
estado: borrador
---

# HU-019 — Gestionar plantillas de proyectos

**Como** Administrador,
**quiero** definir plantillas base con tareas predeterminadas y valores por defecto,
**para** agilizar la creación de proyectos repetitivos.

## Fuente
Frontend Spec (`TemplatesPage`).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Crear proyecto desde plantilla
```gherkin
Dado que existen plantillas configuradas en el sistema
Cuando voy a crear un nuevo proyecto
Y selecciono una plantilla
Entonces el formulario pre-carga los valores por defecto (ej. engagement type)
Y se generan automáticamente las tareas predefinidas en la plantilla para este nuevo proyecto
```

### Escenario 2: Intentar crear plantilla con nombre duplicado
```gherkin
Dado que existe una plantilla llamada "Desarrollo Web"
Cuando intento crear una nueva plantilla con el mismo nombre
Entonces el sistema muestra un error de validación "El nombre ya está en uso"
Y la plantilla no se guarda
```

### Escenario Borde: Plantilla sin tareas
```gherkin
Dado que creo una plantilla
Cuando no incluyo tareas
Entonces la plantilla se guarda como esqueleto básico
```