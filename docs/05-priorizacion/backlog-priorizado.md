---
fuente_prd: docs/01-prd/gestor-proyectos-aztec.md
fuente_epicas: docs/03-backlog/epicas.md
fecha: 2026-08-01
---

# Backlog — GestorProyectos

Tabla consolidada de todas las Historias de Usuario, agrupadas por **Épica** y ordenadas según su prioridad bajo la metodología MoSCoW. 

## Metodología de Priorización: MoSCoW (A nivel de Épica)

Se ha priorizado a nivel de **Épica**, determinando cuáles flujos completos (y sus historias) forman parte del MVP y cuáles se iterarán posteriormente:

- **Must / Should (Requeridas):** Épicas 1, 2, 3, 4 y 6. Conforman el core operativo de la herramienta (gestión de proyectos, tareas, salud, cartera y autenticación).
- **Could / Won't (Opcionales/Diferidas):** Épicas 5, 7, 8 y 9. Aportan valor adicional (auditoría, datos semilla, webhooks, equipo) pero no bloquean la funcionalidad principal de la primera entrega.

---

## Épicas Requeridas (MVP)

### MUST HAVE (Core Indispensable)
* **Justificación de Negocio:** Estas épicas sientan las bases de la plataforma. Sin creación de proyectos, detección de salud y tareas, el producto carece de valor fundamental.

**EP-001: Gestión de Proyectos y Contenedorización**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-001 | Crear y actualizar proyectos | M | lista |
| HU-002 | Consultar proyecto individual | S | lista |
| HU-003 | Listar proyectos de la cartera | S | lista |
| HU-020 | Eliminar proyecto (soft delete) | S | lista |
| HU-022 | Edición inline de proyectos en el tablero | M | lista |
| HU-024 | Configurar PostgreSQL 15 en docker-compose | S | lista |
| HU-025 | Configurar FastAPI backend en docker-compose | M | lista |
| HU-027 | Orquestar stack completo en docker-compose | M | lista |

**EP-002: Motor de Detección de Salud**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-004 | Detectar proyectos bloqueados | M | lista |
| HU-005 | Detectar proyectos en riesgo | M | lista |
| HU-006 | Detectar proyectos sin rumbo | M | lista |

**EP-004: Gestión de Tareas**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-010 | Crear y editar tareas de proyecto | M | lista |
| HU-011 | Filtrar tareas por estado | S | lista |


### SHOULD HAVE (Altamente Recomendables)
* **Justificación de Negocio:** Completan la experiencia del MVP, aportando autenticación y visibilidad global (Cartera), lo que permite que el sistema se pueda probar de forma realista con múltiples usuarios.

**EP-003: Visibilidad de Cartera**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-007 | Vista de cartera con badges de salud | M | lista |
| HU-008 | Ordenar cartera por score de priorización | M | lista |
| HU-009 | Configurar estrategia de priorización por proyecto | M | lista |
| HU-023 | Visualizar y entender criterio de priorización | M | lista |
| HU-026 | Configurar React frontend en docker-compose | M | lista |

**EP-006: Autenticación y Usuarios**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-015 | Autenticación JWT | M | lista |
| HU-016 | Gestión de usuarios y roles (administración) | M | lista |

---

## Épicas Opcionales y Diferidas

### COULD HAVE (Deseables si hay capacidad)
* **Justificación de Negocio:** Facilitan la implementación (datos semilla) o la trazabilidad (auditoría), pero el producto puede funcionar operativamente sin ellas en las primeras semanas de vida.

**EP-005: Datos Semilla**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-012 | Cargar proyectos desde CSV (semilla) | S | lista |
| HU-013 | Cargar tareas desde CSV (semilla) | S | lista |
| HU-014 | Cargar equipo desde CSV (semilla) | S | lista |

**EP-007: Auditoría y Plantillas**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-017 | Audit Trail (historial de cambios) | M | lista |
| HU-019 | Gestión de plantillas de proyectos | M | lista |


### WON'T HAVE (Diferidas para futuras versiones)
* **Justificación de por qué NO se incluyeron en el MVP:** Para lanzar rápido, el manejo de la capacidad del equipo (Capacity) y las notificaciones por webhooks (Slack/Teams) se consideran complejas y propias de un producto de madurez media/alta, por lo que se postergan explícitamente.

**EP-008: Gestión de Capacidad de Equipo**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-018 | Vista de carga de equipo (Team Capacity) | M | lista |

**EP-009: Integraciones y Webhooks**
| ID | Título | Complejidad | Estado |
|---|---|---|---|
| HU-021 | Notificaciones vía Webhooks | M | lista |

---

## Leyenda de Estado

- `borrador` — Historia escrita pero no validada contra INVEST aún.
- `lista` — Aprobada por INVEST, lista para construcción (Todas las HUs se encuentran en este estado).
- `en_construccion` — Asignada a un slice activo.
- `completada` — Implementada y verificada en smoke.
- `cancelada` — Descartada o subsumida por otra.
