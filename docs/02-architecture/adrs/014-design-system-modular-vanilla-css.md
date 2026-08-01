# ADR 014: Design System Modular con Vanilla CSS (Implementación)

**Status:** Accepted  
**Date:** 2026-08-01  
**Related:** ADR-009 (Estrategia de Estilos Frontend)  
**Supercedes:** design-css.md (guía operativa)

---

## Contexto y Problema

Tras decidir Vanilla CSS en ADR-009, surge la necesidad de operacionalizar esa decisión: **¿Cómo organizar el CSS en un proyecto React para evitar caos, facilitar reutilización y mantener coherencia visual en 24h?**

### Desafíos Específicos
1. **Consistencia visual sin framework:** Tailwind impone orden; Vanilla CSS requiere disciplina propia.
2. **Reutilización de estilos:** Componentes repetidos (badges, botones, tablas) necesitan patrones definidos.
3. **Mantenibilidad a escala:** 27 historias de usuario + múltiples paneles = múltiples archivos CSS.
4. **Performance:** Evitar bloat de CSS no utilizado (no hay tree-shaking como en Tailwind).
5. **Accesibilidad garantizada:** Contraste WCAG AA, navegación por teclado, a nivel de sistema.
6. **Transiciones smooth:** Micro-animaciones sin latency (requisito "WOW factor").

### Situación Actual
- ADR-009 decide Vanilla CSS (estrategia ✓)
- PRD requiere dise­ño premium con glasmorphism, micro-animaciones
- Frontend aún por construir (0 LOC)
- 24h de deadline obliga rapidez sin sacrificar calidad

---

## Alternativas Consideradas

### 1. CSS-in-JS (Styled Components, Emotion)
**Descripción:** JavaScript que genera CSS dinámico en tiempo de ejecución.

**Ventajas:**
- Scoping automático (sin colisiones de nombres)
- Temas dinámicos (dark mode, personalizaciones)
- Integración nativa con props React

**Desventajas:**
- Overhead de bundle (+~15KB)
- Complejidad innecesaria para MVP
- Dificulta debugging (CSS no está en archivos .css)
- Vite ya es herramienta de build; CSS-in-JS crea capa extra

**Veredicto:** ❌ Descartado por complejidad innecesaria.

---

### 2. Metodología BEM (Block Element Modifier)
**Descripción:** Nomenclatura CSS + estructura plana (`block__element--modifier`).

**Ejemplo:**
```css
.dashboard {}
.dashboard__header {}
.dashboard__header--active {}
```

**Ventajas:**
- Convención clara y documentada
- Scoping mediante nomenclatura
- Fácil de enseñar

**Desventajas:**
- Nombres largos y verbosos
- Sin soporte nativo para anidación (perdemos claridad)
- No ordena por componente (CSS disperso en archivo)

**Veredicto:** ⚠️ Parcialmente adoptado: usar para archivos específicos, pero con estructura modular (ver Alternativa 3).

---

### 3. Módulos CSS (CSS Modules)
**Descripción:** Archivos `.module.css` importados como objetos JavaScript. Scoping automático + nomenclatura limpia.

**Ejemplo:**
```jsx
import styles from './Dashboard.module.css';
export function Dashboard() {
  return <div className={styles.container}>...</div>;
}
```

**Ventajas:**
- Scoping verdadero: no hay colisiones globales
- Nomenclatura simple (`.container`, `.header`, sin BEM verbosity)
- Compilador de Vite maneja transformación automática
- Fácil debug (source maps)

**Desventajas:**
- Design tokens menos compartibles (cada módulo los reimporta)
- Requiere cambio en import/export workflow
- Mayor overhead cognitivo al tener dos tipos de imports (JS y CSS)

**Veredicto:** ⚠️ Buena opción, pero rechazada por MVP: preferimos variables CSS globales sobre módulos para velocidad.

---

### 4. **Vanilla CSS + CSS Custom Properties + Estructura Modular** ✓
**Descripción:** Archivo `variables.css` global con tokens (`--color-primary`, `--space-md`). Archivos `.css` específicos por componente/función. Importados una sola vez en App.jsx.

**Estructura:**
```
src/styles/
├── variables.css      # Tokens: colores, espacios, tipografía, sombras
├── globals.css        # Reset, base styles
├── animations.css     # @keyframes, hover effects
└── components/
    ├── dashboard.css  # Dashboard específico
    ├── form.css       # Formularios
    ├── badges.css     # Badges de salud
    ├── table.css      # Tablas
    └── modal.css      # Modales
```

**Ventajas:**
- ✅ Máximo control (ADR-009)
- ✅ Fácil de leer y mantener (estructura clara)
- ✅ Design tokens compartibles globalmente
- ✅ Micro-animaciones nativas sin limpieza
- ✅ Zero overhead: no requiere compilador especial
- ✅ Rápido de escribir (urgencia 24h)
- ✅ Source maps claros (inspect element muestra variables.css:42)

**Desventajas:**
- ⚠️ Sin scoping automático (require disciplina en naming)
- ⚠️ Requiere documentación clara (convención de nombres)
- ⚠️ CSS global compartible pero sin garantía de no-uso

**Veredicto:** ✅ **ELEGIDO** — mejor fit para urgencia, control, y complejidad moderada.

---

## Decisión

Se implementará un **Design System Modular en Vanilla CSS** con la siguiente estructura:

### 1. Archivo de Tokens Global (`styles/variables.css`)
Todos los tokens compartibles como CSS custom properties:
- **Colores:** 4 estados operativos (success/warning/danger/neutral) + primarios + neutrales
- **Espaciado:** Sistema 4px (`--space-xs` a `--space-3xl`)
- **Border Radius:** 6 escalas (`--radius-xs` a `--radius-full`)
- **Shadows:** 4 profundidades (`--shadow-sm` a `--shadow-xl`)
- **Tipografía:** Tamaños, pesos, line-heights
- **Transiciones:** Duraciones y easing presets
- **Breakpoints:** Media query constants

### 2. Reset + Base Styles (`styles/globals.css`)
- Reset CSS normalizador
- Reglas base para etiquetas HTML (`h1`, `p`, `button`, `input`, `table`)
- Garantías WCAG AA en nivel de sistema

### 3. Componentes Específicos (`styles/components/*.css`)
- `dashboard.css`: Grid, tabla proyectos, headers
- `badges.css`: Estados de salud (4 variantes)
- `form.css`: Inputs, labels, validación, submit
- `table.css`: Tablas genéricas (thead, tbody, hover)
- `animations.css`: @keyframes, hover/active states
- `modal.css`: Backdrop, contenedor, cerrar

### 4. Integración en React (`App.jsx`)
```jsx
import './styles/variables.css';      // PRIMERO: custom properties
import './styles/globals.css';
import './styles/animations.css';
import './styles/components/dashboard.css';
// ... resto de componentes
```

### 5. Convención de Naming
- **Clases genéricas:** `.container`, `.header`, `.button`, `.badge` (no BEM verbosity)
- **Variantes:** `.badge-success`, `.badge-danger` (modifier simple)
- **Estados:** `.button:hover`, `.input:focus` (pseudoclases nativas)
- **Negativos evitar:** NO `.dashboard_header_title--large` (BEM extremo)

---

## Justificación

### 1. Alineación con ADR-009
ADR-009 eligió Vanilla CSS por "máximo control". Esta decisión operacionaliza esa meta con estructura que:
- Mantiene control granular (no abstracciones que lo limiten)
- No añade compiladores especiales (Vite ya es suficiente)
- Facilita micro-animaciones sin workarounds

### 2. Velocidad de Desarrollo (24h Deadline)
- Tokens definidos en 30 min (copiar variables.css)
- Componentes = copiar/pegar patrones (badges, table, form) = 2-3h
- No hay curva de aprendizaje (es CSS estándar)
- Vite maneja CSS nativo en milisegundos

### 3. Reutilización sin Reinvención
- Design tokens únicos: no replicar `#10B981` en 5 archivos
- Componentes modulares: `.badge-success` = 1 definición = 27 uso

### 4. Mantenibilidad Post-MVP
- Estructura es escalable: agregar `modal.css` no rompe nada
- Naming claro: alguien nuevo entiende `styles/components/dashboard.css` sin preámbulo
- Source maps: error de contraste → fácil localizar en `badges.css:18`

### 5. Accesibilidad a Nivel de Sistema
- WCAG AA garantizado en `globals.css` (contraste de base)
- Paleta de colores validada una sola vez
- Transiciones respetan `prefers-reduced-motion` (implementable global)

### 6. Performance
- Bundle: +2KB (variables.css) vs +40KB (Tailwind)
- Build: <50ms vs ~200ms (Tailwind)
- Render: CSS nativo = zero JavaScript overhead

---

## Consecuencias

### Positivas ✅
1. **Máximo control:** Cada pixel es decisión deliberada, no "utilidad predefinida".
2. **Interfaces únicas:** glasmorphism, micro-animaciones, paletas HSL sin limpieza.
3. **Bundle ligero:** Ninguna dependencia CSS; solo JavaScript de React.
4. **Debugging claro:** DevTools inspecciona valores de variables, no clases ofuscadas.
5. **Documentación natural:** El código CSS *es* la documentación (no requiere guía Tailwind).
6. **Equipo pequeño:** Sin fricción de coordinación sobre utility names.

### Desafíos ⚠️
1. **Disciplina requerida:** Sin Tailwind aplicando convenciones, el equipo debe mantener orden.
   - **Mitigación:** design-css.md + checklist de revisión.

2. **CSS no usado:** Sin tree-shaking, componentes no utilizados dejan estilos.
   - **Mitigación:** Auditoría en final MVP; purgar en post-MVP.

3. **Nominación de clases:** Sin utilidades predefinidas, riesgo de `container-v2`, `header-alt`, etc.
   - **Mitigación:** Convención clara (ver sección 5 de Decisión) + linting (stylelint si escala).

4. **Transiciones por defecto:** Sin `.transition-all`, cada efecto es explícito.
   - **Mitigación:** Archivo `animations.css` con presets reutilizables (`.hover-lift`, `.fade-in`).

---

## Implementación

### Fase 1: Setup (30 min)
- [ ] Crear `src/styles/` directory
- [ ] Copiar `variables.css` (tokens)
- [ ] Copiar `globals.css` (reset)
- [ ] Importar en `App.jsx` (orden correcto)

### Fase 2: Componentes Base (2h)
- [ ] `animations.css` (@keyframes, hover states)
- [ ] `components/badges.css` (4 variantes)
- [ ] `components/form.css` (inputs, botones)
- [ ] `components/table.css` (tablas)

### Fase 3: Específicos (3h)
- [ ] `components/dashboard.css`
- [ ] `components/modal.css`
- [ ] Integrar en componentes React
- [ ] Validar WCAG AA (axe DevTools)

### Fase 4: QA (1h)
- [ ] Probar responsive (@media queries)
- [ ] Verificar contraste de colores
- [ ] Revisar micro-animaciones (smooth, no janky)
- [ ] Cleanup: CSS no utilizado

### Fase 5: Documentación (30 min)
- [ ] Documentar convención de nombres
- [ ] Crear guía de agregar componentes nuevos
- [ ] Checklist de revisión CSS

---

## Revisión y Aprobación

- **Revisado por:** Architecture Review Board
- **Aprobado:** 2026-08-01
- **Próxima revisión:** Post-MVP (si escala a equipos > 1 dev, considerar CSS Modules o BEM strict)

---

## Referencias

- **ADR-009:** Estrategia de Estilos Frontend (Vanilla CSS decision)
- **PRD §12:** Experiencia de Usuario y Diseño (requisitos visuales)
- **Guía Operativa:** `design-css.md` (implementación paso a paso)
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Estado:** ✅ Listo para implementación.
