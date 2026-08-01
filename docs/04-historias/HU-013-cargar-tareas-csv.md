---
id: HU-013
titulo: Cargar tareas desde archivo CSV
epica: EP-005
prioridad: Must
complejidad: M
estado: borrador
dependencias: [HU-012]
---

# HU-013 — Cargar tareas desde archivo CSV

**Como** desarrollador/operador,
**quiero** poder cargar tareas desde un archivo CSV (dataset Aztec Tasks.csv) para poblar la base de datos con datos de ejemplo,
**para** que el sistema tenga tareas reales asociadas a los proyectos.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 6 (Must: carga de datos semilla desde dataset); Sección 8 (requisito técnico: soportar carga de datos desde CSV).

## Mapeo CSV → Modelo

```
Tasks.csv columns → Task fields:
- task_code → id (identificador único)
- project_code → proyecto (relación con Project)
- assignee → asignado a
- priority → prioridad
- status → estado (abierta, cerrada, etc.)
- due_date → fecha de vencimiento
- is_overdue → booleano (calculable o dato)
- dependency → dependencia (si aplica)
- title → título
- detail → descripción detallada
```

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — Datos cargados son consultables; relaciones proyecto-tarea verificables.
- **Pequeña**: ✓ — Lectura e inserción batch, sin lógica de negocio.
- **con Test claro**: ✓ — Cargar CSV, verificar que N tareas se crearon y están asociadas a los proyectos correctos.
- **Valiosa**: ✓
- **Independiente**: ✓ — Puede desarrollarse insertando los proyectos requeridos mediante fixtures antes de cargar el CSV.
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Cargar CSV de tareas exitosamente (flujo feliz)
```gherkin
Dado que existen proyectos previos en la base de datos
Y tengo un archivo Tasks.csv con 20 tareas asociadas a esos proyectos
Y la interfaz de carga de tareas está abierta
Y he seleccionado el archivo
Cuando presiono "Importar"
Entonces la API acepta la carga asíncrona (202 Accepted)
Y la UI muestra un Spinner de carga
Y recibo progreso mediante SSE (Server-Sent Events)
Y al finalizar veo "20 tareas cargadas exitosamente"
```

### Escenario 2: Tarea se asocia al proyecto correcto
```gherkin
Dado que he cargado tareas con project_code="P001"
Y abro el proyecto P001
Cuando veo la sección "Tareas"
Entonces veo todas las tareas asociadas a P001
Y no aparecen tareas de otros proyectos
```

### Escenario 3: Fallo - tarea referencia proyecto inexistente
```gherkin
Dado que cargo un CSV con una tarea que tiene project_code="PROYECTO_NO_EXISTE"
Cuando presiono "Importar"
Entonces el sistema reporta error "Proyecto no encontrado para tarea XXX"
Y ofrece opción de saltarla o abortar la carga
```

### Escenario 4: Borde - CSV con priority en formato numérico
```gherkin
Dado que el CSV tiene priority como "1" (numérico) en lugar de "Alta"
Cuando presiono "Importar"
Entonces el sistema mapea correctamente: 1 → "Alta" (o similar)
Y la tarea se crea con prioridad interpretada correctamente
```

### Escenario 5: Borde - is_overdue se calcula correctamente
```gherkin
Dado que cargo tareas con due_date pasadas (anteriores a hoy)
Cuando presiono "Importar"
Entonces el sistema calcula is_overdue=true automáticamente
Y los contadores de overdue_tasks del proyecto se actualizan correctamente
```
