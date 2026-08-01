## Why

Sin datos estructurados y editables de proyectos, no hay base para el motor de salud (EP-002) ni para priorización (EP-003). CRUD de proyectos es el cimiento operativo del sistema — sin él, no hay proyectos que clasificar ni campos que el usuario pueda mantener vivos. EP-001 es el prerequisito duro de las épicas de negocio.

## What Changes

- **Nuevo**: Modelo `Project` en SQLAlchemy con campos: id, nombre, responsable, estado, prioridad, fecha_límite, siguiente_paso, bloqueos, notas, tipo_proyecto, created_at, updated_at.
- **Nuevo**: Tabla `projects` en PostgreSQL con 8 campos editables y 2 timestamps (auditoría mínima).
- **Nuevo**: Endpoints REST (FastAPI):
  - `POST /projects` — crear proyecto con validación de campos requeridos.
  - `GET /projects/{id}` — consultar un proyecto.
  - `GET /projects` — listar proyectos con soporte a filtros (estado, responsable).
  - `PUT /projects/{id}` — actualizar proyecto.
  - `DELETE /projects/{id}` — eliminar proyecto (por completitud CRUD, aunque HU-020 lo refine).
- **Nuevo**: Componentes React:
  - `ProjectForm` — formulario para crear/editar proyecto con validación de campos requeridos.
  - `ProjectDetail` — vista de detalle de un proyecto.
  - `ProjectList` — tabla de proyectos con filtros por estado y responsable, operaciones inline (ver, editar, eliminar).
- **Nuevo**: Estado global Zustand para `projects` con acciones CRUD.
- **Modificado**: Schema inicial de PostgreSQL (agregar tabla projects con índices en responsable, estado).

## Capabilities

### New Capabilities
- `project-crud-api`: Endpoints REST para crear, leer, actualizar, eliminar proyectos con validación de integridad.
- `project-form-ui`: Formulario interactivo para crear y editar proyectos con 8 campos, validación cliente-lado y feedback de error.
- `project-list-ui`: Tabla de proyectos con filtros por estado y responsable, columnas de nombre/responsable/estado/fecha_límite, acciones inline.
- `project-detail-view`: Vista de detalle de un proyecto mostrando todos los 7 campos editables y los 2 timestamps.

### Modified Capabilities
<!-- No existen capabilities de proyectos previas en el sistema; es greenfield. -->

## Impact

- **Código afectado**: 
  - Backend: `backend/app/models.py` (modelo Project), `backend/app/routers/projects.py` (endpoints CRUD)
  - Migrations: `backend/db/migrations/002_create_projects_table.sql` (tabla)
  - Frontend: `frontend/src/components/ProjectForm.tsx`, `frontend/src/components/ProjectList.tsx`, `frontend/src/components/ProjectDetail.tsx`
  - State: `frontend/src/stores/projectStore.ts` (Zustand)
- **APIs**: 5 nuevos endpoints REST (`POST /projects`, `GET /projects`, `GET /projects/{id}`, `PUT /projects/{id}`, `DELETE /projects/{id}`).
- **Dependencias**: ninguna nueva (SQLAlchemy, Pydantic, React Query ya presentes en scaffold).
- **Integración**: EP-002 (motor de salud) y EP-003 (cartera) dependen de estos endpoints para obtener datos de proyectos.
- **BD**: Tabla `projects` con índices en `responsable` y `estado` para filtrado eficiente.

## Trazabilidad

- **Épica**: EP-001
- **Historias de Usuario**: HU-001 (crear/actualizar), HU-002 (consultar), HU-003 (listar con filtros)
- **Alineación PRD**: §5 Objetivos — "crear/actualizar proyectos con sus campos operativos clave"; §6 Must — "CRUD de proyectos"; §3 Historia de usuario — "Como Delivery Lead, quiero crear y actualizar proyectos..."
