# priority-scoring Specification

## Purpose
TBD - created by archiving change ep-003-vista-cartera. Update Purpose after archive.
## Requirements
### Requirement: Ordenamiento por Score de Priorización
El sistema SHALL retornar los proyectos ordenados de manera descendente según su puntaje de prioridad (score). Este puntaje combina el estado de salud, urgencia, valor de negocio y (opcionalmente) tareas críticas.

#### Scenario: Orden descendente correcto
- **WHEN** existen múltiples proyectos con diferentes combinaciones de salud, urgencia y valor
- **THEN** la API o la vista los ordena de manera que el de mayor puntaje aparece primero en la lista.

#### Scenario: Algoritmo de Score Funcional (Estrategia Mixta y Relativa)
- **WHEN** un proyecto usa la estrategia de priorización Mixta o Relativa
- **THEN** el sistema calcula el score en tiempo real o en consulta sumando los factores correspondientes (salud aporta 30%, urgencia 25%, valor de negocio 25%, tareas críticas 20%).

#### Scenario: Uso de constante en Estrategia Absoluta
- **WHEN** un proyecto tiene la estrategia 'absolute' y una constante `priority_constant` = 8.5
- **THEN** su score se evalúa directamente como 8.5, ignorando otras variables.

#### Scenario: Desempate determinista
- **WHEN** dos proyectos tienen exactamente el mismo score
- **THEN** se ordenan de forma determinista usando la fecha de creación o el nombre como desempate.

