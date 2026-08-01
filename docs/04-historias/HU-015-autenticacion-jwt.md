---
id: HU-015
titulo: Inicio de sesión seguro
epica: EP-006
prioridad: Must
complejidad: M
estado: lista
---

# HU-015 — Inicio de sesión seguro

**Como** usuario del sistema,
**quiero** iniciar sesión con mis credenciales de forma segura,
**para** acceder a las funcionalidades protegidas de la aplicación.

## Fuente
PRD §11 (Experiencia de Usuario y Diseño: LoginPage).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Inicio de sesión exitoso
```gherkin
Dado que estoy en la página de login
Cuando ingreso credenciales válidas
Y presiono "Ingresar"
Entonces mi sesión se autentica
Y soy redirigido al OperationalDashboard
```

### Escenario 2: Credenciales inválidas
```gherkin
Dado que estoy en la página de login
Cuando ingreso credenciales incorrectas
Y presiono "Ingresar"
Entonces se muestra un mensaje de "Credenciales inválidas"
Y no accedo a la aplicación
```

### Escenario Borde: Token expirado
```gherkin
Dado que tengo un token expirado
Cuando intento acceder a la API
Entonces recibo error 401 Unauthorized
```