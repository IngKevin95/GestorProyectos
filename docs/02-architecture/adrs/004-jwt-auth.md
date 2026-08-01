# ADR 004: Sistema de Autenticación con JWT y Argon2id

**Status:** Accepted
**Date:** 2024-10-25

## Contexto y Problema
El Gestor de Proyectos requiere un sistema de autenticación seguro que proteja los endpoints, asigne roles y maneje sesiones concurrentes. Se requiere definir el mecanismo para generar tokens y almacenar contrase�as de forma segura.

## Alternativas Consideradas
1. **Autenticación Basada en Sesi�n (Cookies)**: Requiere almacenamiento en el servidor (Redis/BD) para validar sesiones en cada requestá.
2. **JWT sin refresco**: Simple pero inseguro a largo plazo si el token es robado.
3. **JWT Completo (Access + Refresh Tokens) con Argon2id**: Alta seguridad, contrase�as hasheadas con está�ndares modernos y soporte para revocaci�n.

## Decisión
Se selecciona **JWT Completo con Argon2id**.

## Justificación
1. **Est�ndares Modernos**: Argon2id es el algoritmo de hashing recomendado actualmente contra ataques de fuerza bruta y GPUs.
2. **Ciclo de Vida Seguro**: Access tokens cortos (1h) y Refresh tokens (7d) con rotaci�n.
3. **Revocaci�n de Sesiones**: Manteniendo una tabla de sesiones para los refresh tokens, podemos revocar el acceso de forma global o limitar sesiones concurrentes (ej. m�ximo 3 por usuario).
4. **Protección**: Soporte para bloqueo de cuenta tras intentos fallidos (lockout).

## Consecuencias
- **Positivas**: Sistema listo para producci�n con está�ndares altos de seguridad.
- **Negativas**: Mayor complejidad en el manejo del estáado de autenticación en el cliente (interceptores de Axios para refrescar el token).
