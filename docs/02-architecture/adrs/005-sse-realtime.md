# ADR 005: Sincronizaci�n Real-Time con SSE

**Status:** Accepted
**Date:** 2026-07-31

## Contexto y Problema
El frontend requiere actualización en tiempo real cuando otros usuarios modifican el estáado de proyectos o tareas, para evitar colisiones y mostrar la salud de la cartera al instante.

## Alternativas Consideradas
1. **WebSockets Puros**: Permiten comunicación bidireccional, pero son excesivos dado que el cliente solo necesita *recibir* notificaciones de cambio, no emitir flujos continuos de datos.
2. **Server-Sent Events (SSE)**: Unidireccional (Servidor -> Cliente), nativo sobre HTTP, ligero y con reconexión automática soportada por el navegador.
3. **Polling**: Fallback tradicional donde el cliente consulta cada X segundos.
4. **Webhooks**: Descartado por naturaleza (los navegadores no pueden exponer endpoints POST).

## Decisión
Se implementar� **SSE (Server-Sent Events)** para notificar cambios de estáado hacia el frontend, sin utilizar ning�n mecanismo de fallback autom�tico de arquitectura.

## Justificación
- SSE cubre perfectamente el caso de uso unidireccional y es nativo en el stack de FastAPI.
- Se implementar� de forma robusta aprovechando la reconexión automática nativa del API `EventSource` en el frontend.
- **Won't Do (Polling)**: Se rechaza expl�citamente construir un mecanismo de Polling como fallback debido a la limitante temporal del MVP (24 horas). Invertir tiempo en un fallback degrada la entrega de valor core.

## Consecuencias
- **Positivas**: Menor sobrecarga en el servidor comparado con WebSockets. Simplicidad de implementación.
- **Negativas**: Si la red del cliente bloquea conexiones HTTP persistentes, perder�n el real-time sin fallback autom�tico.
