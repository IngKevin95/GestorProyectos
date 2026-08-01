## Why

The Project Management System requires automated health detection to classify projects by risk status without manual review. Reto explicit requirement: "detect projects that are blocked, at risk, or without clear next steps". Current state: Projects have operational fields (blockers, target_date, open_tasks) but no automated classification. This creates manual overhead for Delivery Leads checking each project individually.

By implementing deterministic rules, Delivery Leads get actionable alerts in <30s per project, enabling faster intervention.

## What Changes

- **New**: Project health status engine (backend service) evaluates three classification rules:
  1. **Blocked**: Project has blockers OR overdue_tasks >= threshold (3+)
  2. **At Risk**: target_date <= 7 days AND open_tasks > 0
  3. **No Clear Next Step**: siguiente_paso field is empty or whitespace-only
- **New**: Health status field on Project model (enum: `ok`, `blocked`, `at_risk`, `no_next_step`)
- **New**: Backend endpoint GET `/api/projects/{id}/health` returns classification + evidence
- **New**: UI badges display health status on project list with distinct colors (red=blocked, amber=at_risk, gray=no_next_step, green=ok)
- **Modified**: Project update endpoint triggers health re-evaluation after save

No breaking changes. All rules parametrizable (thresholds in config).

## Capabilities

### New Capabilities
- `health-detection-rules`: Deterministic engine that classifies projects into four health states (blocked, at_risk, no_next_step, ok) based on project attributes (blockers, overdue_tasks, target_date, siguiente_paso).
- `project-health-api`: Backend HTTP endpoint returning health status + evidence (which rule triggered, which field caused classification).
- `health-status-ui-badges`: React component displaying health status with distinct visual treatment (color, icon, tooltip) on project list and detail views.

### Modified Capabilities
- `project-crud`: Extend Project model to include `health_status` field (enum). Health re-evaluates on create/update.

## Impact

**Backend**:
- SQLAlchemy model: add `health_status` column (enum: ok, blocked, at_risk, no_next_step)
- New service: `HealthDetectionService` with rule engine
- New endpoint: GET `/api/projects/{id}/health`
- Modify POST/PUT `/api/projects/` to call health re-evaluation

**Frontend**:
- Add health badge component (reusable)
- Modify ProjectListRow to display badge
- Modify ProjectDetailPage to show health status and evidence panel

**Testing**:
- Unit tests: all three rules (blocker, date+tasks, next_step)
- Integration tests: health updates when project fields change
- E2E: create/edit projects, verify health status updates in UI

**Configuration**:
- Environment vars: HEALTH_OVERDUE_THRESHOLD (default: 3), HEALTH_RISK_DAYS (default: 7)

## Trazabilidad

**Épica**: EP-002 (Motor de Detección de Salud)  
**Historias de Usuario**:
- HU-004: Detectar automáticamente proyectos bloqueados
- HU-005: Detectar automáticamente proyectos en riesgo
- HU-006: Detectar automáticamente proyectos sin siguiente paso claro

**PRD Sección**: §5 (Objetivos), §6 (Must: motor de detección de riesgo con reglas explícitas)
