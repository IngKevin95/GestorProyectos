# Capability: project-health-api

HTTP endpoint that returns project health classification and evidence.

## ADDED Requirements

### Requirement: GET Health Endpoint
The system SHALL expose GET /api/projects/{project_id}/health that returns current health classification.

**HTTP Contract**:
- Method: GET
- Path: /api/projects/{project_id}/health
- Auth: Required (Bearer token)
- Response: 200 OK with JSON body

#### Scenario: Retrieve health for valid project
- **WHEN** GET /api/projects/{uuid}/health with valid project_id
- **THEN** response status is 200
- **AND** response includes { status, evidence, details }

#### Scenario: Project not found
- **WHEN** GET /api/projects/{invalid_uuid}/health
- **THEN** response status is 404
- **AND** error code is "NOT_FOUND"

#### Scenario: Unauthorized access
- **WHEN** GET /api/projects/{other_user_project}/health without auth
- **THEN** response status is 401 or 403
- **AND** error code is "FORBIDDEN"

### Requirement: Health Response Schema
The response SHALL include status, evidence, and details object.

**Response Body**:
```json
{
  "project_id": "uuid-string",
  "status": "ok" | "blocked" | "at_risk" | "no_next_step",
  "evidence": ["string", "string"],
  "details": {
    "has_blockers": boolean,
    "overdue_tasks": number,
    "open_tasks": number,
    "days_to_deadline": number | null,
    "next_step_empty": boolean
  }
}
```

#### Scenario: Response includes all fields
- **WHEN** querying health endpoint
- **THEN** response includes all fields: project_id, status, evidence, details
- **AND** status is one of: ok, blocked, at_risk, no_next_step

#### Scenario: Evidence is non-empty array
- **WHEN** project is classified with any status
- **THEN** evidence is array with at least one element
- **AND** each element explains why classification was assigned

### Requirement: Health Synchronously Reflects Project State
The system SHALL return health based on current project attributes, not cached or stale data.

#### Scenario: Updated blockers reflected immediately
- **WHEN** project blockers are updated via PUT /api/projects/{id}
- **AND** subsequently GET /api/projects/{id}/health is called
- **THEN** response includes new blockers in evidence

#### Scenario: Deleted blockers remove blocked status
- **WHEN** project blockers are cleared (set to "")
- **AND** project was previously "blocked"
- **THEN** subsequent GET returns status "ok" (or other non-blocked state)

### Requirement: Endpoint Accessible to All Authenticated Users
The system SHALL allow any authenticated user to query health for projects they own.

#### Scenario: User can query own project health
- **WHEN** project owner calls GET /api/projects/{own_project_id}/health
- **THEN** request succeeds with 200

#### Scenario: User cannot query others' project health
- **WHEN** user B calls GET /api/projects/{user_A_project_id}/health
- **THEN** response status is 403 (Forbidden)
