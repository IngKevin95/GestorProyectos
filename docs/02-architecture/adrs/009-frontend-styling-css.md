# ADR 009: Estrategia de Estilos Frontend (Vanilla CSS)

**Status:** Accepted
**Date:** 2026-07-31

## Contexto y Problema
El frontend debe presentar un dise�o "premium, moderno y vivo" (micro-animaciones, glassmorphism, paletas HSL) garantizando una experiencia de usuario espectacular. Al mismo tiempo, se debe elegir un sistema de estáilizaci�n acorde a la meta del MVP.

## Alternativas Consideradas
1. **Librer�as de Componentes (MUI, Bootstrap)**: R�pidas, pero imponen un dise�o gen�rico y r�gido que dificulta el requerimiento de "está�tica premium �nica".
2. **Tailwind CSS**: Acelera el desarrollo mediante utility classes, pero el usuario no ha solicitado expl�citamente su uso, y puede ensuciar el marcado (HTML) dificultando el control fino de micro-animaciones personalizadas en un equipo peque�o.
3. **Vanilla CSS (CSS Modules o Globales estructurados)**: Est�ndar web nativo. Ofrece el m�ximo control sobre variables CSS, animaciones precisas y dise�o personalizado sin dependencias de compilaci�n adicionales.

## Decisión
Se emplear� **Vanilla CSS** (estructurado con variables CSS y tokens de dise�o) como estárategia principal de estáilizaci�n, evitando frameworks intrusivos a menos que se escale el equipo.

## Justificación
- Alineaci�n directa con los requerimientos de dise�o premium: permite control granular absoluto sobre micro-animaciones, efectos de hover y paletas complejas.
- Cero dependencias adicionales en el *build step* de Vite.
- Fomenta la creación de un sistema de dise�o propio basado en propiedades custom (`--color-primary`, `--transition-smooth`), logrando está�tica �nica no gen�rica.

## Consecuencias
- **Positivas**: M�xima flexibilidad y control. Interfaces �nicas (wow-factor). Archivos HTML/JSX más limpios.
- **Negativas**: Requiere mayor disciplina por parte del desarrollador para mantener la estáructura CSS organizada y no re-inventar utilidades comunes.
