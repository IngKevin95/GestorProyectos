---
title: Design System — Vanilla CSS Implementation (Guía Operativa)
date: 2026-08-01
status: Active
relates_to: [ADR-009, ADR-014, PRD §12]
note: "Ver ADR-014 para decisión arquitectónica. Este documento es guía de implementación paso a paso."
---

# Design System: Vanilla CSS with Custom Properties

## Contexto

**Decisión:** Vanilla CSS en lugar de Tailwind (ADR-009).  
**Razón:** Máximo control para micro-animaciones, glassmorphism y paletas complejas (dise­ño premium). Tailwind es genérico e intrusivo para este scope.  
**Reconciliación:** PRD §12 actualizado (línea 151, 163, 172) para alinear con ADR-009.

---

## Estructura de Archivos CSS

```
frontend/src/
├── styles/
│   ├── variables.css        # Design tokens (colores, espacios, tipografía)
│   ├── globals.css          # Reset CSS, base styles
│   ├── components/
│   │   ├── dashboard.css    # Dashboard/Vista Cartera
│   │   ├── form.css         # Formularios (create/edit proyecto)
│   │   ├── table.css        # Tablas (listados)
│   │   ├── badges.css       # Badges de salud (verde, amarillo, rojo, gris)
│   │   ├── modal.css        # Modales
│   │   └── typography.css   # Headings, body, labels
│   └── animations.css       # Micro-animaciones, transitions
└── App.jsx (importa styles/variables.css como first import)
```

---

## Design Tokens (variables.css)

```css
/* COLORES — Paleta Operativa */
:root {
  /* Estado OK */
  --color-success: #10B981;
  --color-success-light: #D1FAE5;
  --color-success-dark: #047857;
  
  /* Estado Riesgo */
  --color-warning: #F59E0B;
  --color-warning-light: #FEF3C7;
  --color-warning-dark: #D97706;
  
  /* Estado Bloqueado */
  --color-danger: #EF4444;
  --color-danger-light: #FEE2E2;
  --color-danger-dark: #DC2626;
  
  /* Estado Sin Rumbo */
  --color-neutral: #6B7280;
  --color-neutral-light: #F3F4F6;
  --color-neutral-dark: #374151;
  
  /* Texto */
  --color-text-primary-light: #1F2937;  /* dark mode: #F9FAFB */
  --color-text-secondary: #6B7280;
  
  /* Fondos */
  --color-bg-light: #FFFFFF;
  --color-bg-dark: #111827;
  --color-bg-surface: #F9FAFB;
  
  /* Primarios */
  --color-primary: #3B82F6;
  --color-primary-dark: #1E40AF;
  --color-primary-light: #DBEAFE;
}

/* ESPACIADO — Sistema 4px */
:root {
  --space-xs: 0.25rem;   /* 4px */
  --space-sm: 0.5rem;    /* 8px */
  --space-md: 1rem;      /* 16px */
  --space-lg: 1.5rem;    /* 24px */
  --space-xl: 2rem;      /* 32px */
  --space-2xl: 3rem;     /* 48px */
  --space-3xl: 4rem;     /* 64px */
  
  /* Gaps en grillas/flexbox */
  --gap-compact: 0.5rem;  /* 8px */
  --gap-normal: 1rem;     /* 16px */
  --gap-spacious: 2rem;   /* 32px */
}

/* BORDER RADIUS */
:root {
  --radius-xs: 2px;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
}

/* SHADOWS */
:root {
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* TIPOGRAFÍA */
:root {
  --font-family-base: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  --font-size-xs: 0.75rem;    /* 12px */
  --font-size-sm: 0.875rem;   /* 14px */
  --font-size-base: 1rem;     /* 16px */
  --font-size-lg: 1.125rem;   /* 18px */
  --font-size-xl: 1.25rem;    /* 20px */
  --font-size-2xl: 1.5rem;    /* 24px */
  --font-size-3xl: 1.875rem;  /* 30px */
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
  
  --line-height-tight: 1.25;
  --line-height-normal: 1.5;
  --line-height-relaxed: 1.75;
}

/* TRANSICIONES — Micro-animaciones */
:root {
  --transition-fast: 150ms ease-in-out;
  --transition-normal: 250ms ease-in-out;
  --transition-slow: 350ms ease-in-out;
  --easing-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

/* BREAKPOINTS — Responsive */
:root {
  --bp-sm: 640px;
  --bp-md: 768px;
  --bp-lg: 1024px;
  --bp-xl: 1280px;
  --bp-2xl: 1536px;
}
```

---

## Globals & Reset (globals.css)

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-family: var(--font-family-base);
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  background-color: var(--color-bg-light);
  color: var(--color-text-primary-light);
  line-height: var(--line-height-normal);
}

/* Dark mode support (si aplica) */
@media (prefers-color-scheme: dark) {
  body {
    background-color: var(--color-bg-dark);
    color: #F9FAFB;
  }
}

h1, h2, h3, h4, h5, h6 {
  font-weight: var(--font-weight-bold);
  line-height: var(--line-height-tight);
  margin-bottom: var(--space-md);
}

h1 { font-size: var(--font-size-3xl); }
h2 { font-size: var(--font-size-2xl); }
h3 { font-size: var(--font-size-xl); }
h4 { font-size: var(--font-size-lg); }
h5 { font-size: var(--font-size-base); }
h6 { font-size: var(--font-size-sm); }

p, li {
  font-size: var(--font-size-base);
  margin-bottom: var(--space-md);
}

button {
  font-family: inherit;
  cursor: pointer;
  transition: all var(--transition-fast);
}

input, textarea, select {
  font-family: inherit;
  padding: var(--space-sm) var(--space-md);
  border: 1px solid var(--color-neutral-light);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast);
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

table {
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
}

th, td {
  padding: var(--space-md);
  text-align: left;
  border-bottom: 1px solid var(--color-neutral-light);
}

th {
  font-weight: var(--font-weight-semibold);
  background-color: var(--color-bg-surface);
}
```

---

## Componentes Clave (components/*.css)

### Badges de Salud (badges.css)

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  transition: all var(--transition-fast);
}

.badge-success {
  background-color: var(--color-success-light);
  color: var(--color-success-dark);
  border: 1px solid var(--color-success);
}

.badge-warning {
  background-color: var(--color-warning-light);
  color: var(--color-warning-dark);
  border: 1px solid var(--color-warning);
}

.badge-danger {
  background-color: var(--color-danger-light);
  color: var(--color-danger-dark);
  border: 1px solid var(--color-danger);
}

.badge-neutral {
  background-color: var(--color-neutral-light);
  color: var(--color-neutral-dark);
  border: 1px solid var(--color-neutral);
}

.badge:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}
```

### Dashboard/Table (dashboard.css)

```css
.dashboard {
  padding: var(--space-lg);
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.dashboard-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
}

.projects-table {
  background: var(--color-bg-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-md);
  overflow: hidden;
}

.projects-table th {
  background-color: var(--color-bg-surface);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.projects-table tbody tr {
  transition: background-color var(--transition-fast);
}

.projects-table tbody tr:hover {
  background-color: var(--color-bg-surface);
  cursor: pointer;
}

.projects-table td {
  padding: var(--space-md);
  vertical-align: middle;
}

.score-cell {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}
```

### Formulario (form.css)

```css
.form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: var(--space-lg);
  display: flex;
  flex-direction: column;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-sm);
  color: var(--color-text-secondary);
}

.form-input {
  padding: var(--space-md);
  font-size: var(--font-size-base);
  border: 1px solid var(--color-neutral-light);
  border-radius: var(--radius-md);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-input:invalid {
  border-color: var(--color-danger);
}

.form-button {
  padding: var(--space-sm) var(--space-lg);
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.form-button:hover {
  background-color: var(--color-primary-dark);
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}

.form-button:active {
  transform: translateY(0);
}
```

### Animaciones (animations.css)

```css
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.slide-in {
  animation: slideIn var(--transition-normal) var(--easing-smooth);
}

.fade-in {
  animation: fadeIn var(--transition-normal);
}

.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Hover effects */
.hover-lift {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.hover-scale {
  transition: transform var(--transition-fast);
}

.hover-scale:hover {
  transform: scale(1.05);
}
```

---

## Implementación en React

### Importar en App.jsx (PRIMERO)

```jsx
import './styles/variables.css';    // Debe ser PRIMERO
import './styles/globals.css';
import './styles/components/dashboard.css';
import './styles/components/badges.css';
import './styles/components/form.css';
import './styles/animations.css';

function App() {
  return (
    <div className="app">
      {/* Tu app aquí */}
    </div>
  );
}
```

### Componente de Ejemplo

```jsx
export function ProjectBadge({ healthStatus }) {
  const badgeClass = {
    'ok': 'badge badge-success',
    'risk': 'badge badge-warning',
    'blocked': 'badge badge-danger',
    'adrift': 'badge badge-neutral'
  }[healthStatus] || 'badge badge-neutral';

  return <span className={badgeClass}>
    {healthStatus.toUpperCase()}
  </span>;
}
```

---

## Ventajas vs. Tailwind

| Aspecto | Vanilla CSS | Tailwind |
|---|---|---|
| **Control** | 100% granular | Limitado a utilidades |
| **Tamaño Bundle** | Mínimo | ~40KB gzipped |
| **Micro-animaciones** | Nativas, sin limpieza | Requiere @layer directives |
| **Glassmorphism** | Fácil con filtros CSS | Workarounds necesarios |
| **Paletas complejas HSL** | Nativas | Overkill |
| **Curva aprendizaje** | Media (CSS estándar) | Baja (utility-first) |

---

## Checklist de Implementación

- [ ] Crear `styles/variables.css` con tokens completos
- [ ] Crear `styles/globals.css` con reset
- [ ] Crear `styles/components/` con archivos modulares
- [ ] Importar en App.jsx en orden correcto
- [ ] Validar accesibilidad (contraste de colores, WCAG AA)
- [ ] Probar responsivo (@media queries)
- [ ] Documentar paleta en Storybook (si aplica)

---

**Decisión Final:** Vanilla CSS (ADR-009) es la fuente de verdad. PRD actualizado para coherencia. Implementar design tokens como arriba.
