# ADR 016: Reversión de SSE en favor de Carga Sobre Demanda (On-Demand Fetching)

**Status:** Accepted (Supersedes ADR 005)
**Date:** 2026-08-01

## Contexto y Problema
Al inicio del desarrollo, el documento **ADR 005** propuso el uso de Server-Sent Events (SSE) para mantener la lista de proyectos y sus estados actualizados en tiempo real en todos los clientes conectados. 
Al entrar a la fase de construcción y refinar el backlog utilizando la metodología MoSCoW, se identificó que la configuración estable del pipeline SSE a través del contenedor Docker, sumado a la reconexión en el frontend, consumiría tiempo valioso de la ventana de desarrollo (limitada por el MVP). 

## Alternativas Consideradas
1. **Mantener SSE (ADR 005):** Sacrificar calidad en el motor algorítmico de prioridad para tener tiempo de implementar la infraestructura realtime.
2. **WebSockets Bidireccionales:** Aún más complejo y demandante de configuración.
3. **Carga Reactiva sobre Demanda (On-Demand Fetching):** Aprovechar el manejador de estado `Zustand` en el frontend, cargando los datos al ingresar o refrescar vistas, y actualizando la UI de manera local tras ejecuciones exitosas contra la API.

## Decisión
Se decidió **cancelar la implementación de SSE (Anulando el ADR 005)** y delegar el control de los datos al patrón de "On-Demand Fetching" combinando llamadas REST puras y manejo de estado local reactivo.

## Justificación
- La promesa de valor de esta herramienta no es el chat o la co-edición estilo Google Docs, sino el **Cálculo Estratégico de Prioridades**. El tiempo ahorrado al no batallar con conexiones persistentes fue reinvertido en pulir el algoritmo de score, el diseño del dashboard y la consistencia del control de concurrencia (ver ADR 015).
- Para el volumen de datos de un MVP inicial, las peticiones GET tradicionales son suficientemente veloces.

## Consecuencias
- **Positivas:** Simplicidad radical de infraestructura. El servidor FastAPI se mantiene totalmente "Stateless", lo que facilita un eventual escalado horizontal sin necesitar proxies de pub/sub (ej. Redis).
- **Negativas:** Los clientes no ven instantáneamente si otro usuario cierra un proyecto. Deberán refrescar la tabla o navegar entre pestañas para que el estado se resincronice. Esto se asume como una deuda técnica válida para el contexto de un primer entregable.
