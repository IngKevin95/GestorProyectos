---
id: HU-002
titulo: Consultar proyecto con todos sus campos
epica: EP-001
prioridad: Must
complejidad: S
estado: lista
---

# HU-002 — Consultar proyecto con todos sus campos

**Como** Delivery Lead,
**quiero** consultar un proyecto existente y ver todos sus campos (responsable, estado, prioridad, fecha límite, siguiente paso, bloqueos, notas),
**para** revisar el estado actual sin necesidad de editarlo.

## Fuente

PRD `docs/01-prd/gestor-proyectos-aztec.md` Sección 6 (Must: CRUD de proyectos incluye lectura).

## Chequeo INVEST (parcial)

- **Verificable**: ✓ — La lectura es objetivamente verificable: datos visibles = datos guardados.
- **Pequeña**: ✓ — Aislada de actualización y creación, scope claro.
- **con Test claro**: ✓ — Crear proyecto, consultarlo, verificar que los 7 campos se leen correctamente.
- **Valiosa**: ✓
- **Independiente**: ✓ — Aprobado.
- **Negociable**: ✓ — Aprobado.
- **Estimable**: ✓ — Aprobado.

## Criterios de Aceptación

### Escenario 1: Consultar proyecto existente (flujo feliz)
```gherkin
Dado que existe un proyecto con responsable="Alice", estado="Activo", prioridad="Alta"
Cuando hago clic en el proyecto para verlo
Entonces veo una pantalla de detalle que muestra:
  - responsable: Alice
  - estado: Activo
  - prioridad: Alta
  - fecha_límite, siguiente_paso, bloqueos, notas (todos visibles)
```

### Escenario 2: Consultar proyecto sin bloqueos (campo vacío)
```gherkin
Dado que existe un proyecto con bloqueos vacío
Cuando consulto el proyecto
Entonces el campo "bloqueos" aparece vacío (sin valor) sin errores
```

### Escenario 3: Fallo - proyecto no existe
```gherkin
Dado que intento acceder a un proyecto con ID inexistente
Cuando intento verlo
Entonces aparece un mensaje de error "Proyecto no encontrado"
```

### Escenario 4: Borde - todos los campos llenos con máxima longitud
```gherkin
Dado que existe un proyecto con valores máximos en cada campo
Cuando consulto el proyecto
Entonces todos los campos se muestran completos sin truncamiento
```

### Escenario 5: Borde - proyecto con caracteres especiales
```gherkin
Dado que existe un proyecto con nombre "Proyecto Ñoño & Cía. (USA)" 
     y notas con símbolos € / @ % 
Cuando consulto el proyecto
Entonces todos los caracteres especiales aparecen correctamente sin corrupción
```
