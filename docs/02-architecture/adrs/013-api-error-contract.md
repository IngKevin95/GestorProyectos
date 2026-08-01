# ADR-013 — API Error Contract (Contrato de Errores)

## Estado
**Aceptado** (2026-08-01)

## Contexto
La API FastAPI retorna errores HTTP en múltiples escenarios (validación, no encontrado, servidor, timeout). Frontend necesita un contrato claro para:
- Mostrar mensajes amigables al usuario
- Reintentar automáticamente en casos transientes
- Loguear para debugging

## Decisión
Implementar un **contrato de errores JSON normalizado** con dos niveles:

### 1. Errores del Negocio (400 Bad Request, 409 Conflict, 422 Unprocessable Entity)

```json
{
  "error": {
    "code": "PROJECT_NOT_FOUND",
    "message": "El proyecto #123 no existe en la base de datos",
    "status": 404,
    "details": {
      "project_id": 123,
      "timestamp": "2026-08-01T14:30:00Z"
    }
  }
}
```

**Códigos de Negocio Comunes**:
- `VALIDATION_ERROR`: uno o más campos inválidos (400)
- `PROJECT_NOT_FOUND`: proyecto inexistente (404)
- `TASK_NOT_FOUND`: tarea inexistente (404)
- `UNAUTHORIZED`: sin permisos (403)
- `CONFLICT`: versión outdated o estado incompatible (409)
- `CSV_INVALID_FORMAT`: CSV malformado (422)
- `CSV_PARTIAL_IMPORT`: carga parcial con errores registrados (207 Multi-Status)

### 2. Errores de Sistema (500 Internal Server Error, 503 Service Unavailable)

```json
{
  "error": {
    "code": "INTERNAL_SERVER_ERROR",
    "message": "Error interno del servidor; por favor intente más tarde",
    "status": 500,
    "request_id": "req-abc123",
    "timestamp": "2026-08-01T14:30:00Z"
  }
}
```

**Códigos de Sistema**:
- `INTERNAL_SERVER_ERROR` (500): unhandled exception
- `DATABASE_CONNECTION_ERROR` (503): BD inaccesible
- `TIMEOUT` (504): request tardó >30s
- (NO detalles técnicos en `message` para errores 500)

### 3. Reglas de Retorno

| Caso | HTTP | Reintentable | Acción Frontend |
|------|------|--------------|-----------------|
| Validación falla | 422 | No | Mostrar errores en UI |
| No existe | 404 | No | Mostrar empty state |
| Conflicto (edit race) | 409 | Sí (manual) | Mostrar "outdated"; ofrecer reload |
| BD inaccesible | 503 | Sí (auto) | Retry exponencial; mostrar spinner |
| Timeout | 504 | Sí (auto) | Retry exponencial; notificar |
| Excepción no manejada | 500 | No | Logging; mostrar "error inesperado" |

## Alternativas Rechazadas
- **Códigos HTTP solo**: insuficiente para distinguir casos de negocio (ej: 404 ≠ 409)
- **Esquema anidado profundo**: complejidad; JSON plano es suficiente para MVP
- **Diferentes formatos por endpoint**: incoherencia; un contrato unificado es mejor

## Consecuencias

### Positivas
- Frontend puede implementar reintentos automáticos (507 vs 422)
- UX mejorada con mensajes específicos por tipo de error
- Traceabilidad: `request_id` en logs
- Fácil de documentar en OpenAPI

### Negativas
- Requiere diligencia en backend (todos los endpoints respetan contrato)
- Migraciones futuras de códigos pueden afectar clientes antiguos

## Implementación
- **Fastapi Exception Handler**: mapea excepciones a error contract
- **Pydantic models** para validación de esquema
- **OpenAPI**: documenta códigos esperados por endpoint
- **Test**: casos de cada tipo de error

## Referencias
- ADR-001: FastAPI backend
- Tech PRD §2: Datos Sensibles y Secretos (incluye logging de request_id)
- HU-* (todas): Componentes que interactúan con API
