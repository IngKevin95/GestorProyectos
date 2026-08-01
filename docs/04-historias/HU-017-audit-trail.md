---
id: HU-017
titulo: Ver historial de cambios (Audit Trail)
epica: EP-007
prioridad: Should
complejidad: M
estado: borrador
---

# HU-017 — Ver historial de cambios (Audit Trail)

**Como** Auditor o Delivery Lead,
**quiero** ver un registro de todos los cambios realizados sobre un proyecto o sus tareas,
**para** tener trazabilidad y entender la evolución del estado.

## Fuente
Frontend Spec (`AuditTrail`).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓ — Puede implementarse aislando la tabla de auditoría.
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Consultar auditoría de proyecto
```gherkin
Dado que estoy en el detalle de un proyecto
Cuando selecciono la pestaña "Auditoría"
Entonces veo una lista cronológica de eventos (CREATE, UPDATE, DELETE)
Y cada evento muestra quién lo hizo, cuándo, y los valores previos/nuevos
```

### Escenario 2: Falla al cargar historial de auditoría
```gherkin
Dado que el backend no responde al pedir el historial
Cuando selecciono la pestaña "Auditoría"
Entonces el sistema muestra un mensaje amigable indicando que no se pudo cargar el historial
Y ofrece un botón para reintentar
```

### Escenario 3: Filtrado de auditoría por tipo de evento
```gherkin
Dado que existen múltiples eventos de auditoría (CREATE, UPDATE, DELETE) en el historial
Cuando aplico un filtro por tipo "UPDATE"
Entonces veo solo los eventos de actualización
Y el contador muestra cuántos eventos de ese tipo existen
```

### Escenario 4: Paginación del historial
```gherkin
Dado que un proyecto tiene más de 100 eventos de auditoría
Cuando veo el historial
Entonces los eventos se paginan (ej: 20 por página)
Y puedo navegar entre páginas
Y cada página mantiene el filtro aplicado (si lo hay)
```

### Escenario 5: Auditoría vacía
```gherkin
Dado que un proyecto fue creado pero nunca editado
Cuando selecciono la pestaña "Auditoría"
Entonces veo un empty state indicando "Sin cambios registrados"
Y solo se muestra el evento de creación con usuario y fecha
```
