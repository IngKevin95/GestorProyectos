---
id: HU-018
titulo: Ver capacidad de carga del equipo
epica: EP-008
prioridad: Should
complejidad: M
estado: borrador
---

# HU-018 — Ver capacidad de carga del equipo (Team Capacity)

**Como** Delivery Lead,
**quiero** ver una tabla de todos los miembros del equipo con sus tareas abiertas, bloqueadas y críticas asignadas,
**para** identificar rápidamente sobrecargas y redistribuir el trabajo.

## Fuente
Frontend Spec (`TeamCapacityPage`).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Carga visual de equipo
```gherkin
Dado que accedo a la página "/team"
Cuando veo la tabla de miembros
Entonces visualizo los contadores de tareas abiertas/bloqueadas por persona
Y cada persona tiene un badge de carga (low, medium, high, overloaded) basado en sus tareas
```

### Escenario 2: Ningún miembro del equipo cargado
```gherkin
Dado que accedo a la página "/team"
Cuando no existen miembros del equipo en la base de datos
Entonces veo un empty state sugiriendo cargar miembros o importar el archivo CSV
Y la tabla no se muestra
```

### Escenario 3: Identificación de sobrecarga
```gherkin
Dado que un miembro tiene 15 tareas abiertas
Cuando veo la tabla de capacidad
Entonces su badge muestra "Overloaded" en rojo
Y su fila está destacada en rojo para avisar del cuello de botella
```

### Escenario 4: Miembro sin tareas asignadas
```gherkin
Dado que un miembro del equipo existe pero no tiene tareas asignadas
Cuando veo la tabla de capacidad
Entonces su fila muestra "0" en todos los contadores
Y el badge muestra "Low" (disponibilidad alta)
```

### Escenario 5: Recálculo en tiempo real tras cambio de asignación
```gherkin
Dado que estoy viendo la tabla de capacidad
Cuando se asigna una nueva tarea a un miembro en otra ventana
Entonces la tabla se actualiza automáticamente vía SSE
Y los contadores se recalculan sin necesidad de refrescar la página
```
