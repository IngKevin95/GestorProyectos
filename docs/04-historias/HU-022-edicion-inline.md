---
id: HU-022
titulo: Edición inline en el tablero
epica: EP-001
prioridad: Must
complejidad: S
estado: borrador
dependencias: [HU-001]
---

# HU-022 — Edición inline en el tablero

**Como** Delivery Lead,
**quiero** poder editar el campo "Siguiente paso" y "Bloqueos" directamente desde la vista de cartera o tabla de proyectos sin entrar al detalle,
**para** actualizar rápidamente la situación de la cartera durante una reunión.

## Fuente
PRD Sección 6 (Could). Auditoría de Trazabilidad.

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Edición rápida inline
```gherkin
Dado que estoy en la vista de cartera
Cuando hago doble clic sobre la columna "Siguiente Paso" de un proyecto
Entonces la celda se vuelve un campo de texto editable
Y al perder el foco (blur) o presionar Enter, se guarda el cambio en el backend
```

### Escenario 2: Falla al guardar edición inline
```gherkin
Dado que tengo una celda en modo edición con cambios sin guardar
Cuando la conexión con el backend falla al guardar
Entonces la celda revierte a su valor original
Y se muestra un mensaje de error tipo "toast" notificando el problema
```

### Escenario 3: Validación de contenido en tiempo real
```gherkin
Dado que una celda está en modo edición
Cuando ingreso más de 500 caracteres en el campo "Siguiente Paso" y presiono Enter
Entonces el backend rechaza la edición por exceso de longitud
Y la celda muestra un mensaje de validación en rojo
Y el campo no se guarda
```

### Escenario 4: Concurrencia - conflicto de edición
```gherkin
Dado que estoy editando un proyecto en una celda inline
Y el proyecto fue modificado por otro usuario en paralelo
Cuando presiono Enter para guardar mi cambio
Entonces el sistema detecta la versión anterior (conflict)
Y muestra un diálogo "Conflicto de versión: el proyecto fue modificado"
Y ofrece opciones: sobrescribir, descartar mi cambio, o recargar
```

### Escenario 5: Edición de múltiples campos
```gherkin
Dado que estoy en la vista de cartera y hago doble clic en una fila
Cuando edito "Siguiente Paso" y luego "Bloqueos" en secuencia
Y presiono Enter después de cada campo
Entonces cada cambio se guarda independientemente
Y se genera un audit log por cada edición
Y no se mezclan los payloads de los cambios
```
