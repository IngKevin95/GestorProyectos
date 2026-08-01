---
epica: EP-006
titulo: Flujo de Navegación — Administración y Seguridad (JWT)
historias: [HU-015, HU-016]
fecha: 2026-08-01
---

# EP-006 — Administración y Seguridad (JWT)

## Trazabilidad

**Épica**: EP-006 — Administración y Seguridad (JWT)  
**Historias cubiertas**: HU-015 (Inicio de sesión seguro), HU-016 (Gestión de usuarios y roles)  
**Descripción**: Flujos de autenticación con JWT y gestión de roles. Cubre login, validación de tokens y asignación de permisos.

## Flujo: Autenticación y Acceso

```mermaid
flowchart TD
  A["Usuario accede<br/>al sitio"] --> B{"¿Autenticado?"}
  B -->|No| C["Redirige a<br/>Login"]
  C --> D["Ingresa<br/>credenciales"]
  D --> E["API valida<br/>contra DB"]
  E --> F{"¿Válidas?"}
  F -->|No| G["Muestra<br/>error"]
  G --> D
  F -->|Sí| H["API emite<br/>JWT"]
  H --> I["Cliente almacena<br/>JWT"]
  I --> J["Redirige a<br/>Dashboard"]
  B -->|Sí| J
  J --> K["Requiere JWT<br/>en headers"]
  K --> L{"¿JWT<br/>válido?"}
  L -->|No| M["Redirige a<br/>Login"]
  L -->|Sí| N["Acceso a<br/>funcionalidades"]
```

## Flujo: Gestión de Roles

```mermaid
flowchart TD
  A["Admin abre<br/>AdminPage"] --> B["Carga<br/>usuarios"]
  B --> C["Lista roles<br/>asignados"]
  C --> D{"¿Cambiar<br/>rol?"}
  D -->|Sí| E["Selecciona<br/>nuevo rol"]
  E --> F["API actualiza<br/>DB"]
  F --> G["Usuario recibe<br/>nuevo JWT"]
  G --> H["Acceso<br/>actualizado"]
  D -->|No| I["Visualiza<br/>solo"]
```
