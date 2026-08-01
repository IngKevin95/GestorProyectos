---
epica: EP-008
titulo: Flujo de Navegación — Vista de Equipo (Team Capacity)
historias: [HU-018]
fecha: 2026-08-01
---

# EP-008 — Vista de Equipo (Team Capacity)

## Trazabilidad

**Épica**: EP-008 — Vista de Equipo (Team Capacity)  
**Historias cubiertas**: HU-018 (Ver capacidad de carga del equipo)  
**Descripción**: Dashboard de carga de trabajo por miembro. Identifica cuellos de botella y disponibilidad.

## Flujo: Visualización de Carga

```mermaid
flowchart TD
  A["Usuario abre<br/>TeamCapacityPage"] --> B["API carga<br/>team"]
  B --> C["Calcula tareas<br/>por miembro"]
  C --> D["Agrupa por<br/>estado"]
  D --> E["Computa:<br/>abietas, en progreso,<br/>completadas"]
  E --> F["Visualiza tabla<br/>de equipo"]
  F --> G{"¿Filtrar<br/>por estado?"}
  G -->|Sí| H["Aplica filtro"]
  H --> I["Muestra<br/>subtotales"]
  G -->|No| I
```

## Flujo: Identificación de Cuellos de Botella

```mermaid
flowchart TD
  A["Sistema lee<br/>asignaciones"] --> B["Calcula carga<br/>por miembro"]
  B --> C["Detecta:<br/>tareas abiertas<br/>por persona"]
  C --> D{"¿Carga > umbral?"}
  D -->|Sí| E["Marca en rojo<br/>cuello de botella"]
  E --> F["Sugiere<br/>reasignación"]
  D -->|No| G["Verde:<br/>carga normal"]
  F --> H["UI muestra<br/>recomendaciones"]
  G --> H
```
