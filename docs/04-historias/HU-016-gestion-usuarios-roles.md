---
id: HU-016
titulo: Gestión básica de usuarios y roles
epica: EP-006
prioridad: Should
complejidad: M
estado: borrador
---

# HU-016 — Gestión básica de usuarios y roles

**Como** Administrador,
**quiero** gestionar (CRUD) usuarios, asignarles roles y configurar los permisos de cada rol,
**para** controlar el acceso a distintas partes de la aplicación.

## Fuente
Frontend Component Abstraction (`AdminPage`).

## Chequeo INVEST
- **Valiosa**: ✓
- **Independiente**: ✓
- **Negociable**: ✓
- **Estimable**: ✓
- **Pequeña**: ✓
- **Testable**: ✓

## Criterios de Aceptación

### Escenario 1: Crear usuario con rol asignado
```gherkin
Dado que he iniciado sesión como Administrador
Y estoy en la página de Admin
Cuando creo un nuevo usuario y le asigno un rol
Entonces el usuario puede acceder al sistema con los permisos de dicho rol
```

### Escenario 2: Intentar borrar al último administrador
```gherkin
Dado que he iniciado sesión como Administrador
Y soy el único usuario con rol "Admin"
Cuando intento eliminar mi propio usuario
Entonces el sistema bloquea la acción mostrando "No puede eliminar al último administrador"
```

### Escenario Borde: Email duplicado
```gherkin
Dado que intento crear un usuario
Cuando el email ya existe en BD
Entonces recibo error de validación
```