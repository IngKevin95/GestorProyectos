## Context

La Épica 3 (EP-003) se centra en proporcionar una vista de alto nivel ("Vista de Cartera") para el Delivery Lead, donde todos los proyectos se listen ordenados por un puntaje de prioridad (score). Este puntaje se calcula usando el motor polimórfico (ADR-007) que combina salud, urgencia, valor de negocio y (eventualmente, en EP-004) conteo de tareas críticas.

## Goals / Non-Goals

**Goals:**
- Proveer un endpoint de backend que retorne proyectos ordenados por score descendente.
- Añadir persistencia de configuración de estrategia en el modelo Project (`priority_strategy`, `priority_constant`, `business_value`).
- Construir el UI (React) del Dashboard de cartera con insignias (badges) de salud.

**Non-Goals:**
- No implementar el conteo real de tareas (esto pertenece a EP-004). El contador será un 0 estático por ahora.
- No incluir SSE/WebSockets para actualización en tiempo real en esta fase — el dashboard usa refetch manual tras cambios. SSE se diferirá a una épica posterior cuando la orquestación de suscripciones esté lista.
- No incluir filtros avanzados — esta fase cubre badges + score + ordenamiento. Filtros básicos se añadirán en EP-004.

## Decisions

1. **Cálculo de Score en Backend vs Frontend:**
   - **Decisión:** El score se calculará en tiempo de consulta en el Backend o en el Frontend de manera temporal si los datos de la lista son completos. Para simplificar, el cálculo polimórfico lo hará el Backend, y devolverá un campo temporal `score` o el Frontend lo calculará sobre la marcha.
   - **Elección:** Frontend calculará el score temporalmente para visualización (ya que los campos bajan en el JSON) o Backend calculará y añadirá el `score` al `ProjectResponse`. Añadiremos el cálculo en Backend (Python) según la regla de la historia para abstraer la lógica y dejar al cliente "tonto", simplemente mostrando y ordenando. (El requerimiento HU-008 implica orden automático, la base de datos o el backend Python pueden enviar la data ordenada).

2. **Esquema de Base de Datos para ADR-007:**
   - **Decisión:** Añadir tres columnas nuevas a `projects`:
     - `priority_strategy` (Enum/String): `'relative'` (default), `'absolute'`, `'mixed'`.
     - `priority_constant` (Numeric): Default `0.0`.
     - `business_value` (Numeric): Default `0.0`.
   - **Alternativa:** Tabla separada de configuración, pero la relación 1:1 es ineficiente y es preferible tenerlo directo en la tabla.

3. **Actualizaciones en Tiempo Real:**
   - **Decisión:** Por simplicidad inicial (fase 1), el dashboard usa refetch manual (botón o navegación) tras cambios CRUD. SSE queda para una épica posterior (EP-004+) cuando la lógica de suscripciones esté consolidada.

## Risks / Trade-offs

- **Risk:** Romper la API existente para las integraciones.
  - *Mitigation:* Asegurarnos de que los nuevos campos (`priority_strategy`, etc.) tengan valores predeterminados y no rompan esquemas de creación antiguos.
- **Risk:** Complejidad en ordenamiento por score.
  - *Mitigation:* Realizar el ordenamiento en memoria en el endpoint de listado (`GET /api/projects`), limitando los elementos si es necesario, en lugar de intentar ordenar por fórmulas SQL complejas que penalicen la base de datos.
