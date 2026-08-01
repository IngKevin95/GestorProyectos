# ADR 009: Estrategia de Estilos Frontend (Tailwind CSS)

**Status:** Accepted
**Date:** 2026-08-01

## Contexto y Problema
El frontend debe presentar un diseño "premium, moderno y vivo" (micro-animaciones, glassmorphism, paletas HSL) garantizando una experiencia de usuario espectacular. Al mismo tiempo, se debe elegir un sistema de estilización acorde a la meta del MVP, y la codebase actual ya incluye Tailwind en su configuración (`tailwind.config.js`).

## Alternativas Consideradas
1. **Librerías de Componentes (MUI, Bootstrap)**: Rápidas, pero imponen un diseño genérico y rígido que dificulta el requerimiento de "estética premium única".
2. **Vanilla CSS**: Máximo control, pero requiere mayor tiempo de desarrollo para crear grillas, utilidades de spacing y responsividad que vienen de caja en otros frameworks.
3. **Tailwind CSS**: Acelera el desarrollo mediante utility classes, permite sobreescribir la paleta de colores por defecto en `tailwind.config.js` y mantiene un control granular equivalente a CSS al permitir utilidades a medida y `@layer` components.

## Decisión
Se empleará **Tailwind CSS** como estrategia principal de estilización, con la paleta de colores sobreescrita en `tailwind.config.js` para asegurar la gama "Deep Pine & Gold" y evitar la dependencia visual del diseño por defecto de Tailwind.

## Justificación
- Alineación directa con los requerimientos de velocidad del MVP, reutilizando la infraestructura actual.
- Al sobreescribir la configuración base, se logra la estética única premium (evitando el típico "look Tailwind").
- Fácil limpieza de clases *hardcodeadas* centralizando tokens en el config y usando clases de utilidad, reduciendo el tamaño del bundle.

## Consecuencias
- **Positivas**: Desarrollo más rápido. Facilidad para ajustar responsividad y layout. Consistencia a través de la configuración global (`tailwind.config.js`).
- **Negativas**: Los archivos JSX pueden tener clases largas (utility bloat). Requiere disciplina para extraer componentes complejos a `@apply` cuando se requiera limpieza de marcado.
