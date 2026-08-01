# ADR 001: Uso de FastAPI para el Backend

**Status:** Accepted
**Date:** 2024-10-25

## Contexto y Problema
El Gestor de Proyectos requiere un backend para servir la API, aplicar lógica de negocio (cálculo de riesgo/salud) e integrarse con PostgreSQL. Se necesita un framework que facilite desarrollo rápido, posea buen tipado y soporte asincronía.

## Alternativas Consideradas
- Node.js (Express / NestJS)
- Python (Django / FastAPI)
- Go (Fiber)

## Decisión
Se selecciona **FastAPI** (Python).

## Justificación
1. **Tipado Estricto con Pydantic**: Autovalidación de payloads desde y hacia el cliente, eliminando errores de forma.
2. **Asincronía nativa**: Preparado para WebSockets o I/O concurrente usando `async/await`.
3. **Autodocumentación**: Genera Swagger UI/OpenAPI out of the box, facilitando la integración con el frontend.
4. **Velocidad de MVP**: Menos boilerplate que Django, más estructurado que Express básico.

## Consecuencias
- **Positivas**: Desarrollo acelerado de API REST robustas. Tipado seguro reduce bugs en runtime.
- **Negativas**: El ecosistema asíncrono en Python con ORMs (como SQLAlchemy asíncrono) puede ser ligeramente más complejo de configurar al inicio frente a Node.js.
