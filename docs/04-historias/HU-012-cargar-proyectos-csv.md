---
id: HU-012
titulo: Cargar proyectos desde archivo CSV
epica: EP-005
prioridad: Must
complejidad: M
estado: borrador
---

# HU-012 — Cargar proyectos desde archivo CSV

**Como** desarrollador/operador,
**quiero** poder cargar proyectos desde un archivo CSV (dataset Aztec Projects.csv) para poblar la base de datos con datos de ejemplo,
**para** que el sistema tenga datos reales con los que demostrarlo.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 6 (Must: carga de datos semilla desde dataset); Sección 8 (requisito técnico: soportar carga de datos desde CSV).

## Mapeo CSV → Modelo

```
Projects.csv columns → Project fields:
- project_code → id (identificador único)
- project_name → nombre
- client_alias → cliente
- engagement_type → tipo de engagement
- status → estado
- owner_alias → responsable
- start_date → fecha de inicio
- target_date → fecha límite
- business_value → valor de negocio
- blockers → bloqueos (texto libre)
- summary → notas/resumen
```

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — Datos cargados son consultables.
- **Pequeña**: ✓ — Lectura e inserción batch, sin lógica de negocio.
- **con Test claro**: ✓ — Cargar CSV, verificar que N proyectos se crearon.
- **Valiosa**: ✓
- **Independiente**: ✓ — Aprobado.
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Cargar CSV de proyectos exitosamente (flujo feliz)
```gherkin
Dado que tengo un archivo Projects.csv con 10 proyectos válidos
Y la interfaz de carga está abierta
Y he seleccionado el archivo
Cuando presiono "Importar"
Entonces la API acepta la carga asíncrona (202 Accepted)
Y la UI muestra un Spinner de carga
Y recibo progreso mediante SSE (Server-Sent Events)
Y al finalizar veo un mensaje "10 proyectos cargados exitosamente"
```

### Escenario 2: Validación de mapeo de columnas
```gherkin
Dado que cargo un CSV con las columnas estándar (project_code, project_name, status, etc.)
Cuando el sistema procesa el archivo
Entonces el sistema mapea correctamente: project_code→id, project_name→nombre, status→estado
Y cada proyecto creado tiene todos los 7 campos requeridos
```

### Escenario 3: Fallo - archivo con formato inválido
```gherkin
Dado que he seleccionado un archivo que no es CSV (ej: archivo.txt)
Cuando presiono "Importar"
Entonces aparece error "Formato de archivo no válido"
Y ningún proyecto se crea
```

### Escenario 4: Borde - CSV con fila incompleta
```gherkin
Dado que cargo un CSV donde una fila tiene faltante la columna "project_code"
Cuando presiono "Importar"
Entonces el sistema reporta la fila con error
Y ofrece opción de saltarla o abortar la carga
```

### Escenario 5: Borde - CSV con project_code duplicados
```gherkin
Dado que cargo un CSV con project_code duplicados
Cuando presiono "Importar"
Entonces el sistema detecta los duplicados
Y rechaza la carga con mensaje "Proyectos duplicados en fila X"
```
