---
epica: EP-009
titulo: Flujo de Navegación — Integraciones (Webhooks)
historias: [HU-021]
fecha: 2026-08-01
---

# EP-009 — Integraciones (Webhooks)

## Trazabilidad

**Épica**: EP-009 — Integraciones (Webhooks)  
**Historias cubiertas**: HU-021 (Integración de Webhooks básicos)  
**Descripción**: Configuración y disparo de webhooks hacia sistemas externos. Reintentos automáticos y logging de eventos.

## Flujo: Configuración de Webhook

```mermaid
flowchart TD
  A["Admin abre<br/>Webhook Config"] --> B["Define evento<br/>disparador"]
  B --> C["Ingresa endpoint<br/>URL"]
  C --> D["Ingresa<br/>auth token"]
  D --> E["Presiona<br/>Guardar"]
  E --> F["API valida URL"]
  F --> G{"¿Válida?"}
  G -->|No| H["Muestra error"]
  H --> C
  G -->|Sí| I["Almacena config<br/>en DB"]
  I --> J["Webhook<br/>activo"]
```

## Flujo: Disparo de Evento

```mermaid
flowchart TD
  A["Evento:<br/>proyecto actualizado"] --> B["Sistema evalúa<br/>webhooks activos"]
  B --> C["¿Hay match<br/>disparador?"]
  C -->|No| D["Fin"]
  C -->|Sí| E["Construye<br/>payload JSON"]
  E --> F["Incluye:<br/>evento, timestamp,<br/>datos proyecto"]
  F --> G["POST a<br/>endpoint"]
  G --> H["Intenta 3 veces<br/>con retry"]
  H --> I{"¿Éxito?"}
  I -->|Sí| J["Registra en log"]
  I -->|No| K["Registra error<br/>después de 3 intentos"]
  J --> L["Fin"]
  K --> L
```

## Flujo: Testing de Webhook

```mermaid
flowchart TD
  A["Admin selecciona<br/>webhook"] --> B["Presiona<br/>Test"]
  B --> C["Envía payload<br/>de prueba"]
  C --> D["Espera respuesta<br/>del endpoint"]
  D --> E{"¿Respuesta<br/>2xx?"}
  E -->|Sí| F["Muestra: OK"]
  E -->|No| G["Muestra error<br/>+ status code"]
  F --> H["Webhook<br/>listo"]
  G --> H
```
