# ADR 010: Despliegue e Infraestáructura MVP (Docker Compose)

**Status:** Accepted
**Date:** 2026-07-31

## Contexto y Problema
Se requiere definir la estárategia de empaquetado y despliegue para asegurar que la aplicación (Frontend React, Backend FastAPI, PostgreSQL) pueda levantarse de manera repetible, rápida y en cualquier entorno, respetando la limitante de un MVP (24 horas).

## Alternativas Consideradas
1. **Kubernetes (K8s)**: Orquestáaci�n empresarial. Excesivo (sobreingenier�a) para un MVP que solo requiere tres contenedores básicos.
2. **Serverless / PaaS Puros (Vercel + Heroku)**: R�pidos, pero pueden complicar el despliegue de PostgreSQL con Triggers personalizados o a�adir latencia impredecible por *cold starts* en la capa gratuita.
3. **Docker + Docker Compose (Single Node)**: Contenedorizaci�n está�ndar. Permite levantar todo el stack (`docker-compose up`) localmente y en un �nico servidor VPS de producci�n.

## Decisión
Se selecciona **Docker Compose** en un esquema "Single Node" para la infraestáructura y el despliegue del MVP.

## Justificación
- **Velocidad y Repetibilidad**: Un �nico archivo `docker-compose.yml` encapsula las variables de entorno, redes internas (Backend <-> DB) y vol�menes, garantizando paridad entre desarrollo y producci�n.
- **Simplicidad**: Se alinea con el principio de mantener la arquitectura del MVP en el límite temporal de 24 horas, evitando la complejidad cognitiva de herramientas de orquestáaci�n distribuida.

## Consecuencias
- **Positivas**: *Onboarding* instant�neo de desarrolladores. Despliegue en producci�n trivial (basta un clon del repo y un comando en una VPS).
- **Negativas**: Ausencia de Alta Disponibilidad (HA) nativa. Si el �nico nodo cae, el sistema queda offline. Aceptable como *trade-off* temporal para un MVP.
