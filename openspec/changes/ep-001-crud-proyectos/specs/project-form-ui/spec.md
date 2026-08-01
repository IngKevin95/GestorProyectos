# Spec: project-form-ui

**Capability**: Formulario interactivo para crear y editar proyectos.

## Component: ProjectForm

### Props
```typescript
interface ProjectFormProps {
  initialData?: Project
  onSubmit: (data: ProjectInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}
```

### Form Fields

| Field | Type | Required | Default | Placeholder | Validation |
|---|---|---|---|---|---|
| nombre | text input | ✓ | — | "Ej: Diagnóstico de infraestructura" | min 3 chars, max 255 |
| responsable | text input | ✓ | — | "Ej: Alice" | min 2 chars, max 100 |
| estado | select | ✓ | "Activo" | — | enum: Activo, En Pausa, Cancelado, Completado |
| prioridad | select | ✓ | "Media" | — | enum: Alta, Media, Baja |
| fecha_límite | date input | ✗ | — | "2026-12-31" | date >= today (client validation) |
| siguiente_paso | text input | ✗ | — | "Ej: Revisar brief con cliente" | max 255 |
| bloqueos | textarea | ✗ | — | "Ej: Pendiente aprobación presupuesto" | max 2000 |
| notas | textarea | ✗ | — | "Ej: Notas internas" | max 2000 |
| tipo_proyecto | select | ✓ | "Proyecto" | — | enum: Mantenimiento, Recurrente, Diagnóstico, Proyecto |

### Validation

1. **Client-side**:
   - nombre: no vacío, min 3 chars
   - responsable: no vacío, min 2 chars
   - estado: debe estar en enum
   - prioridad: debe estar en enum
   - tipo_proyecto: debe estar en enum
   - fecha_límite (si está presente): debe ser >= hoy

2. **Error display**:
   - Mostrar error bajo el campo afectado
   - Mensaje claro: "El campo 'Nombre' es obligatorio" o "La fecha debe ser hoy o posterior"

3. **Server-side errors**:
   - Si el servidor retorna 400, mostrar error global en la parte superior del formulario
   - Mensaje: "Fallo al guardar el proyecto: [detalles del servidor]"

### Behavior

- **Create mode** (initialData es null):
  - Título: "Crear Proyecto"
  - Botones: "Guardar", "Cancelar"
  - Campos con valores por defecto

- **Edit mode** (initialData es objeto):
  - Título: "Editar Proyecto"
  - Campos pre-lleados con valores del proyecto
  - Botones: "Guardar Cambios", "Cancelar"

- **Submit**:
  - Deshabilitar botón mientras se envía (isLoading=true)
  - Mostrar spinner o loading text
  - Al éxito: llamar onSubmit callback
  - Al error: mostrar mensaje de error, permitir reintento

- **Cancel**:
  - Llamar onCancel callback (ej: cerrar modal o navegar atrás)

### Styling

- Usar TailwindCSS
- Layout: stack vertical de inputs
- Spacing: gap-4 entre campos
- Botones: primary (azul) para Guardar, secondary (gris) para Cancelar
- Responsive: mobile-first, full-width en pantallas pequeñas

### Accessibility

- Labels asociados a inputs (for/id)
- Aria-required="true" en campos requeridos
- Mensajes de error asociados vía aria-describedby
- Navegación por Tab entre campos
- Enter en último campo o Ctrl+Enter para enviar
