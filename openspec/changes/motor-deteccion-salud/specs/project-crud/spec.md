# Capability: project-crud

CRUD operations for project management (from EP-001), modified to include health status detection.

## ADDED Requirements

### Requirement: Health Status Auto-Evaluation on Create
The system SHALL automatically evaluate and set health_status when a new project is created.

#### Scenario: New project gets health evaluated
- **WHEN** POST /api/projects/ with project data (blockers, target_date, siguiente_paso)
- **THEN** project is created
- **AND** health_status is evaluated automatically (based on provided fields)
- **AND** response includes health_status field

#### Scenario: New project with blockers is marked blocked
- **WHEN** creating project with blockers="Pending approval"
- **THEN** returned project has health_status="blocked"

#### Scenario: New project without next step is marked no_next_step
- **WHEN** creating project with siguiente_paso=""
- **THEN** returned project has health_status="no_next_step"

### Requirement: Health Status Auto-Evaluation on Update
The system SHALL automatically re-evaluate health_status when an existing project is updated.

#### Scenario: Update blockers re-evaluates health
- **WHEN** PUT /api/projects/{id} updating blockers field
- **THEN** health_status is re-evaluated
- **AND** response includes updated health_status

#### Scenario: Clear blockers removes blocked status
- **WHEN** PUT /api/projects/{id} setting blockers=""
- **AND** project was previously "blocked"
- **THEN** health_status is re-evaluated and changes to non-blocked state

#### Scenario: Set siguiente_paso removes no_next_step status
- **WHEN** PUT /api/projects/{id} with siguiente_paso="New next step"
- **AND** project was previously "no_next_step"
- **THEN** health_status is re-evaluated (status changes or remains ok)

### Requirement: health_status Included in Project Responses
The system SHALL include health_status field in all project responses (GET, POST, PUT).

#### Scenario: List projects includes health_status
- **WHEN** GET /api/projects/
- **THEN** each project in response includes health_status field

#### Scenario: Get single project includes health_status
- **WHEN** GET /api/projects/{id}
- **THEN** response includes health_status field

#### Scenario: Create response includes health_status
- **WHEN** POST /api/projects/
- **THEN** response includes health_status

#### Scenario: Update response includes health_status
- **WHEN** PUT /api/projects/{id}
- **THEN** response includes updated health_status

### Requirement: Audit Log Captures Health Transitions
The system SHALL log health_status changes in AuditLog for compliance and debugging.

#### Scenario: Health change recorded in audit trail
- **WHEN** project health_status changes from one state to another
- **THEN** AuditLog entry is created with:
  - action="UPDATE"
  - old_value includes previous health_status
  - new_value includes new health_status

### Requirement: health_status Field is Read-Only
The system SHALL NOT accept health_status in project create/update requests. Clients cannot set it directly.

#### Scenario: Direct health_status assignment is ignored
- **WHEN** POST /api/projects/ with explicit health_status="ok"
- **THEN** health_status is ignored and auto-computed instead

#### Scenario: PUT cannot override health
- **WHEN** PUT /api/projects/{id} with health_status="ok" while blockers is set
- **THEN** health_status is computed based on blockers (not client value)
