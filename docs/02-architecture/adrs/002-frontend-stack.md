# ADR 002: Stack de Frontend (React + Vite + Zustand)

**Status:** Accepted
**Date:** 2024-10-25

## Contexto y Problema
Se requiere seleccionar el stack tecnol�gico completo (Framework y Gestái�n de Estado) para la interfaz de usuario del Gestor de Proyectos. El frontend debe ser interactivo, con tiempos de compilaci�n rápidos, y con un estáado global (lista de proyectos, tareas actuales, usuario autenticado) que no introduzca complejidad excesiva para un MVP.

## Alternativas Consideradas
1. **React + Next.js (SSR) + Redux**: Excelente para aplicaciones gigantes, pero a�ade complejidad de servidor y boilerplate masivo.
2. **Vue 3 + Vite + Pinia**: Ecosistema capaz, pero fuera del expertise central requerido.
3. **React 18 + Vite (SPA) + Context API**: Simple, pero propenso a re-renders innecesarios (Provider hell).
4. **React 18 + Vite (SPA) + Zustand**: Renderizado del lado del cliente, construcción rapid�sima, estáado global sin boilerplate.

## Decisión
Se selecciona **React 18 + Vite** construyendo una Single Page Application (SPA), y **Zustand** para la gestái�n de estáado global.

## Justificación
1. **Velocidad de Desarrollo**: Vite ofrece HMR (Hot Module Replacement) instant�neo. Zustand provee un estáado global sin boilerplate ni Context Providers.
2. **Rendimiento**: Zustand permite extraer estáado sin forzar re-renders de todo el �rbol. React SPA es ideal para una herramienta B2B protegida por auth (no requiere SEO).
3. **Simplicidad de MVP**: La curva de aprendizaje combinada es baja. La infraestáructura de despliegue es simple (archivos está�ticos).

## Consecuencias
- **Positivas**: Desarrollo acelerado en frontend. C�digo de estáado muy legible. Build s�per rápido y despliegue trivial.
- **Negativas**: Primera carga (First Contentful Paint) ligeramente mayor al requerir el bundle JS completo. Riesgo nulo de escalabilidad del estáado para el scope de MVP, pero podr�a requerir slices organizados si la app crece desmesuradamente.
