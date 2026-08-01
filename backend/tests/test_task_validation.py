"""
Tests for EP-004 Task Validation — HU-010
RED phase: Validation rules tests.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4


@pytest.fixture
def sample_project(db_session):
    """Create a sample project for validation testing."""
    from backend.src.models.db_models import Project

    project = Project(
        id=uuid4(),
        name="Validation Test Project",
        total_effort=100.0,
        planned_effort=50.0,
        completed_effort=0.0,
        state="ACTIVE",
        responsable="Test User",
        status="Activo",
        user_id=uuid4(),
    )
    db_session.add(project)
    db_session.commit()
    return project


class TestTaskValidation:
    """Test suite for task validation rules (HU-010 AC3, AC5)."""

    def test_title_required(self, test_client, auth_headers, sample_project):
        """HU-010 AC3: Title is required."""
        payload = {
            "assignee": "John",
            "priority": "media",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422
        data = response.json()
        assert "title" in str(data).lower() or "required" in str(data).lower()

    def test_title_empty_string(self, test_client, auth_headers, sample_project):
        """Reject empty string as title."""
        payload = {
            "title": "",
            "assignee": "John",
            "priority": "media",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_title_max_500_chars(self, test_client, auth_headers, sample_project):
        """HU-010 AC5: Title cannot exceed 500 characters."""
        payload = {
            "title": "x" * 501,
            "assignee": "John",
            "priority": "media",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422
        data = response.json()
        assert "title" in str(data).lower() or "500" in str(data).lower() or "max" in str(data).lower()

    def test_title_exactly_500_chars_valid(self, test_client, auth_headers, sample_project):
        """Title with exactly 500 characters should be valid."""
        payload = {
            "title": "x" * 500,
            "assignee": "John",
            "priority": "media",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert len(data["title"]) == 500

    def test_assignee_required(self, test_client, auth_headers, sample_project):
        """Assignee is required."""
        payload = {
            "title": "Test Task",
            "priority": "media",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_priority_invalid_enum(self, test_client, auth_headers, sample_project):
        """Invalid priority value rejected."""
        payload = {
            "title": "Test Task",
            "assignee": "John",
            "priority": "super_high",  # Invalid
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422
        data = response.json()
        assert "priority" in str(data).lower()

    def test_priority_valid_values(self, test_client, auth_headers, sample_project):
        """All valid priority values accepted."""
        valid_priorities = ["alta", "media", "baja"]

        for priority in valid_priorities:
            payload = {
                "title": f"Task with {priority} priority",
                "assignee": "John",
                "priority": priority,
            }

            response = test_client.post(
                f"/api/v1/projects/{sample_project.id}/tasks",
                json=payload,
                headers=auth_headers,
            )

            assert response.status_code == 201, f"Priority '{priority}' should be valid"

    def test_status_valid_values(self, test_client, auth_headers, sample_project):
        """All valid status values accepted."""
        valid_statuses = ["abierta", "vencida", "bloqueada", "cerrada"]

        for status in valid_statuses:
            payload = {
                "title": f"Task with {status} status",
                "assignee": "John",
                "priority": "media",
                "status": status,
            }

            response = test_client.post(
                f"/api/v1/projects/{sample_project.id}/tasks",
                json=payload,
                headers=auth_headers,
            )

            assert response.status_code == 201, f"Status '{status}' should be valid"

    def test_status_invalid_enum(self, test_client, auth_headers, sample_project):
        """Invalid status value rejected."""
        payload = {
            "title": "Test Task",
            "assignee": "John",
            "priority": "media",
            "status": "unknown_status",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_due_date_valid_format(self, test_client, auth_headers, sample_project):
        """Valid ISO date format accepted."""
        due_date = (datetime.now() + timedelta(days=7)).isoformat()
        payload = {
            "title": "Task with due date",
            "assignee": "John",
            "priority": "media",
            "due_date": due_date,
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201

    def test_due_date_invalid_format(self, test_client, auth_headers, sample_project):
        """Invalid date format rejected."""
        payload = {
            "title": "Task with bad date",
            "assignee": "John",
            "priority": "media",
            "due_date": "not-a-date",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_version_required_for_update(self, test_client, auth_headers, sample_project, db_session):
        """Version field required for PUT updates."""
        from backend.src.models.db_models import Task

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="Test",
            status="abierta",
            assignee="John",
            priority="media",
            version=1,
        )
        db_session.add(task)
        db_session.commit()

        payload = {
            "title": "Updated",
            # Missing version
        }

        response = test_client.put(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_version_mismatch_conflict(self, test_client, auth_headers, sample_project, db_session):
        """HU-010 AC4: Version mismatch returns 409 conflict."""
        from backend.src.models.db_models import Task

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="Test",
            status="abierta",
            assignee="John",
            priority="media",
            version=3,  # Current version is 3
        )
        db_session.add(task)
        db_session.commit()

        payload = {
            "title": "Updated",
            "version": 2,  # Client has version 2, but current is 3
        }

        response = test_client.put(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 409
        data = response.json()
        assert "version" in str(data).lower() or "conflict" in str(data).lower()

    def test_version_incremented_on_update(self, test_client, auth_headers, sample_project, db_session):
        """Version is incremented on successful update."""
        from backend.src.models.db_models import Task

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="Test",
            status="abierta",
            assignee="John",
            priority="media",
            version=1,
        )
        db_session.add(task)
        db_session.commit()

        payload = {
            "title": "Updated",
            "version": 1,
        }

        response = test_client.put(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["version"] == 2

    def test_status_default_abierta(self, test_client, auth_headers, sample_project):
        """Status defaults to 'abierta' if not provided."""
        payload = {
            "title": "Task without status",
            "assignee": "John",
            "priority": "media",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "abierta"

    def test_priority_default_media(self, test_client, auth_headers, sample_project):
        """Priority defaults to 'media' if not provided."""
        payload = {
            "title": "Task without priority",
            "assignee": "John",
        }

        response = test_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201
        data = response.json()
        assert data["priority"] == "media"
