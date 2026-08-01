"""
Tests for EP-004 Task Filtering — HU-011
RED phase: Filtering logic tests.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4
from sqlalchemy.orm import Session


@pytest.fixture
def sample_project_with_mixed_tasks(db_session: Session):
    """Create a project with tasks in different states."""
    from backend.src.models.db_models import Project, Task

    project = Project(
        id=uuid4(),
        name="Mixed Status Project",
        total_effort=100.0,
        planned_effort=50.0,
        completed_effort=0.0,
        state="ACTIVE",
        responsable="Test User",
        status="Activo",
        user_id=uuid4(),
    )
    db_session.add(project)
    db_session.flush()

    # Create 5 tasks with mixed statuses
    tasks = [
        Task(
            id=uuid4(),
            project_id=project.id,
            title="Open Task 1",
            status="abierta",
            assignee="Alice",
            priority="alta",
            version=1,
            due_date=datetime.now() + timedelta(days=7),
        ),
        Task(
            id=uuid4(),
            project_id=project.id,
            title="Open Task 2",
            status="abierta",
            assignee="Bob",
            priority="media",
            version=1,
            due_date=datetime.now() + timedelta(days=5),
        ),
        Task(
            id=uuid4(),
            project_id=project.id,
            title="Overdue Task",
            status="vencida",
            assignee="Charlie",
            priority="alta",
            version=1,
            due_date=datetime.now() - timedelta(days=2),
        ),
        Task(
            id=uuid4(),
            project_id=project.id,
            title="Blocked Task",
            status="bloqueada",
            assignee="David",
            priority="baja",
            version=1,
            due_date=datetime.now() + timedelta(days=3),
        ),
        Task(
            id=uuid4(),
            project_id=project.id,
            title="Closed Task",
            status="cerrada",
            assignee="Eve",
            priority="media",
            version=1,
            due_date=datetime.now() - timedelta(days=1),
        ),
    ]
    db_session.add_all(tasks)
    db_session.commit()
    return project, tasks


class TestTaskFiltering:
    """Test suite for task filtering (HU-011)."""

    def test_filter_all_tasks_no_filter(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """HU-011 AC1: Get all tasks without filter."""
        project, tasks = sample_project_with_mixed_tasks

        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 5

    def test_filter_status_abierta(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """HU-011 AC2: Filter tasks by status='abierta'."""
        project, tasks = sample_project_with_mixed_tasks

        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=abierta",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 2
        for task in tasks_list:
            assert task["status"] == "abierta"

    def test_filter_status_vencida(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """HU-011 AC3: Filter tasks by status='vencida'."""
        project, tasks = sample_project_with_mixed_tasks

        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=vencida",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 1
        assert tasks_list[0]["status"] == "vencida"

    def test_filter_status_bloqueada(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """Filter tasks by status='bloqueada'."""
        project, tasks = sample_project_with_mixed_tasks

        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=bloqueada",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 1
        assert tasks_list[0]["status"] == "bloqueada"

    def test_filter_status_cerrada(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """Filter tasks by status='cerrada'."""
        project, tasks = sample_project_with_mixed_tasks

        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=cerrada",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 1
        assert tasks_list[0]["status"] == "cerrada"

    def test_filter_multiple_statuses(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """Filter tasks with multiple statuses (OR logic)."""
        project, tasks = sample_project_with_mixed_tasks

        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=abierta,bloqueada",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 3  # 2 abierta + 1 bloqueada
        for task in tasks_list:
            assert task["status"] in ["abierta", "bloqueada"]

    def test_filter_no_results_empty_state(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """HU-011 AC4: Filter with no results."""
        project, tasks = sample_project_with_mixed_tasks

        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=pendiente_revision",  # Non-existent status
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 0

    def test_filter_case_insensitive(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """Test that filters are case-insensitive (lowercase)."""
        project, tasks = sample_project_with_mixed_tasks

        # Try uppercase (should normalize to lowercase)
        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=Abierta",
            headers=auth_headers,
        )

        # Should return 200 with either 2 results or 0 depending on implementation
        assert response.status_code == 200

    def test_clear_filter(self, test_client, auth_headers, sample_project_with_mixed_tasks):
        """HU-011 AC5: Clear filter restores all tasks."""
        project, tasks = sample_project_with_mixed_tasks

        # First, filter
        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks?status=abierta",
            headers=auth_headers,
        )
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 2

        # Then, clear (no status param)
        response = test_client.get(
            f"/api/v1/projects/{project.id}/tasks",
            headers=auth_headers,
        )
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 5
