# Capability: health-status-ui-badges

Frontend UI component displaying project health status with visual distinction (color, icon, text).

## ADDED Requirements

### Requirement: Health Badge Component
The system SHALL render a reusable health badge component that displays status with consistent visual treatment.

**Visual Specification**:
- Color coding:
  - **ok**: Green background (#10b981)
  - **blocked**: Red background (#ef4444)
  - **at_risk**: Amber background (#f59e0b)
  - **no_next_step**: Gray background (#6b7280)
- Text: Status name in readable label (e.g., "Bloqueado", "En riesgo")
- Icon: Status-appropriate icon (block icon for blocked, warning for at-risk, etc.)
- Tooltip: Hover displays evidence (why this status)

#### Scenario: Blocked project renders correctly
- **WHEN** health component receives status="blocked"
- **THEN** background color is red
- **AND** text displays "Bloqueado"
- **AND** hover tooltip shows evidence

#### Scenario: At-risk project renders correctly
- **WHEN** health component receives status="at_risk"
- **THEN** background color is amber
- **AND** text displays "En riesgo"

#### Scenario: No-next-step renders correctly
- **WHEN** health component receives status="no_next_step"
- **THEN** background color is gray
- **AND** text displays "Sin rumbo"

#### Scenario: OK project renders correctly
- **WHEN** health component receives status="ok"
- **THEN** background color is green
- **AND** text displays "Ok"

### Requirement: Health Badge on Project List
The system SHALL display health badge on each project in the project list view.

#### Scenario: List shows health badges for all projects
- **WHEN** ProjectListPage loads
- **THEN** each project row shows health badge
- **AND** badges reflect each project's current health status

#### Scenario: Health badge filters work
- **WHEN** user filters projects by status (e.g., show "blocked" only)
- **THEN** only projects with that health status appear
- **AND** badge colors match filter selection

### Requirement: Health Badge on Project Detail View
The system SHALL display health status prominently on the project detail page.

#### Scenario: Detail page shows health with evidence
- **WHEN** ProjectDetailPage loads for a project
- **THEN** health badge displays near project name
- **AND** below badge, evidence list explains classification

#### Scenario: Evidence is readable
- **WHEN** viewing project detail with blocked status
- **THEN** user sees one or more evidence statements:
  - e.g., "Project has blockers registered"
  - e.g., "Project has 5 overdue tasks (threshold: 3)"

### Requirement: Health Status Updates in Real-Time
The system SHALL update health badge when project is edited and saved.

#### Scenario: Edit project blockers, badge updates
- **WHEN** user edits project form and adds blockers
- **AND** clicks "Save"
- **THEN** after save completes, health badge changes to red "Bloqueado"
- **AND** no page reload required (inline update)

#### Scenario: Edit project siguiente_paso, badge updates
- **WHEN** user clears siguiente_paso field in edit form
- **AND** clicks "Save"
- **THEN** health badge changes to gray "Sin rumbo"

### Requirement: Accessible Health Indicator
The system SHALL ensure health badges are accessible to screen readers.

#### Scenario: Screen reader announces status
- **WHEN** screen reader focuses health badge
- **THEN** it announces: e.g., "Blocked, Project has blockers registered"

#### Scenario: Color not sole indicator
- **WHEN** health badge is displayed
- **THEN** text label also conveys status (not just color)
- **AND** icon reinforces status visually
