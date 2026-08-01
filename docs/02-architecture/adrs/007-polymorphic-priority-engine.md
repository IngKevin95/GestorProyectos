# ADR 007: Motor de Priorizaci�n Polim�rfico (Estrategia Matem�tica)

**Status:** Accepted
**Date:** 2026-07-31

## Contexto y Problema
El cálculo del Score de Prioridad de un proyecto depende de las tareas cr�ticas. Sin embargo, usar un divisor estáricto (ej. total de tareas) penaliza matem�ticamente a los proyectos grandes. Dividir por una constante penaliza a los peque�os. Se requiere un mecanismo que soporte múltiples enfoques.

## Alternativas Consideradas
1. **F�rmula R�gida �nica (Hardcoded)**: Forzar un solo modelo matem�tico (Absoluto o Relativo) a todos los proyectos.
2. **Patr�n Strategy (Polimorfismo)**: Crear una interfaz de cálculo en backend y frontend que acepte el par�metro inyectado por configuraci�n, permitiendo cambiar el algoritmo de cálculo (Relativo, Absoluto, Mixto) por proyecto sin modificar la lógica base.

## Decisión
Se implementar� el **Patr�n Strategy (Motor Polim�rfico)**. El backend/frontend expondr� una configuraci�n a nivel proyecto donde el usuario elija el tipo de cálculo y provea la constante en caso de elegir Absoluto/Mixto.

## Justificación
- Proporciona total flexibilidad de negocio: las empresas que gestáionan proyectos peque�os usarán "Relativo" y las que manejan proyectos masivos usarán "Absoluto".
- Sigue los principios SOLID (Open/Closed principle), permitiendo a�adir nuevas f�rmulas en el futuro sin modificar la arquitectura existente del cálculo de Score.

## Consecuencias
- **Positivas**: Alt�sima flexibilidad funcional en UI/UX (`HU-009`) y exactitud matem�tica adaptable al cliente final.
- **Negativas**: Aumenta marginalmente la complejidad del código (una variable condicional/Strategy en vez de una división en una sola l�nea de código).
