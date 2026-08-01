# Spec: project-list-ui

**Capability**: Tabla de proyectos con filtros y operaciones inline.

## Component: ProjectList

### Props
```typescript
interface ProjectListProps {
  projects: Project[]
  isLoading?: boolean
  onEdit: (id: number) => void
  onDelete: (id: number) => Promise<void>
  onViewDetail: (id: number) => void
}
```

### Table Columns

| Columna | Data Field | Width | Sortable | Filterable |
|---|---|---|---|---|
| Nombre | nombre | 30% | — | — |
| Responsable | responsable | 20% | — | ✓ (filter button) |
| Estado | estado | 15% | — | ✓ (filter button) |
| Fecha Límite | fecha_límite | 20% | — | — |
| Acciones | — | 15% | — | — |

### Filters

**Visible UI**:
- Dos botones/dropdowns: "Filtrar por Estado" y "Filtrar por Responsable"
- Cuando se aplica filtro, mostrar chip/badge indicando filtro activo
- Botón "Limpiar filtros" visible solo si hay filtros activos

**Behavior**:
- Al cambiar filtro: actualizar lista y hacer llamada a backend (`GET /projects?estado=...&responsable=...`)
- Si filtro no tiene resultados: mostrar mensaje "No hay proyectos que coincidan con el filtro"
- Si tabla está vacía sin filtros: mostrar "No hay proyectos. Crea uno para comenzar"

### Row Actions

**Acciones por fila**:
1. **Ver** — icono de ojo → llamar `onViewDetail(id)` para abrir modal de detalle
2. **Editar** — icono de lápiz → llamar `onEdit(id)` para abrir modal de formulario
3. **Eliminar** — icono de papelera → confirmar con modal "¿Seguro?" antes de llamar `onDelete(id)`

### Styling

- Usar TailwindCSS
- Tabla con bordes y spacing clara
- Filas hover: fondo gris claro
- Acciones: botones pequeños con iconos (usa `lucide-react` o `heroicons`)
- Responsive: en mobile, columnas se apilan o tabla scrollea horizontalmente

### Loading State

- Si `isLoading=true`:
  - Mostrar skeleton loaders en las filas (shimmer effect)
  - Deshabilitar acciones

### Accessibility

- Tabla con caption: "Lista de Proyectos"
- Headers con `th` tag
- Filas con `tr` tag
- Botones de acción con aria-label ("Editar Proyecto ID 1", "Eliminar Proyecto ID 2")
- Confirmación de eliminación: modal con foco en botón "Cancelar" por defecto

### Empty States

1. **Sin datos en absoluto**:
   - Mensaje: "No hay proyectos aún. Crea uno para empezar."
   - Botón destacado: "Crear Proyecto"

2. **Filtro sin resultados**:
   - Mensaje: "No hay proyectos que coincidan con estado='Activo' y responsable='Alice'."
   - Botón: "Limpiar filtros"

3. **Error cargando**:
   - Mensaje: "Error al cargar proyectos. Intenta de nuevo."
   - Botón: "Reintentar"
