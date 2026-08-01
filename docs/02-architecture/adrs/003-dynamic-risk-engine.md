# ADR 003: Persistencia de Motor de Riesgo y Contadores

**Status:** Accepted
**Date:** 2024-10-25

## Contexto y Problema
El sistema debe calcular si un proyecto está� "En riesgo", "Bloqueado" o "Sin rumbo" basado en reglas (tareas vencidas, bloqueos definidos, siguiente paso vac�o) y mantener contadores de tareas. Surge la duda de d�nde alojar estáa lógica y almacenamiento: �cálculo on-the-fly en la API o persistido en base de datos?

## Alternativas Consideradas
1. **C�lculo din�mico en la capa API (FastAPI)**: Calcula el score on-the-fly al realizar peticiones GET. Puede causar N+1 queries.
2. **Persistente en BD (Triggers/Eventos)**: Guardar y actualizar los campos (`health`, `open_tasks`, `overdue_tasks`) en la Base de Datos mediante eventos de aplicación o triggers para cambios de estáado/tareas, sumado a un Cron Job diario que eval�a el factor temporal (fechas límite) v�a SQL.

## Decisión
Se selecciona **Persistencia en Base de Datos (Eventos/Triggers)**.

## Justificación
1. **Rendimiento de Lectura**: Almacenar los datos de forma desnormalizada optimiza las lecturas masivas en listados y dashboards, evitando problemas de N+1 queries en SQLAlchemy.
2. **Coherencia con Flujos**: Los E2E flows (EP-002, EP-005) ya estáipulan la actualización y guardado de contadores en disco.
3. **Escalabilidad**: Preparado para consultas anal�ticas directas en SQL sin tener que reconstruir la lógica de salud.

## Consecuencias
- **Positivas**: Lecturas extremadamente rápidas, queries de base de datos más simples, alineaci�n con requerimientos E2E.
- **Negativas**: Mayor complejidad en operaciones de escritura. Todo cambio de tarea o proyecto debe despachar eventos para actualizar contadores/salud para evitar stale data. Jerarqu�a de estáados: Bloqueado predomina sobre En Riesgo (si cumple ambos, estáado es Bloqueado con anotaci�n de riesgo).
