# Implementation Tasks — EP-002 Motor de Detección de Salud

## 1. Backend Model & Migration

- [x] 1.1 Add health_status Enum column to Project model (db_models.py)
- [x] 1.2 Create Alembic migration 003_add_health_detection.py for PostgreSQL
- [x] 1.3 Update ProjectResponse schema to include health_status field

## 2. Health Detection Service

- [x] 2.1 Create HealthDetectionService with detect_health() method
- [x] 2.2 Implement rule: BLOCKED (blockers OR overdue_tasks >= 3)
- [x] 2.3 Implement rule: AT_RISK (target_date <= 7 days AND open_tasks > 0)
- [x] 2.4 Implement rule: NO_NEXT_STEP (siguiente_paso empty/whitespace)
- [x] 2.5 Implement rule priority: BLOCKED > AT_RISK > NO_NEXT_STEP > OK
- [x] 2.6 Support configurable thresholds (env vars HEALTH_OVERDUE_THRESHOLD, HEALTH_RISK_DAYS)
- [x] 2.7 Return evidence array explaining classification

## 3. Backend Endpoints & Integration

- [x] 3.1 Add GET /api/projects/{id}/health endpoint
- [x] 3.2 Integrate health evaluation in POST /api/projects/ (create_project)
- [x] 3.3 Integrate health re-evaluation in PUT /api/projects/{id} (update_project)
- [x] 3.4 Update AuditLog to capture health_status changes
- [x] 3.5 Verify endpoint RLS (users can only query their own projects)

## 4. Backend Testing

- [x] 4.1 Run unit tests: pytest backend/tests/test_health_detection.py
- [x] 4.2 Verify HU-004 AC tests (5 blocked scenarios) pass
- [x] 4.3 Verify HU-005 AC tests (4 at-risk scenarios) pass
- [x] 4.4 Verify HU-006 AC tests (5 no_next_step scenarios) pass
- [x] 4.5 Smoke test: Create project, verify health_status in response
- [x] 4.6 Integration test: Update project blockers, verify health re-eval
- [x] 4.7 Edge case: Whitespace-only siguiente_paso treated as empty

## 5. Database

- [x] 5.1 Run alembic upgrade head to apply migration
- [x] 5.2 Verify project_health_status enum type created in PostgreSQL
- [x] 5.3 Verify health_status column added to projects table
- [x] 5.4 Verify default value "ok" applied to existing rows

## 6. Frontend (Deferred to UI Epic — EP-003)

- [ ] 6.1 Create HealthBadge component (reusable, accepts status + evidence)
- [ ] 6.2 Add color mapping: ok=green, blocked=red, at_risk=amber, no_next_step=gray
- [ ] 6.3 Display badge on ProjectListRow
- [ ] 6.4 Display badge + evidence on ProjectDetailPage
- [ ] 6.5 Fetch health via GET /api/projects/{id}/health on mount
- [ ] 6.6 Update health badge on POST/PUT response
- [ ] 6.7 Add accessibility: screen reader announces status + evidence

## 7. Documentation & Validation

- [x] 7.1 Document rules in HealthDetectionService docstrings
- [x] 7.2 Update HU-004 status to "lista"
- [x] 7.3 Update HU-005 status to "lista"
- [x] 7.4 Update HU-006 status to "lista"
- [x] 7.5 Create OpenSpec proposal.md with capabilities mapping
- [x] 7.6 Create OpenSpec design.md with technical decisions
- [x] 7.7 Create OpenSpec specs (4 capability specs)
- [x] 7.8 Manual testing: Verify health detection with real project data

## 8. Code Review & QA

- [x] 8.1 Self-review code for style, naming, consistency
- [x] 8.2 Check for SQL injection, auth bypass (RLS verification)
- [x] 8.3 Verify no breaking changes to existing Project endpoints
- [x] 8.4 Ensure health_status is read-only (not settable by client)
- [x] 8.5 Performance: health detection completes in < 50ms

## 9. Deployment & Integration

- [x] 9.1 Merge feature/ep-002-motor-deteccion to develop
- [x] 9.2 Create PR with summary of changes
- [x] 9.3 Verify CI/CD pipeline passes (tests, linting, type checks)
- [x] 9.4 Archive OpenSpec change
- [x] 9.5 Plan next epic: EP-003 (UI dashboard + priority visualization)
