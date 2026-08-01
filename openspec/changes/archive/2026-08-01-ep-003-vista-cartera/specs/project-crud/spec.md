## ADDED Requirements

### Requirement: Configuración de prioridad por proyecto
El sistema SHALL permitir al usuario configurar la estrategia de priorización de un proyecto al crearlo o actualizarlo, almacenando esta configuración en la base de datos.

#### Scenario: Creación con estrategia Relativa por defecto
- **WHEN** el usuario crea un proyecto sin especificar una estrategia
- **THEN** el sistema asigna por defecto la estrategia 'relative' con `priority_constant` = 0.0 y `business_value` = 0.0.

#### Scenario: Cambio a estrategia Absoluta con constante
- **WHEN** el usuario actualiza un proyecto a la estrategia 'absolute' e ingresa un `priority_constant` válido (ej: 8.5)
- **THEN** los cambios se persisten en la base de datos para dicho proyecto, y validan que el valor esté entre 0 y 10.

#### Scenario: Actualización de Valor de Negocio
- **WHEN** el usuario actualiza el campo `business_value` de un proyecto (rango 0 a 10)
- **THEN** el valor se persiste, permitiendo su uso en estrategias relativas o mixtas.

#### Scenario: Ocultamiento de constante según estrategia
- **WHEN** la interfaz se renderiza y el proyecto tiene la estrategia 'relative' o 'mixed'
- **THEN** el input para `priority_constant` debe estar deshabilitado o no ser provisto para su edición por el usuario.
