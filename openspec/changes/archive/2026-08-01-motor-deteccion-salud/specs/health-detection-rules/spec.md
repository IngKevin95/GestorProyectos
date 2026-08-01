# Capability: health-detection-rules

Deterministic engine that classifies projects into four health states based on project attributes.

## ADDED Requirements

### Requirement: Detect Blocked Projects
The system SHALL classify a project as "blocked" if the project has blockers registered OR overdue tasks exceed threshold.

**Definition of Blocked**:
- `blockers` field (text) is non-empty AND non-whitespace, OR
- `overdue_tasks_count >= THRESHOLD` (default threshold: 3)

#### Scenario: Project with blockers
- **WHEN** project has blockers="Pending legal approval"
- **THEN** health status is "blocked"
- **AND** evidence includes "Project has blockers"

#### Scenario: Project with excessive overdue tasks
- **WHEN** project has overdue_tasks_count=5 (threshold=3)
- **THEN** health status is "blocked"
- **AND** evidence includes "Project has 5 overdue tasks (threshold: 3)"

#### Scenario: Project with no blockers and few overdue
- **WHEN** project has blockers="" AND overdue_tasks_count=1
- **THEN** health status is NOT "blocked"

#### Scenario: Multiple blockers
- **WHEN** project has blockers="Await budget; Missing senior resource"
- **THEN** health status is "blocked"

### Requirement: Detect At-Risk Projects
The system SHALL classify a project as "at_risk" if target deadline is within threshold days AND project has open tasks.

**Definition of At-Risk**:
- `target_date <= TODAY + RISK_DAYS` (default: 7 days), AND
- `open_tasks_count > 0`

#### Scenario: Close deadline with open tasks
- **WHEN** project has target_date=6 days from today AND open_tasks_count=2
- **THEN** health status is "at_risk"
- **AND** evidence explains deadline proximity and open task count

#### Scenario: Close deadline but no open tasks
- **WHEN** project has target_date=6 days from today AND open_tasks_count=0
- **THEN** health status is NOT "at_risk"

#### Scenario: Far deadline with many open tasks
- **WHEN** project has target_date=30 days from today AND open_tasks_count=5
- **THEN** health status is NOT "at_risk"

#### Scenario: Exactly at 7-day boundary
- **WHEN** project has target_date exactly 7 days from today AND open_tasks_count=1
- **THEN** health status is "at_risk" (boundary inclusive)

### Requirement: Detect Projects Without Clear Next Step
The system SHALL classify a project as "no_next_step" if the siguiente_paso field is empty or contains only whitespace.

**Definition of No Clear Next Step**:
- `siguiente_paso` is null, empty string, or contains only whitespace

#### Scenario: Empty siguiente_paso
- **WHEN** project has siguiente_paso=""
- **THEN** health status is "no_next_step"

#### Scenario: Whitespace-only siguiente_paso
- **WHEN** project has siguiente_paso="   " (spaces only)
- **THEN** health status is "no_next_step"

#### Scenario: siguiente_paso defined
- **WHEN** project has siguiente_paso="Review spec with client"
- **THEN** health status is NOT "no_next_step"

### Requirement: Default to Healthy
The system SHALL classify a project as "ok" if none of the above conditions apply.

#### Scenario: Project meets no alert criteria
- **WHEN** project has no blockers, deadline is far, open_tasks is 0, and siguiente_paso is defined
- **THEN** health status is "ok"
- **AND** evidence is ["Project in healthy state"]

### Requirement: Priority-Ordered Evaluation
The system SHALL evaluate rules in priority order: BLOCKED > AT_RISK > NO_NEXT_STEP > OK. First matching rule wins.

#### Scenario: Project matches multiple conditions
- **WHEN** project has blockers AND close deadline AND empty siguiente_paso
- **THEN** health status is "blocked" (not at_risk, not no_next_step)

### Requirement: Configurable Thresholds
The system SHALL support configurable thresholds for overdue task count and risk days via environment variables.

- `HEALTH_OVERDUE_THRESHOLD` (default: 3)
- `HEALTH_RISK_DAYS` (default: 7)

#### Scenario: Custom threshold respected
- **WHEN** HEALTH_OVERDUE_THRESHOLD=5
- **THEN** project with overdue_tasks_count=4 is NOT blocked
- **AND** project with overdue_tasks_count=5 is blocked

### Requirement: Return Evidence
The system SHALL return evidence array explaining which rule triggered classification.

#### Scenario: Evidence includes trigger
- **WHEN** detecting health status for any project
- **THEN** response includes evidence: array of strings describing which rules matched

### Requirement: Handle Missing Task Data Gracefully
The system SHALL default to zero (0) for overdue_tasks_count and open_tasks_count if tasks table integration not yet available.

#### Scenario: No tasks integrated yet
- **WHEN** project has no associated tasks (EP-004 not yet complete)
- **THEN** health detection uses overdue_tasks_count=0, open_tasks_count=0
- **AND** projects are never marked "blocked" due to task count alone
