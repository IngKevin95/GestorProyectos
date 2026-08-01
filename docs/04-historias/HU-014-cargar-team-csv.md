---
id: HU-014
titulo: Cargar equipo desde archivo CSV
epica: EP-005
prioridad: Must
complejidad: S
estado: borrador
---

# HU-014 — Cargar equipo desde archivo CSV

**Como** administrador/operador,
**quiero** cargar los miembros del equipo desde `Team.csv`,
**para** poder asignarles proyectos y tareas en el sistema.

## Fuente
Dataset `Team.csv`. Frontend Spec (`TeamCapacityPage`).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Carga exitosa de equipo
```gherkin
Dado que tengo un archivo Team.csv válido disponible
Cuando selecciono el archivo y presiono "Importar"
Entonces los registros se crean como miembros del equipo
Y están disponibles para ser seleccionados como responsables en proyectos y tareas
```

### Escenario 2: Archivo CSV malformado
```gherkin
Dado que tengo un archivo Team.csv con columnas incorrectas o faltantes
Cuando presiono "Importar"
Entonces el sistema muestra un error indicando el problema de formato
Y ningún miembro de equipo inválido es guardado en la base de datos
```

### Escenario 3: Duplicados detectados
```gherkin
Dado que tengo un archivo CSV con IDs duplicados
Cuando intento cargarlo
Entonces el sistema rechaza la carga con mensaje 'IDs duplicados'
Y no se crea ningún registro
```

### Escenario 4: Falla de conexión a BD durante carga
```gherkin
Dado que la base de datos está momentáneamente no disponible
Cuando intento cargar el archivo Team.csv
Entonces el sistema muestra error "No se puede conectar a la BD"
Y permite reintentar la operación sin perder el archivo seleccionado
```

### Escenario 5: Archivo CSV grande o volumen alto de registros
```gherkin
Dado que cargo un archivo CSV con 1000+ miembros de equipo
Cuando presiono "Importar"
Entonces el sistema procesa la carga sin timeout (<30s)
Y muestra progreso visual (barra de carga o contador)
```