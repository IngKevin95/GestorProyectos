---
id: HU-010
titulo: Crear y editar tareas de un proyecto
epica: EP-004
prioridad: Must
complejidad: M
estado: borrador
dependencias: [HU-004, HU-005]
---

# HU-010 — Crear y editar tareas de un proyecto

**Como** Delivery Lead,
**quiero** poder crear nuevas tareas y editar las existentes dentro de un proyecto,
**para** mantener el estado real del trabajo y alimentar correctamente el motor de riesgo.

## Fuente
Auditoría de Producto (Brecha Trazabilidad). Especificaciones Frontend (`TaskFormModal`).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Crear tarea exitosamente
```gherkin
Dado que estoy en la vista de tareas del proyecto
Cuando hago clic en "Nueva Tarea"
Y completo los campos requeridos (título, asignado, prioridad)
Y presiono "Guardar"
Entonces la tarea se agrega a la lista
Y los contadores del proyecto (open_tasks) se actualizan
```

### Escenario 2: Editar estado de tarea inline
```gherkin
Dado que estoy viendo la lista de tareas
Cuando cambio el estado de una tarea a "Bloqueada" desde el menú rápido
Entonces el estado se actualiza sin abrir un modal
Y si esto genera un cambio en la salud del proyecto, se refleja
```

### Escenario 3: Falla de validación al crear tarea
```gherkin
Dado que estoy en el modal de nueva tarea
Cuando presiono "Guardar" sin llenar el título
Entonces el sistema resalta el campo de título con un error "Requerido"
Y la tarea no se crea
```

### Escenario 4: Conflicto de concurrencia al editar
```gherkin
Dado que estoy editando una tarea
Y otro usuario edita la misma tarea en paralelo
Cuando presiono "Guardar"
Entonces el sistema detecta el conflicto de versión
Y ofrece opciones: sobrescribir, descartar cambios, recargar
```

### Escenario 5: Límites de entrada y campos largos
```gherkin
Dado que estoy creando una tarea
Cuando ingreso un título > 500 caracteres
Entonces el backend rechaza la entrada
Y el frontend muestra error "Máximo 500 caracteres"
```
