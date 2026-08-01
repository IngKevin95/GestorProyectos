# Design — EP-001 CRUD Proyectos

## Arquitectura

### Backend (FastAPI + SQLAlchemy)

1. **Modelo Project**:
   ```python
   class Project(Base):
       id: int = Column(Integer, primary_key=True)
       nombre: str = Column(String(255), nullable=False)
       responsable: str = Column(String(100), nullable=False, index=True)
       estado: str = Column(String(50), nullable=False, index=True)  # Activo, En Pausa, Cancelado, etc.
       prioridad: str = Column(String(50), nullable=False)  # Alta, Media, Baja
       fecha_límite: datetime = Column(DateTime, nullable=True)
       siguiente_paso: str = Column(String(255), nullable=True)
       bloqueos: str = Column(Text, nullable=True)
       notas: str = Column(Text, nullable=True)
       tipo_proyecto: str = Column(String(50), nullable=False)  # Mantenimiento, Recurrente, Diagnóstico, Proyecto
       created_at: datetime = Column(DateTime, default=datetime.utcnow, nullable=False)
       updated_at: datetime = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
   ```

2. **Endpoints**:
   - `POST /projects` — crear proyecto (validar `responsable`, `estado`, `tipo_proyecto` enum)
   - `GET /projects?estado=...&responsable=...` — listar con filtros
   - `GET /projects/{id}` — obtener detalle
   - `PUT /projects/{id}` — actualizar
   - `DELETE /projects/{id}` — eliminar

3. **Validación**:
   - `responsable` requerido (nunca vacío)
   - `estado` debe estar en enum: {Activo, En Pausa, Cancelado, Completado}
   - `prioridad` debe estar en enum: {Alta, Media, Baja}
   - `tipo_proyecto` debe estar en enum: {Mantenimiento, Recurrente, Diagnóstico, Proyecto}
   - `fecha_límite` es opcional pero si existe debe ser >= hoy (en lado cliente; en servidor solo validar formato)

### Frontend (React 18 + Zustand + TailwindCSS)

1. **State (Zustand)**:
   ```typescript
   interface ProjectStore {
     projects: Project[]
     currentProject: Project | null
     filters: { estado?: string; responsable?: string }
     fetchProjects: () => Promise<void>
     fetchProject: (id: number) => Promise<void>
     createProject: (data: ProjectInput) => Promise<void>
     updateProject: (id: number, data: ProjectInput) => Promise<void>
     deleteProject: (id: number) => Promise<void>
     setFilters: (filters: Filters) => void
   }
   ```

2. **Components**:
   - `ProjectList` — tabla con columnas: nombre, responsable, estado, fecha_límite, acciones (ver, editar, eliminar)
   - `ProjectForm` — formulario con 8 campos input, validación cliente-lado, botón Guardar/Cancelar
   - `ProjectDetail` — vista read-only de un proyecto (usado en modal o página de detalle)

3. **Estilos**:
   - TailwindCSS para toda la UI
   - Componentes reutilizables: Button, Input, Select, Modal, Table
   - Respuesta en mobile (tabla scrolleable si es necesario)

### Base de Datos

- Tabla `projects` con índices en `responsable` y `estado` para filtrado eficiente
- Constraints: `responsable` NOT NULL, `estado` NOT NULL, `tipo_proyecto` NOT NULL
- Seedeo (EP-005) llevará datos de ejemplo

## Decisiones Clave

1. **Sin soft-delete**: campos `deleted_at` no incluidos en MVP. Confirmado en HU-020 (eliminar proyecto) que es posterior.
2. **Timestamps automáticos**: `created_at` y `updated_at` gestionados por la BD para auditoria mínima.
3. **Filtros simples**: solo `estado` y `responsable` en EP-001. Filtro por salud se agrega en EP-003.
4. **Tipo de proyecto enum**: requerido para clasificación operativa; valores definidos en specs.
5. **UI inline**: operaciones CRUD (editar, eliminar) disponibles en filas de tabla sin navegar a páginas separadas.

## Testing

- Tests unitarios: modelos, validaciones Pydantic, funciones de cálculo (si aplica)
- Tests de integración: endpoints CRUD contra BD de test
- E2E: crear → consultar → listar → editar → consultar nuevamente (verificar persistencia)
- Validación: campo requerido vacío → error 400; ID inexistente → 404

## Seguridad

- Validación de entrada en todos los endpoints (Pydantic)
- Sin SQL injection (ORM + prepared statements)
- Sin XSS (React escapa valores por defecto; sanitizar notas si se aceptan HTML después)
