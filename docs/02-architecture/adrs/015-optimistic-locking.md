# ADR 015: Control de Concurrencia mediante Bloqueo Optimista (Optimistic Locking)

**Status:** Accepted
**Date:** 2026-08-01

## Contexto y Problema
En la plataforma, el "Motor de Salud" y el "Score de Prioridad" de un proyecto se recalibran dinámicamente en función del estado de sus tareas (ej. al vencer una tarea, el proyecto puede pasar a "En Riesgo").
Dado que múltiples usuarios (miembros de equipo y administradores) pueden estar cerrando tareas o editando la descripción de un mismo proyecto simultáneamente, existía un alto riesgo de **condición de carrera (race condition)**. Si dos solicitudes concurrentes intentan actualizar el proyecto a la vez, la última en llegar sobreescribiría el cálculo de la primera, corrompiendo la integridad de la base de datos y la auditoría.

## Alternativas Consideradas
1. **Pessimistic Locking (Bloqueo Pesimista):** Bloquear la fila de la base de datos (usando `SELECT ... FOR UPDATE`) desde que un usuario abre el modal de edición hasta que lo guarda. Rechazado por generar cuellos de botella severos, bloqueos mortales (deadlocks) e impactar la escalabilidad web.
2. **Cola de Tareas Asíncrona (RabbitMQ/Celery):** Enviar todas las actualizaciones a una cola para que se procesen secuencialmente de a una por proyecto. Rechazado por ser sobre-ingeniería para un MVP inicial.
3. **Optimistic Locking (Bloqueo Optimista):** Añadir una columna de "versión" numérica a los registros. Cada actualización debe incluir la versión conocida por el cliente. Si la versión en la base de datos ha cambiado mientras tanto, se rechaza la transacción.

## Decisión
Se decidió implementar **Optimistic Locking** de forma nativa a nivel del ORM (SQLAlchemy) utilizando el atributo `version_id_col`. 
Los modelos principales (`Project` y `Task`) cuentan con un campo `version` que incrementa automáticamente en cada `UPDATE`.

## Justificación
- Es la estrategia más ligera, rápida y fácil de implementar para aplicaciones web con mucha lectura y colisiones de escritura poco frecuentes.
- Mantiene la plataforma responsiva al 100% sin depender de recursos externos o locks en la base de datos que penalicen a los usuarios concurrentes.
- El backend puede atrapar el error `StaleDataError` y retornar un HTTP 409 Conflict, indicando amigablemente al cliente que la información fue modificada por otro usuario.

## Consecuencias
- **Positivas:** Tolerancia absoluta a la concurrencia. La integridad del cálculo de salud y el Audit Trail está matemáticamente garantizada.
- **Negativas:** El frontend debe estar preparado para capturar ocasionalmente errores 409 y sugerir al usuario que recargue la página. Se incrementó ligeramente el peso del payload JSON (debe viajar el campo `version` siempre).
