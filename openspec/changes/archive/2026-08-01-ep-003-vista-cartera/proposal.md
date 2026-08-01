## Why

El Delivery Lead necesita poder visualizar en un único lugar (Dashboard) el estado de la cartera completa de proyectos. Hasta ahora, hemos construido el CRUD de proyectos y el motor de detección de salud en el backend, pero falta la interfaz que consolide esta información. Esta épica es esencial porque traduce los datos de la base de datos (estado de salud, fechas límite) en una lista priorizada, permitiendo a los líderes saber instantáneamente qué proyecto requiere su atención urgente sin tener que revisar uno por uno.

## What Changes

- **Dashboard de Cartera**: Implementación de la vista principal en el frontend para mostrar proyectos en formato lista/tabla con insignias (badges) visuales del estado de salud.
- **Motor de Priorización**: Cálculo en tiempo real de un `score` (puntaje) que determina el orden en que se listan los proyectos, basado en salud, urgencia, valor y tareas críticas.
- **Configuración de Estrategia**: Modificación del CRUD de Proyectos para permitir definir la estrategia de priorización por proyecto (Relativa, Absoluta, Mixta). **BREAKING**: Requiere migrar la tabla `projects` para añadir nuevos campos: `priority_strategy`, `priority_constant`, y opcionalmente `business_value`.
- **Panel Explicativo**: Inclusión de un panel informativo en el frontend que expone de manera transparente la fórmula con la que se calcula el puntaje.

## Capabilities

### New Capabilities
- `portfolio-dashboard`: Vista en React con tabla de proyectos ordenados e insignias de estado de salud. Panel explicativo del criterio de priorización.
- `priority-scoring`: Endpoint de backend que procesa el motor polimórfico de score y expone el listado ordenado.

### Modified Capabilities
- `project-crud`: Se añade soporte para leer y actualizar la configuración de prioridad (`priority_strategy`, `priority_constant`, `business_value`) en el modelo del proyecto y sus esquemas de validación.

## Impact

- **Frontend**: Creación del Dashboard principal (`App.tsx` o nueva ruta principal). Integración de estilos (ADR TailwindCSS si aplica o Vanilla CSS).
- **Backend**: API de proyectos (`router/projects.py`) actualizará los endpoints de lectura para devolver la lista ordenada según el algoritmo. `ProjectCreate`/`ProjectUpdate` validarán los nuevos campos de estrategia.
- **Base de Datos**: Nueva migración de Alembic para añadir columnas de configuración de prioridad (`priority_strategy`, `priority_constant`, `business_value`) a la tabla `projects`.

## Trazabilidad

**Épica**: EP-003 — Vista de Cartera y Criterio de Priorización

**Historias de Usuario Cubiertas**:
- HU-007: Mostrar vista de cartera con badges de salud
- HU-008: Ordenar vista de cartera por score de priorización
- HU-009: Configurar estrategia de priorización por proyecto
