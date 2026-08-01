---
fuente_prd: docs/01-prd/gestor-proyectos-aztec.md
fecha: 2026-07-31
---

# Épicas — GestorProyectos

## EP-001 — Gestión de Proyectos (CRUD)

**Resumen**: alta, edición y consulta de proyectos con los campos operativos exigidos por el reto
(responsable, estado, prioridad, fecha límite, siguiente paso, bloqueos, notas).

**Por qué existe**: sin datos estructurados y editables no hay base para detección de salud ni
priorización — es el cimiento del sistema.

**Objetivos PRD que atiende**: "crear/actualizar proyectos con sus campos operativos clave"
(§5); historia "Como Delivery Lead, quiero crear y actualizar proyectos..." (§3).

**Capabilities incluidas**: CRUD de proyectos con campos completos (§6 Must).

**Éxito medible**: 100% de los campos mínimos exigidos por el reto están cubiertos y editables
(KPI, §5 Objetivos y KPIs).

---

## EP-002 — Motor de Detección de Salud (riesgo / bloqueado / sin rumbo)

**Resumen**: reglas explícitas que clasifican automáticamente cada proyecto como bloqueado, en
riesgo, sin siguiente paso claro, u ok.

**Por qué existe**: es el diferencial pedido explícitamente por el reto — pasar de datos crudos a
alertas accionables sin revisión manual proyecto por proyecto.

**Objetivos PRD que atiende**: "detecte automáticamente proyectos en riesgo/bloqueados/sin rumbo"
(§5); "detectar proyectos en riesgo, bloqueados o sin siguiente paso claro" (Enunciado).

**Capabilities incluidas**: motor de detección de riesgo con reglas documentadas (§6 Must).

**Éxito medible**: el sistema clasifica automáticamente los tres estados pedidos (AC producto,
§12 Criterios de Aceptación Globales).

---

## EP-003 — Vista de Cartera y Criterio de Priorización

**Resumen**: dashboard con proyectos ordenados por score de priorización, badges de salud, filtros
básicos, actualizaciones en tiempo real vía SSE, y panel explicativo.

**Por qué existe**: sin un orden explicado, la detección de salud (EP-002) no se traduce en "qué
atender primero" — el reto pide explícitamente un criterio claro y defendible.

**Objetivos PRD que atiende**: "ofrezca una vista de seguimiento con un criterio de priorización
explícito y defendible" (§5); "mostrar un criterio claro de priorización" (Enunciado).

**Capabilities incluidas**: score de priorización visible, vista de cartera ordenada
con filtros, SSE (§6 Must); panel de priorización (§5).

**Éxito medible**: evaluador identifica en <30s qué proyectos requieren atención; criterio explicable en una frase (§5); el dashboard refleja cambios en tiempo real (§10 Requisitos Técnicos, SSE).

---

## EP-004 — Gestión de Tareas por Proyecto

**Resumen**: alta/consulta de tareas asociadas a un proyecto (abiertas, vencidas, bloqueadas),
alimentando el motor de salud (EP-002) con `open_tasks`/`overdue_tasks`.

**Por qué existe**: el enunciado exige mostrar "cómo planteaste el manejo de tareas" en el video, y
el dataset trae Tasks.csv como entidad de primer nivel — sin esto, `overdue_tasks` en el motor de
salud sería un campo estático sin fuente real.

**Objetivos PRD que atiende**: historia "quiero ver las tareas de un proyecto... para entender por
qué un proyecto está en el estado en que está" (§3); "cómo planteaste el manejo de tareas"
(Enunciado, qué debe mostrar el video).

**Capabilities incluidas**: vista de tareas por proyecto (§6 Must: "CRUD de Tareas asociadas a proyectos").

**Éxito medible**: cada proyecto de ejemplo muestra sus tareas reales con estado
abierta/vencida/bloqueada, consistentes con los contadores usados por EP-002.

---

## EP-005 — Carga de Datos Semilla (dataset Aztec)

**Resumen**: importación del dataset real (Projects + Tasks, y Team si EP-004 lo requiere) como
datos de ejemplo con estados y prioridades distintos.

**Por qué existe**: el reto exige "ejemplos de proyectos con distintos estados y prioridades" como
entregable — sin seed real, el resto de épicas no tiene con qué demostrarse.

**Objetivos PRD que atiende**: "ejemplos de proyectos con distintos estados y prioridades"
(Enunciado, qué debes entregar); "carga de datos semilla desde el dataset provisto" (§6).

**Capabilities incluidas**: carga de datos semilla desde CSV (§6 Must); requisito técnico
de soporte a carga CSV (§10).

**Éxito medible**: existen datos de ejemplo cargados desde el dataset real con estados y
prioridades distintos (AC producto, sección 9).

---

## EP-006 — Administración y Seguridad (JWT)

**Resumen**: Autenticación JWT y sistema base de roles/permisos (`AdminPage`, `SettingsPage`).

**Por qué existe**: Garantiza la seguridad y la correcta asignación de responsables.

**Objetivos PRD que atiende**: "Como Administrador, quiero gestionar usuarios, roles y permisos".

**Capabilities incluidas**: Auth JWT, UI de Admin y Settings.

---

## EP-007 — Trazabilidad y Configuración

**Resumen**: Audit Trail (historial de cambios) y gestión de plantillas de proyectos.

**Por qué existe**: Provee contexto histórico de evolución y agiliza la creación estandarizada.

**Objetivos PRD que atiende**: "Como Auditor, quiero un registro de cambios...".

**Capabilities incluidas**: Log de auditoría por proyecto, CRUD de templates.

---

## EP-008 — Vista de Equipo (Team Capacity)

**Resumen**: Análisis de carga de trabajo por miembro del equipo (`TeamCapacityPage`).

**Por qué existe**: Permite identificar cuellos de botella humanos que impactan la salud del proyecto.

**Objetivos PRD que atiende**: "Vista por miembro del equipo".

**Capabilities incluidas**: Tabla de equipo y asignaciones de tareas.

---

## EP-009 — Integraciones (Webhooks)

**Resumen**: Capacidad de emitir notificaciones vía Webhook hacia sistemas externos.

**Por qué existe**: Permite extender el sistema hacia herramientas como Slack o Zapier.

**Objetivos PRD que atiende**: Integración de Webhooks (Could).

**Capabilities incluidas**: Configuración de endpoint, emisión on-change.

---


## Matriz Épica × Objetivo-PRD

| Objetivo PRD (sección 1 / Enunciado) | EP-001 | EP-002 | EP-003 | EP-004 | EP-005 | EP-006 | EP-007 | EP-008 | EP-009 |
|---|---|---|---|---|---|---|---|---|---|
| Crear/actualizar proyectos | ✓ | | | | | | | | |
| Edición inline en el tablero | ✓ | | | | | | | | |
| Detectar en riesgo/bloqueados | | ✓ | | | | | | | |
| Vista de seguimiento / priorización | | | ✓ | | | | | | |
| Manejo de tareas (mostrar en video)| | | | ✓ | | | | | |
| Datos de ejemplo (CSV) | | | | | ✓ | | | | |
| Seguridad y Roles | | | | | | ✓ | | | |
| Trazabilidad (Audit Trail) | | | | | | | ✓ | | |
| Gestión de Plantillas | | | | | | | ✓ | | |
| Carga de equipo | | | | | | | | ✓ | |
| Integración Webhooks | | | | | | | | | ✓ |

## Infraestructura (Integrada)

Docker-compose (HU-024, HU-025, HU-027) integrado en EP-001. React frontend docker (HU-026) integrado en EP-003. No hay épica EP-010 independiente.

## Huérfanos

- **Objetivos sin épica**: Ninguno (todos cubiertos por EP-001 a EP-009).
- **Épicas sin objetivo claro**: Ninguna.

