# ADR-011 — Transient Import State (Carga de CSV Asíncrona)

## Estado
**Aceptado** (2026-08-01)

## Contexto
Durante la carga de datos CSV (HU-012, HU-013, HU-014), el backend procesa múltiples registros de forma asíncrona vía BackgroundTasks. La UI necesita retroalimentación en tiempo real (progreso, errores parciales, éxito).

**Problema**: ¿Cómo mantener estado transiente (en progreso, fallos parciales) sin comprometer la BD principal?

## Decisión
Implementar un estado de carga **en memoria + log de eventos**, sin modificar BD hasta validación final:

1. **Estado en memoria** (dict con `import_id`):
   - `status`: "pending" | "processing" | "completed" | "failed"
   - `total_records`: int
   - `processed`: int
   - `failed`: int
   - `errors`: List[{row, message}]
   - `created_at`: timestamp

2. **Backend emite eventos vía SSE**:
   - Event: `import_progress` (cada N registros)
   - Event: `import_error` (errores acumulados)
   - Event: `import_complete` o `import_failed` (final)

3. **Rollback parcial**:
   - Filas válidas se insertan en BD inmediatamente
   - Filas inválidas se loguean pero NO se insertan
   - No hay transacción global (MVP: carga parcial aceptada)

## Alternativas Rechazadas
- **Transacción BD global**: bloquearía inserciones exitosas si hay 1 error; MVP requiere carga parcial.
- **Tabla temporal**: complejidad adicional; en memoria es suficiente para MVP de 24h.
- **WebSocket en lugar de SSE**: restricción arquitectónica (ADR-005 ordena SSE únicamente).

## Consecuencias

### Positivas
- Feedback en tiempo real sin latencia
- Carga parcial es admitida (robustez)
- Bajo costo de memoria (típicamente <1MB para Dataset Aztec)

### Negativas
- Estado transiente se pierde si backend reinicia
- No hay garantía de atomicidad global (usuario debe verificar totales al final)
- Requiere UI que maneje estados parciales

## Implementación
- **Backend**: dict en FastAPI app state, limpieza tras 1 hora de inactividad
- **Frontend**: suscripción SSE durante carga, cierre automático al recibir `import_complete`
- **Test**: mock de 500-registros con 10% de errores simulados

## Referencias
- HU-012, HU-013, HU-014: Carga de CSV
- ADR-005: SSE únicamente (no WebSockets)
- ADR-006: CSV async ingestion
