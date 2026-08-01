# Tasks — EP-001 CRUD Proyectos

## Backend Tasks

### Database & Models

- [ ] Crear migration `002_create_projects_table.sql` con tabla `projects`
  - Columnas: id, nombre, responsable, estado, prioridad, fecha_límite, siguiente_paso, bloqueos, notas, tipo_proyecto, created_at, updated_at
  - Índices: (responsable), (estado)
  - Constraints: responsable NOT NULL, estado NOT NULL, tipo_proyecto NOT NULL

- [ ] Crear modelo `Project` en `backend/app/models.py` usando SQLAlchemy

### API Endpoints

- [ ] Implementar `POST /projects` con validación Pydantic
- [ ] Implementar `GET /projects` con soporte a filtros `?estado=...&responsable=...`
- [ ] Implementar `GET /projects/{id}` con manejo de 404
- [ ] Implementar `PUT /projects/{id}` con validación parcial (PATCH behavior)
- [ ] Implementar `DELETE /projects/{id}` con manejo de 404

### Testing (Backend)

- [ ] Test unitario: creación de proyecto con todos los campos (HU-001 escenario 1)
- [ ] Test unitario: actualización de estado y siguiente_paso (HU-001 escenario 2)
- [ ] Test unitario: validación — campo requerido faltante (HU-001 escenario 3)
- [ ] Test unitario: texto muy largo en notas (HU-001 escenario 4)
- [ ] Test unitario: caracteres especiales (HU-001 escenario 5)
- [ ] Test unitario: consultar proyecto existente (HU-002 escenario 1)
- [ ] Test unitario: consultar proyecto sin bloqueos (HU-002 escenario 2)
- [ ] Test unitario: proyecto no existe 404 (HU-002 escenario 3)
- [ ] Test unitario: proyecto con máxima longitud (HU-002 escenario 4)
- [ ] Test unitario: caracteres especiales en consulta (HU-002 escenario 5)
- [ ] Test de integración: POST → GET verificar persistencia
- [ ] Test de integración: PUT → GET verificar cambios

## Frontend Tasks

### Components

- [ ] Crear `frontend/src/components/ProjectForm.tsx` con 8 campos y validación cliente-lado
- [ ] Crear `frontend/src/components/ProjectList.tsx` con tabla, filtros y acciones
- [ ] Crear `frontend/src/components/ProjectDetail.tsx` con vista read-only
- [ ] Crear componentes reutilizables: Button, Input, Select, Modal, Table (si no existen)

### State Management

- [ ] Crear `frontend/src/stores/projectStore.ts` (Zustand) con:
  - `fetchProjects()` — GET /projects con manejo de filtros
  - `fetchProject(id)` — GET /projects/{id}
  - `createProject(data)` — POST /projects
  - `updateProject(id, data)` — PUT /projects/{id}
  - `deleteProject(id)` — DELETE /projects/{id}

### Pages/Views

- [ ] Crear página `ProjectsPage` que monte ProjectList
- [ ] Agregar modal para crear proyecto (dispara ProjectForm)
- [ ] Agregar modal para editar proyecto (dispara ProjectForm con initialData)
- [ ] Agregar modal para ver detalle (dispara ProjectDetail)
- [ ] Agregar confirmación modal para eliminar

### Navigation

- [ ] Agregar ruta `/projects` en router principal
- [ ] Agregar link en navegación principal (sidebar/nav)

### Testing (Frontend)

- [ ] Test React: ProjectForm crea proyecto con todos los campos (HU-001)
- [ ] Test React: ProjectForm valida campo requerido faltante (HU-001 escenario 3)
- [ ] Test React: ProjectDetail muestra todos los campos (HU-002 escenario 1)
- [ ] Test React: ProjectList muestra todos los proyectos (HU-003 escenario 1)
- [ ] Test React: ProjectList filtra por estado (HU-003 escenario 2)
- [ ] Test React: ProjectList filtra por responsable (HU-003 escenario 3)
- [ ] Test React: ProjectList muestra "sin resultados" cuando filtro es vacío (HU-003 escenario 4)
- [ ] Test React: ProjectList limpia filtro al hacer clic "Limpiar" (HU-003 escenario 5)

## E2E Tests

- [ ] Journey 1: Crear proyecto → ver en lista → ver detalle
- [ ] Journey 2: Editar proyecto → verificar cambios reflejados
- [ ] Journey 3: Filtrar por estado → verificar solo Activos muestran
- [ ] Journey 4: Crear con caracteres especiales → consultar → sin corrupción

## Documentation

- [ ] Actualizar diagrama de arquitectura (EP-001 agregado)
- [ ] Documentar enums (estado, prioridad, tipo_proyecto) en README

## Definition of Done Checklist

- [ ] Todos los tests pasan (unitarios, integración, E2E)
- [ ] Cero warnings en consola (frontend)
- [ ] Cero errores en logs (backend)
- [ ] Código formateado (black + prettier)
- [ ] Linter pasando (pylint, eslint)
- [ ] Spec coherencia: proposal ↔ design ↔ specs ↔ código ↔ tests
- [ ] AP contract validation: Newman o Postman collection contra endpoints
- [ ] Fidelity check: UI match contra design_source (si aplica)
- [ ] Security review: entrada validada, sin SQL injection, sin XSS
- [ ] Wiring adversarial: intenta refutar cada AC, verifica cableado end-to-end
