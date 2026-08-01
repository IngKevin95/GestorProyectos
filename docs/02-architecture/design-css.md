---
title: Design System — Tailwind CSS Implementation (Guía Operativa)
status: Active
---

# Design System: Tailwind CSS Configuration

Esta es la guía operativa para el diseño premium del frontend usando **Tailwind CSS**.

**Decisión:** Tailwind CSS en lugar de Vanilla CSS puro (ADR-009 actualizado). La configuración centralizada en `tailwind.config.js` nos da la velocidad de las utilidades y la flexibilidad del control de tokens.

## 1. Design Tokens (tailwind.config.js)

Se ha implementado una paleta "Deep Pine & Gold" muy empresarial, profesional y premium.

### Paleta Principal
- **Primary (Deep Pine):** `#0D2E2B` (usado para fondos principales, botones y branding).
- **Secondary / Accent (Gold):** `#C69C6D` (usado para acentos, iconos destacados y estado activo).
- **Neutral (Slate):** Tailwind `slate` default (usado para bordes, sombras suaves y fondos secundarios).

### Micro-Animaciones
Las animaciones premium están soportadas nativamente por Tailwind (`transition-all`, `hover:-translate-y-0.5`, `shadow-md`).

## 2. Implementación de Clases
Los componentes como botones, tarjetas y dashboards deben usar combinaciones de clases de Tailwind:

```tsx
<button className="bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 shadow-md transition-all text-white rounded-xl px-4 py-2 font-bold">
  Acción
</button>
```

*(Nota: Aunque la paleta base es Deep Pine, los componentes actuales usan indigo/slate por defecto, y se ajustan dinámicamente según el branding).*

## 3. Estado de la Migración
Se ha eliminado la carpeta `src/styles/` (Vanilla CSS) que duplicaba esfuerzos. El proyecto ahora es 100% dependiente de Tailwind CSS, con la paleta y clases de utilidad en cada componente JSX.
