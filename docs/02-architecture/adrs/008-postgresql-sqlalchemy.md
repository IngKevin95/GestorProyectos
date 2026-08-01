# ADR 008: Persistencia y ORM (PostgreSQL + SQLAlchemy Async)

**Status:** Accepted
**Date:** 2026-07-31

## Contexto y Problema
El sistema requiere una base de datos relacional para gestáionar Entidades (Proyectos, Tareas, Usuarios) y reglas estárictas de integridad. El backend (FastAPI) necesita una capa de abstracci�n para interactuar con los datos sin bloquear el *event loop* asíncrono.

## Alternativas Consideradas
1. **SQLite**: Excelente para MVP, pero carece de soporte robusto para concurrencia y triggers avanzados complejos en un entorno web asíncrono.
2. **MongoDB**: No-SQL, inadecuado para la naturaleza altamente relacional y de integridad referencial del Gestor de Proyectos.
3. **PostgreSQL + SQLAlchemy 2.0 (Async) + Alembic**: Stack relacional maduro. Postgres soporta Triggers/Eventos nativos (cruciales para el Motor de Salud). SQLAlchemy 2.0 ofrece APIs as�ncronas nativas.

## Decisión
Se selecciona **PostgreSQL** como motor de base de datos, y **SQLAlchemy 2.0 (Async)** junto con **Alembic** para el mapeo objeto-relacional y migraciones.

## Justificación
- **PostgreSQL**: Sus triggers y constraints garantizan que la lógica persistente del Motor de Riesgo (ADR 003) se ejecute a nivel motor, asegurando consistencia absoluta.
- **SQLAlchemy 2.0**: Al ser compatible con `asyncpg`, explota la capacidad concurrente de FastAPI.
- **Alembic**: Estandariza la evoluci�n del esquema (migraciones) para el equipo.

## Consecuencias
- **Positivas**: Integridad de datos blindada. Rendimiento �ptimo en I/O asíncrono.
- **Negativas**: Curva de aprendizaje y configuraci�n inicial de sesiones as�ncronas de SQLAlchemy (control de concurrencia y detached instances) es más alta que usar un ORM sincr�nico tradicional.
