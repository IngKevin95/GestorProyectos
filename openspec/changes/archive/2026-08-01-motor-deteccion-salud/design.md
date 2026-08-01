## Context

Current system (EP-001 complete): Projects have operational fields (blockers, target_date, open_tasks_count, siguiente_paso) but no automated classification. Delivery Leads review projects manually to identify risks — expensive, error-prone, and non-scalable.

Goal: Add a deterministic, zero-latency health detection layer that runs synchronously on project create/update, so every UI render has current health without polling or async computation.

Constraints:
- Must be deterministic (no ML, no randomness). Rules can be audited and explained to stakeholders.
- Must run in < 50ms (inline in request, not background job).
- Must handle null/missing task data gracefully (EP-004 Tasks integration is a later epic).

## Goals / Non-Goals

**Goals:**
1. Classify all projects into exactly one health state: ok, blocked, at_risk, no_next_step.
2. Expose classification rules to frontend so Delivery Lead understands why project is flagged.
3. Update health status synchronously on project save, visible in next UI render.
4. Support future task integration (overdue_tasks, open_tasks) without service rewrite.

**Non-Goals:**
- Prioritization scoring (that's EP-003). Health is binary state, not a rank.
- Alerts / notifications (no email/Slack yet).
- Task-based health (EP-004 will feed task counts; this epic assumes 0 tasks until then).
- Historical tracking of health transitions (audit_log captures it, but no analytics dashboard).

## Decisions

### Decision 1: Service-based Rule Engine (not SQL trigger, not frontend)

**Choice**: Implement `HealthDetectionService` in Python backend with stateless `detect_health(project)` method.

**Rationale**:
- Keeps logic in one place, easier to audit and test.
- Enables future reuse (batch re-evaluation, async scoring, etc.).
- Avoids tight coupling to ORM or database.

**Alternatives Considered**:
- SQL trigger: Would require maintaining rules in two languages (Python + SQL). Rejected.
- Frontend computed: Violates separation of concerns. Server is source of truth. Rejected.
- Async task queue: Overkill for 50ms compute. Adds complexity, race conditions. Rejected.

### Decision 2: Four-State Enum (not free-text, not probability score)

**Choice**: Enum ["ok", "blocked", "at_risk", "no_next_step"] stored on Project model.

**Rationale**:
- Enum prevents invalid states. Queryable for filters/dashboards.
- Four states map 1:1 to PRD requirements (§12 AC).
- Simplifies UI logic: no thresholds, no conditional display. State = display.

**Alternatives Considered**:
- Free-text: Would require validation everywhere. Rejected.
- Probability score (0.0-1.0): Implies fuzzy logic. PRD asks for discrete detection, not ranking. Rejected.
- Health + severity: Overkill. Single enum sufficient. Rejected.

### Decision 3: Priority-Ordered Rules (BLOCKED > AT_RISK > NO_NEXT_STEP > OK)

**Choice**: Evaluate in priority order. First rule that matches wins. Return immediately.

**Rationale**:
- Avoids ambiguity: project cannot be both "at_risk" and "no_next_step" simultaneously.
- Blocked is most critical, so evaluated first.
- Matches Delivery Lead mental model: "if blocked, don't care about deadline pressure".

**Priority Justification**:
1. BLOCKED: Immediate intervention needed. Overrides everything.
2. AT_RISK: Escalation needed if deadline is close. But less urgent than blocked.
3. NO_NEXT_STEP: Requires decision, but can wait if deadline is far.
4. OK: Default state.

### Decision 4: Configurable Thresholds (env vars, not hardcoded)

**Choice**: `HEALTH_OVERDUE_THRESHOLD=3`, `HEALTH_RISK_DAYS=7` via environment variables.

**Rationale**:
- Allows production tuning without redeployment (almost).
- Defaults are reasonable (3 overdue tasks, 7 days to deadline).
- Future: move to database settings table if governance requires audit trail.

### Decision 5: Inline Re-evaluation (synchronous, no caching)

**Choice**: Call `HealthDetectionService.update_project_health()` in POST/PUT before commit.

**Rationale**:
- Frontend sees updated health immediately after save.
- No cache invalidation logic.
- Deterministic: same project state always produces same health.

**Trade-off**: Adds ~5-10ms per request. Acceptable because service is O(1), not O(N).

## Risks / Trade-offs

**[Risk] Task count not available until EP-004 complete**
- Mitigation: Service accepts `overdue_tasks_count=0` as default. Tests pass with placeholders. When EP-004 ships, add task query logic to endpoint without changing service interface.

**[Risk] Multiple projects updating simultaneously might compute stale health**
- Mitigation: Each request is isolated. No distributed state. Database commit enforces consistency. Loss is minimal (1 request stale).

**[Risk] Frontend displaying outdated health during page load**
- Mitigation: Non-issue. Backend always fresh. Frontend fetches on mount, or subscribes to SSE (EP-003).

**[Risk] Rules tuning becomes political (what counts as "at risk"?)**
- Mitigation: Document thresholds in ADR. Allow stakeholders to propose changes as discrete PRs. Threshold is a business decision, not engineering.

## Migration Plan

1. **Phase A** (this epic, before merge):
   - Add `health_status` column to projects table (migration 003).
   - Deploy HealthDetectionService.
   - Deploy GET /api/projects/{id}/health endpoint.
   - POST/PUT projects call service on save.
   - Existing projects get health evaluated at save time.

2. **Phase B** (EP-003 frontend):
   - UI displays health badge on project list + detail.
   - Colors: green=ok, red=blocked, amber=at_risk, gray=no_next_step.

3. **Phase C** (EP-004 tasks):
   - Tasks endpoint feeds overdue/open task counts to health engine.
   - No service change; just pass counts to detect_health().

**Rollback**: If health feature breaks, `health_status` column defaults to "ok". Queries unaffected.

## Open Questions

1. Should health re-evaluation be async (queue) in high-traffic production? Decision: Not yet. Monitor metrics first.
2. Should old projects have health backfilled on deploy? Decision: Evaluated lazily on next save. No batch job.
3. Should health transitions trigger webhooks? Decision: Out of scope (EP-009). Audit log captures for now.
