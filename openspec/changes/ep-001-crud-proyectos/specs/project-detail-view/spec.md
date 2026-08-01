# Spec: project-detail-view

**Capability**: Vista de detalle de un proyecto mostrando todos los campos.

## Component: ProjectDetail

### Props
```typescript
interface ProjectDetailProps {
  projectId: number
  isLoading?: boolean
  onEdit?: () => void
  onClose?: () => void
  onDelete?: () => Promise<void>
}
```

### Display Fields

| Field | Label | Display Type |
|---|---|---|
| nombre | Nombre | Heading H2 |
| responsable | Responsable | text |
| estado | Estado | badge (color según estado) |
| prioridad | Prioridad | badge (color según prioridad) |
| fecha_límite | Fecha Límite | formatted date (DD/MM/YYYY) |
| siguiente_paso | Siguiente Paso | text (puede ser multilínea) |
| bloqueos | Bloqueos | text (puede ser multilínea, si vacío: "Sin bloqueos") |
| notas | Notas | text (puede ser multilínea, si vacío: "Sin notas") |
| tipo_proyecto | Tipo de Proyecto | badge |
| created_at | Creado | formatted date+time (DD/MM/YYYY HH:MM) |
| updated_at | Actualizado | formatted date+time (DD/MM/YYYY HH:MM) |

### Layout

```
┌─────────────────────────────────────┐
│ NOMBRE (H2)                         │
├─────────────────────────────────────┤
│ Responsable: Alice                  │
│ Estado: [Activo]  Prioridad: [Alta] │
│ Tipo: [Diagnóstico]                 │
│ Fecha Límite: 31/12/2026            │
├─────────────────────────────────────┤
│ Siguiente Paso:                     │
│ Revisar brief con cliente           │
│                                     │
│ Bloqueos:                           │
│ Pendiente aprobación presupuesto    │
│                                     │
│ Notas:                              │
│ Proyecto piloto XYZ                 │
├─────────────────────────────────────┤
│ Creado: 01/08/2026 18:00            │
│ Actualizado: 01/08/2026 18:30       │
├─────────────────────────────────────┤
│ [Editar] [Eliminar] [Cerrar]        │
└─────────────────────────────────────┘
```

### Badges

- **Estado**:
  - Activo → verde (bg-green-100, text-green-800)
  - En Pausa → amarillo (bg-yellow-100, text-yellow-800)
  - Cancelado → rojo (bg-red-100, text-red-800)
  - Completado → gris (bg-gray-100, text-gray-800)

- **Prioridad**:
  - Alta → rojo (bg-red-100, text-red-800)
  - Media → naranja (bg-orange-100, text-orange-800)
  - Baja → azul (bg-blue-100, text-blue-800)

- **Tipo de Proyecto**:
  - Mantenimiento → púrpura
  - Recurrente → cian
  - Diagnóstico → amarillo
  - Proyecto → azul

### Buttons

**Bottom Actions**:
- Editar (si `onEdit` provided)
- Eliminar (si `onDelete` provided)
- Cerrar (siempre presente, llamar `onClose`)

**Delete confirmation**:
- Modal: "¿Estás seguro que deseas eliminar este proyecto?"
- Botones: "Cancelar", "Eliminar"
- Foco por defecto en "Cancelar"

### Loading State

- Si `isLoading=true`: mostrar skeleton loaders en lugar de valores
- Deshabilitar botones de acción

### Error State

- Si falla la carga: mostrar mensaje "Error al cargar proyecto. Intenta de nuevo."
- Botón: "Reintentar"

### Styling

- Usar TailwindCSS
- Layout de tarjeta: border gris, padding-4, shadow suave
- Responsive: full-width en mobile, max-width 600px en desktop
- Texto de campos opcionales vacíos en gris claro (texto-placeholder)

### Accessibility

- Heading h2 para el nombre del proyecto (para jerarquía de página)
- Botones con aria-label descriptivos
- Modal de confirmación con rol="alertdialog"
- Navegación con Tab entre campos de información y botones
