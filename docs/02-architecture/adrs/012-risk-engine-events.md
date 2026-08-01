# ADR-012 — Risk Engine Events (Disparadores del Motor de Riesgo)

## Estado
**Aceptado** (2026-08-01)

## Contexto
El motor de salud (EP-002, HU-004/005/006) clasifica proyectos como Bloqueado, En Riesgo o Sin Rumbo. Debe evaluarse:
- **Cuándo**: En qué momento se recalcula
- **Qué dispara**: Qué eventos activan una reevaluación
- **Dónde corre**: Backend (determinista, stateless)

## Decisión
Implementar evaluación **lazy + eventos dirigidos** con dos triggers:

### 1. Cron Job (Daily, 00:00 UTC)
Recalcula salud de **todos** los proyectos una vez al día. Garantiza coherencia global.
- **Cuándo**: `0 0 * * * UTC` (FastAPI APScheduler)
- **Operación**: SELECT todos, aplica 3 reglas, UPDATE health + timestamp de recalc
- **Costo**: O(n) proyectos, típicamente <1s para 50 proyectos

### 2. Eventos Ad-Hoc (Proyecto actualizado)
Recalcula salud de **un proyecto** inmediatamente tras cambio:
- **Disparadores**:
  - `project.update()`: cambio en `blockers`, `target_date`, `status`
  - `task.update()`: cambio en `status`, `due_date` (afecta `overdue_tasks`, `open_tasks`)
  - `task.create()`: nueva tarea abierta (afecta `open_tasks`)
  - `task.delete()`: eliminación (afecta contadores)
- **Evaluación**: Dentro de transacción DB (trigger SQL o app logic antes de commit)
- **Retorno**: Nuevo `health` estado al cliente

### 3. Reglas (Idénticas en ambos casos)
```
if (len(blockers) > 0 or overdue_tasks >= 3 or blocked_tasks > 0):
    health = "Bloqueado"
elif (target_date <= today + 7d and open_tasks > 0):
    health = "En riesgo"
elif (siguiente_paso is NULL or siguiente_paso.strip() == ""):
    health = "Sin rumbo"
else:
    health = "Ok"
```

## Alternativas Rechazadas
- **Evaluación on-demand** (cada lectura): costo alto, incoherencia temporal
- **Event-driven puro** (sin Cron): riesgo de divergencia si eventos se pierden
- **IA/heurística**: viola requisito de determinismo (ADR-003)

## Consecuencias

### Positivas
- Recálculo automático diario garantiza coherencia
- Feedback inmediato en actualizaciones (UX)
- Lógica determinista, testeable, auditable

### Negativas
- Cron job es punto único de fallo (si no corre, drift posible hasta próximo ciclo)
- Requiere sincronización: eventos + Cron pueden sobreescribirse si ocurren simultáneamente
- Latencia de hasta 24h si solo confía en Cron (mitigado por eventos ad-hoc)

## Implementación
- **Backend**: FastAPI APScheduler para Cron, lógica de actualización en app y triggers
- **DB**: Triggers SQL opcionales para integridad (migración futura)
- **Logging**: Cada recalc registra timestamp y trigger (Cron vs evento)
- **Test**: Casos de sincronización concurrente

## Referencias
- EP-002: Motor de Detección de Salud
- HU-004, HU-005, HU-006: Reglas de detección
- ADR-003: Motor de salud persistido en BD
- ADR-008: PostgreSQL + SQLAlchemy
