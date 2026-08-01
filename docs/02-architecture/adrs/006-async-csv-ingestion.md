# ADR 006: Ingestáa As�ncrona de CSV con BackgroundTasks

**Status:** Accepted
**Date:** 2026-07-31

## Contexto y Problema
La carga de archivos CSV (Proyectos y Tareas) incluye validaciones, limpieza agn�stica previa y potenciales notificaciones. Procesarlo de forma s�ncrona en el endpoint bloquea la API y da�a la experiencia de usuario (UX).

## Alternativas Consideradas
1. **Endpoint S�ncrono**: R�pido de programar, pero propenso a timeouts HTTP si el CSV es grande o las validaciones son costosas.
2. **Celery + Redis / RabbitMQ**: Arquitectura as�ncrona está�ndar en la industria. Robusta y escalable.
3. **FastAPI BackgroundTasks**: Ejecuci�n as�ncrona ligera en la misma memoria del proceso FastAPI.

## Decisión
Se utilizar� **FastAPI BackgroundTasks** para procesar la ingestáa, limpieza y validaci�n de los CSV. El frontend recibir� el reporte de progreso v�a **SSE**.

## Justificación
- La UX requerida demanda carga as�ncrona y notificaci�n en tiempo real de los registros sanos/malos.
- **Won't Do (Celery)**: Se descarta expl�citamente el uso de Celery. Implementar y orquestáar infraestáructura extra (Redis/RabbitMQ + Workers) rompe tajantemente la limitaci�n temporal de construcción del MVP (24 horas). BackgroundTasks ofrece la misma UX sin penalizaci�n de infraestáructura.

## Consecuencias
- **Positivas**: UX fluida, endpoints HTTP rápidos, cero dependencias de infraestáructura extra (Docker compose se mantiene simple).
- **Negativas**: Si el pod de FastAPI crashea, se pierde la tarea en background. Aceptable para el MVP y el volumen de datos (20 proyectos).
