---
fuente_prd: docs/01-prd/gestor-proyectos-aztec.md
fuente_epicas: docs/03-backlog/epicas.md
fecha: 2026-08-01
---

# Backlog — GestorProyectos

Tabla consolidada de todas las Historias de Usuario, ordenadas por priorización vigente (Must > Should > Could) y luego por épica.

## Priorización

| Prioridad | Cantidad | Notas |
|-----------|----------|-------|
| **Must** | 22 | Core producto y cimientos técnicos |
| **Should** | 4 | Enhancers de UX y administración secundaria |
| **Could** | 1 | Integraciones futuras (webhooks) |
| **TOTAL** | 27 | |

---

## Historias por Prioridad

### MUST (22 historias)

| ID | Título | Épica | Complejidad | Estado | Fuente |
|---|---|---|---|---|---|
| HU-001 | Crear y actualizar proyectos | EP-001 | M | borrador | PRD §6 |
| HU-002 | Consultar proyecto individual | EP-001 | S | borrador | PRD §6 |
| HU-003 | Listar proyectos de la cartera | EP-001 | S | borrador | PRD §6 |
| HU-004 | Detectar proyectos bloqueados | EP-002 | M | borrador | PRD §5 |
| HU-005 | Detectar proyectos en riesgo | EP-002 | M | borrador | PRD §5 |
| HU-006 | Detectar proyectos sin rumbo | EP-002 | M | borrador | PRD §5 |
| HU-007 | Vista de cartera con badges de salud | EP-003 | M | borrador | PRD §5 |
| HU-008 | Ordenar cartera por score de priorización | EP-003 | M | borrador | PRD §5 |
| HU-009 | Configurar estrategia de priorización por proyecto | EP-003 | M | borrador | PRD §6 |
| HU-010 | Crear y editar tareas de proyecto | EP-004 | M | borrador | PRD §6 |
| HU-011 | Filtrar tareas por estado | EP-004 | S | borrador | PRD §6 |
| HU-012 | Cargar proyectos desde CSV (semilla) | EP-005 | S | borrador | PRD §6 |
| HU-013 | Cargar tareas desde CSV (semilla) | EP-005 | S | borrador | PRD §6 |
| HU-014 | Cargar equipo desde CSV (semilla) | EP-005 | S | borrador | PRD §6 |
| HU-015 | Autenticación JWT | EP-006 | M | borrador | PRD §10 |
| HU-020 | Eliminar proyecto (soft delete) | EP-001 | S | borrador | PRD §6 |
| HU-022 | Edición inline de proyectos en el tablero | EP-001 | M | borrador | PRD §6 |
| HU-023 | Visualizar y entender criterio de priorización | EP-003 | M | borrador | PRD §5 |
| HU-024 | Configurar PostgreSQL 15 en docker-compose | EP-001 | S | borrador | PRD §10 |
| HU-025 | Configurar FastAPI backend en docker-compose | EP-001 | M | borrador | PRD §10 |
| HU-026 | Configurar React frontend en docker-compose | EP-003 | M | borrador | PRD §10 |
| HU-027 | Orquestar stack completo en docker-compose | EP-001 | M | borrador | PRD §12 |

### SHOULD (4 historias)

| ID | Título | Épica | Complejidad | Estado | Fuente |
|---|---|---|---|---|---|
| HU-016 | Gestión de usuarios y roles (administración) | EP-006 | M | borrador | PRD §5 |
| HU-017 | Audit Trail (historial de cambios) | EP-007 | M | borrador | PRD §5 |
| HU-018 | Vista de carga de equipo (Team Capacity) | EP-008 | M | borrador | PRD §5 |
| HU-019 | Gestión de plantillas de proyectos | EP-007 | M | borrador | PRD §5 |

### COULD (1 historia)

| ID | Título | Épica | Complejidad | Estado | Fuente |
|---|---|---|---|---|---|
| HU-021 | Notificaciones vía Webhooks | EP-009 | M | borrador | PRD §5 |

---

## Huérfanos

- **Historias sin épica**: Ninguna (todas están asignadas).
- **Épicas con historias**: EP-001 (8), EP-002 (3), EP-003 (5), EP-004 (2), EP-005 (3), EP-006 (2), EP-007 (2), EP-008 (1), EP-009 (1).

---

## Resumen de Cobertura

| Épica | Historias | Must | Should | Could |
|---|---|---|---|---|
| EP-001 (CRUD+Docker) | 8 | 7 | 1 | — |
| EP-002 (Motor Salud) | 3 | 3 | — | — |
| EP-003 (Cartera+Docker) | 5 | 5 | — | — |
| EP-004 (Tareas) | 2 | 2 | — | — |
| EP-005 (Datos Semilla) | 3 | 3 | — | — |
| EP-006 (Auth) | 2 | 1 | 1 | — |
| EP-007 (Auditoría) | 2 | — | 2 | — |
| EP-008 (Equipo) | 1 | — | 1 | — |
| EP-009 (Webhooks) | 1 | — | — | 1 |
| **TOTAL** | **27** | **22** | **4** | **1** |

> **Nota sobre Docker**: HU-024, HU-025, HU-027 reasignadas a EP-001 (infraestructura integrada desde el CRUD). HU-026 reasignada a EP-003 (frontend dockerizado). No hay épica EP-010 independiente.

---

## Leyenda de Estado

- `borrador` — Historia escrita pero no validada contra INVEST aún.
- `lista` — Aprobada por INVEST, lista para construcción.
- `en_construccion` — Asignada a un slice activo.
- `completada` — Implementada y verificada en smoke.
- `cancelada` — Descartada o subsumida por otra.
