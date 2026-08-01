## ADDED Requirements

### Requirement: Dashboard con insignias de estado de salud
El sistema SHALL mostrar un listado de proyectos donde cada fila incluya de manera visible el estado de salud del proyecto (badge de health).

#### Scenario: Visualización del estado Bloqueado
- **WHEN** un proyecto tiene `health_status` igual a 'blocked'
- **THEN** la UI muestra un badge de color rojo con un ícono (ej. 🚫) y la etiqueta "Bloqueado".

#### Scenario: Visualización del estado En Riesgo
- **WHEN** un proyecto tiene `health_status` igual a 'at_risk'
- **THEN** la UI muestra un badge de color ámbar/naranja con un ícono (ej. ⚠️) y la etiqueta "En riesgo".

#### Scenario: Visualización del estado Sin Rumbo
- **WHEN** un proyecto tiene `health_status` igual a 'no_next_step'
- **THEN** la UI muestra un badge de color gris con un ícono (ej. ❓) y la etiqueta "Sin rumbo".

#### Scenario: Visualización del estado Ok
- **WHEN** un proyecto tiene `health_status` igual a 'ok'
- **THEN** la UI muestra un badge de color verde con un ícono (ej. ✅) y la etiqueta "Ok".

### Requirement: Panel explicativo del criterio de priorización
El sistema SHALL mostrar en el Dashboard de Cartera un panel o sección informativa que detalle los criterios por los cuales los proyectos están ordenados (fórmula de priorización).

#### Scenario: Explicación visible para el usuario
- **WHEN** el usuario accede al Dashboard
- **THEN** observa un panel que explica que la priorización se calcula mediante Salud, Urgencia, Valor de Negocio y Tareas Críticas, y tiene la opción de ver más detalles.
