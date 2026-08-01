---
id: HU-020
titulo: Eliminar proyecto del sistema
epica: EP-001
prioridad: Must
complejidad: S
estado: lista
---

# HU-020 — Eliminar proyecto del sistema

**Como** Delivery Lead,
**quiero** poder eliminar un proyecto que fue creado por error o que ya no pertenece al sistema,
**para** mantener la cartera limpia.

## Fuente
PRD Sección 6 (CRUD completo de proyectos). Trazabilidad de Auditoría.

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓ — Puede probarse con fixtures (aislado).
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Borrado de proyecto
```gherkin
Dado que un proyecto existe en el sistema
Cuando presiono "Eliminar Proyecto"
Y confirmo la acción en el diálogo de advertencia
Entonces el proyecto y sus tareas asociadas son eliminados de la base de datos
Y ya no aparece en el Dashboard
```

### Escenario 2: Cancelar eliminación
```gherkin
Dado que un proyecto existe en el sistema
Cuando presiono "Eliminar Proyecto"
Y presiono "Cancelar" en el diálogo de advertencia
Entonces el proyecto permanece intacto
Y no se realizan cambios en la base de datos
```

### Escenario 3: Eliminación de proyecto con tareas asociadas
```gherkin
Dado que un proyecto tiene 10 tareas asociadas
Cuando confirmo la eliminación del proyecto
Entonces el proyecto y todas sus tareas son eliminados en cascada
Y se registra en auditoría la eliminación en masa
```

### Escenario 4: Error al eliminar
```gherkin
Dado que intento eliminar un proyecto
Cuando el backend falla durante la eliminación
Entonces el proyecto NO es eliminado (transacción reversa)
Y se muestra un mensaje de error "No se pudo eliminar el proyecto"
Y el proyecto sigue disponible en el Dashboard
```

### Escenario 5: Integridad referencial tras eliminación
```gherkin
Dado que acabo de eliminar un proyecto
Cuando actualizo la página o consulto la base de datos
Entonces no existen referencias orfanas a ese proyecto
Y los contadores de proyectos reflejan el nuevo total
```
