---
epica: EP-007
titulo: Flujo de Navegación — Trazabilidad y Configuración
historias: [HU-017, HU-019]
fecha: 2026-08-01
---

# EP-007 — Trazabilidad y Configuración

## Trazabilidad

**Épica**: EP-007 — Trazabilidad y Configuración  
**Historias cubiertas**: HU-017 (Ver historial de cambios), HU-019 (Gestión de plantillas)  
**Descripción**: Audit Trail para rastrear cambios en proyectos. CRUD de plantillas de proyectos.

## Flujo: Auditoría de Cambios

```mermaid
flowchart TD
  A["Usuario abre<br/>Detalle Proyecto"] --> B["Edita<br/>campo"]
  B --> C["Presiona<br/>Guardar"]
  C --> D["API valida<br/>cambios"]
  D --> E{"¿Válido?"}
  E -->|No| F["Muestra<br/>error"]
  F --> B
  E -->|Sí| G["Actualiza<br/>DB"]
  G --> H["Crea Audit<br/>Log entry"]
  H --> I["Registra:<br/>usuario, timestamp,<br/>campo, valor anterior,<br/>valor nuevo"]
  I --> J["Retorna<br/>confirmación"]
```

## Flujo: Consulta de Audit Trail

```mermaid
flowchart TD
  A["Usuario abre<br/>Audit Trail"] --> B["Filtra por<br/>proyecto"]
  B --> C["API consulta<br/>Log entries"]
  C --> D["Ordena por<br/>timestamp DESC"]
  D --> E["Muestra histórico<br/>de cambios"]
  E --> F{"¿Descargar<br/>CSV?"}
  F -->|Sí| G["Genera CSV<br/>con entrada"]
  G --> H["Descarga"]
  F -->|No| I["Solo visualiza"]
```

## Flujo: Gestión de Plantillas

```mermaid
flowchart TD
  A["Admin accede<br/>TemplatesPage"] --> B["CRUD<br/>Plantillas"]
  B --> C{"¿Acción?"}
  C -->|Crear| D["Nueva plantilla"]
  C -->|Editar| E["Actualiza"]
  C -->|Eliminar| F["Borra template"]
  D --> G["Almacena en DB"]
  E --> G
  F --> G
  G --> H["Disponible para<br/>nuevos proyectos"]
```
