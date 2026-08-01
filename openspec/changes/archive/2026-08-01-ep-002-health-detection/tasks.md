# Tasks — EP-002 Health Detection Engine

## Phase 1: Schema & Model (Foundation)

### T1.1: Database Migration
- **Description**: Agregar columna `health` a tabla `projects`
- **File**: `backend/migrations/004_add_health_column.py`
- **SQL**: `ALTER TABLE projects ADD COLUMN health VARCHAR(50) DEFAULT 'Ok' NOT NULL;`
- **Acceptance**: Migration runs without error; column exists in schema
- **Dependency**: EP-001 (projects table exists)

### T1.2: Update Project Model
- **Description**: Agregar field `health: str` al modelo SQLAlchemy Project
- **File**: `backend/app/models.py`
- **Change**: `health: Mapped[str] = mapped_column(String(50), default="Ok")`
- **Acceptance**: Model compiles; Pydantic schema includes health field
- **Dependency**: T1.1 (migration exists)

---

## Phase 2: Business Logic (Core Capabilities)

### T2.1: Create health.py Service
- **Description**: Crear módulo `backend/app/services/health.py` con 4 funciones puras
- **File**: `backend/app/services/health.py`
- **Functions**:
  ```python
  def detect_blocked(blockers: str, overdue_tasks: int) -> bool
  def detect_at_risk(target_date: date, open_tasks: int) -> bool
  def detect_no_next_step(siguiente_paso: str) -> bool
  def calculate_health(project: Project) -> str
  ```
- **Specs**: Reference `specs/detect-blocked-logic.md`, `specs/detect-at-risk-logic.md`, `specs/detect-no-next-step-logic.md`
- **Acceptance**: All 4 functions implemented; logic matches design.md
- **Dependency**: T1.2 (Project model exists)

---

## Phase 3: Tests (TDD Red→Green)

### T3.1: Unit Tests for detect_blocked (HU-004)
- **Description**: 5 test cases para detect_blocked
- **File**: `backend/tests/test_ep002_health_detection.py::test_detect_blocked_*`
- **Tests**:
  1. AC1: blockers present → True
  2. AC2: overdue_tasks >= 3 → True
  3. AC3: both empty → False
  4. AC4: multiple blockers → True
  5. AC5: update flow → True (after blockers set)
- **Acceptance**: All 5 tests pass; `pytest -v` shows 5/5 green
- **Dependency**: T2.1 (health.py exists with detect_blocked)

### T3.2: Unit Tests for detect_at_risk (HU-005)
- **Description**: 5 test cases para detect_at_risk
- **File**: `backend/tests/test_ep002_health_detection.py::test_detect_at_risk_*`
- **Tests**:
  1. AC1: target_date <= 7 días + open_tasks > 0 → True
  2. AC2: target_date <= 7 días + open_tasks = 0 → False
  3. AC3: target_date > 7 días + open_tasks > 0 → False
  4. AC4: target_date = exactly 7 días + open_tasks > 0 → True
  5. AC5: update flow → True (after target_date changed)
- **Note**: Use `freezegun` to freeze `date.today()` in tests; reference hoy=2026-07-31
- **Acceptance**: All 5 tests pass; datetime frozen correctly
- **Dependency**: T2.1 (health.py exists with detect_at_risk)

### T3.3: Unit Tests for detect_no_next_step (HU-006)
- **Description**: 5 test cases para detect_no_next_step
- **File**: `backend/tests/test_ep002_health_detection.py::test_detect_no_next_step_*`
- **Tests**:
  1. AC1: siguiente_paso = "" → True
  2. AC2: siguiente_paso defined → False
  3. AC3: create without siguiente_paso → True
  4. AC4: whitespace only → True (trim converts to "")
  5. AC5: update flow → False (after filled)
- **Acceptance**: All 5 tests pass
- **Dependency**: T2.1 (health.py exists with detect_no_next_step)

### T3.4: Integration Tests for calculate_health
- **Description**: Verify orchestration logic
- **Tests**:
  1. Bloqueado + En riesgo → returns "Bloqueado" (priority order)
  2. En riesgo + Sin rumbo → returns "En riesgo"
  3. Sin rumbo alone → returns "Sin rumbo"
  4. All clear → returns "Ok"
- **Acceptance**: All 4 tests pass
- **Dependency**: T3.1, T3.2, T3.3 (all detect_* tests green)

---

## Phase 4: API Integration

### T4.1: Modify GET /projects/{id} Endpoint
- **Description**: Include health field in response
- **File**: `backend/app/routers/projects.py`
- **Change**: Call `calculate_health(project)` before returning; add to response model
- **Response**: `{..., "health": "Bloqueado"|"En riesgo"|"Sin rumbo"|"Ok"}`
- **Acceptance**: GET /api/v1/projects/1 returns health field with correct value
- **Dependency**: T2.1, T3.4 (health logic tested)

### T4.2: Modify GET /projects List Endpoint
- **Description**: Include health field for each project
- **File**: `backend/app/routers/projects.py`
- **Change**: Loop over results; call `calculate_health()` for each
- **Response**: List of projects, each with health field
- **Acceptance**: GET /api/v1/projects returns all projects with health; filtering unaffected
- **Dependency**: T4.1

### T4.3: Modify POST /projects Endpoint
- **Description**: Calculate health when creating project
- **File**: `backend/app/routers/projects.py`
- **Change**: After creating project, call `calculate_health()` before returning
- **Acceptance**: POST /api/v1/projects with minimal fields returns health="Ok" or appropriate state
- **Dependency**: T4.1

### T4.4: Modify PUT /projects/{id} Endpoint
- **Description**: Recalculate health when updating project
- **File**: `backend/app/routers/projects.py`
- **Change**: After updating, recalculate health before returning
- **Acceptance**: PUT /api/v1/projects/1 with changed blockers/target_date/siguiente_paso updates health correctly
- **Dependency**: T4.3

---

## Phase 5: Validation & QA

### T5.1: API Contract Testing
- **Description**: Validate endpoints with Newman/Postman
- **File**: `postman/ep002-health-detection.json` (collection)
- **Tests**:
  1. GET /projects/{id} returns health field
  2. GET /projects returns health for all projects
  3. Health values match business logic (spot check 3 projects)
- **Acceptance**: Newman runs with 0 failures; all assertions pass
- **Dependency**: T4.4

### T5.2: Data Consistency Check
- **Description**: Verify create → read consistency
- **Test**: 
  1. POST project with blockers="X"
  2. GET same project
  3. Verify health="Bloqueado" both times
- **Acceptance**: No inconsistencies; health stable
- **Dependency**: T5.1

### T5.3: Full Test Suite
- **Description**: Run all tests together
- **Command**: `pytest backend/tests/test_ep002_health_detection.py -v --tb=short`
- **Acceptance**: 15+ tests pass; 0 failures; output clean
- **Dependency**: T5.2

---

## Execution Order

1. T1.1 → T1.2 (Schema layer)
2. T2.1 (Business logic)
3. T3.1 → T3.2 → T3.3 (Unit tests, parallel OK)
4. T3.4 (Integration tests)
5. T4.1 → T4.2 → T4.3 → T4.4 (API layer, sequential)
6. T5.1 → T5.2 → T5.3 (Validation, sequential)
