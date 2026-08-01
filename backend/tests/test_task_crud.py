"""
Tests for EP-004 Task CRUD operations — HU-010, HU-011
RED phase: Write failing tests first to define expected behavior.
"""
import pytest
from datetime import datetime, timedelta
from uuid import uuid4
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# Assumes models, schemas, and routers exist (to be implemented in GREEN phase)
# from backend.src.models.db_models import Project, Task
# from backend.src.models.schemas import TaskCreate, TaskUpdate, TaskResponse
# from backend.src.api.routers.tasks import router


@pytest.fixture
def task_client(test_client: TestClient, project_with_auth):
    """Fixture to provide authenticated task client."""
    return test_client


@pytest.fixture
def sample_project(db_session: Session, auth_headers: dict):
    """Create a sample project for task testing."""
    # This assumes project fixture exists; will use project from auth flow
    from backend.src.models.db_models import Project
    from uuid import uuid4

    project = Project(
        id=uuid4(),
        name="Test Project for Tasks",
        total_effort=100.0,
        planned_effort=50.0,
        completed_effort=0.0,
        state="ACTIVE",
        responsable="Test User",
        status="Activo",
        prioridad="Alta",
        user_id=uuid4(),  # Mock user
    )
    db_session.add(project)
    db_session.commit()
    return project


class TestTaskCRUD:
    """Test suite for task CRUD operations (HU-010)."""

    def test_create_task_success(self, task_client, sample_project, auth_headers):
        """HU-010 AC1: Create task successfully."""
        payload = {
            "title": "Implement API endpoint",
            "assignee": "John Doe",
            "priority": "alta",
            "due_date": (datetime.now() + timedelta(days=7)).isoformat(),
            "status": "abierta",
        }

        response = task_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"
        data = response.json()
        assert data["title"] == "Implement API endpoint"
        assert data["status"] == "abierta"
        assert data["version"] == 1
        assert "id" in data

    def test_create_task_missing_title(self, task_client, sample_project, auth_headers):
        """HU-010 AC3: Validation error when title is missing."""
        payload = {
            "assignee": "John Doe",
            "priority": "alta",
        }

        response = task_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422
        data = response.json()
        assert "title" in str(data).lower() or "required" in str(data).lower()

    def test_create_task_title_too_long(self, task_client, sample_project, auth_headers):
        """HU-010 AC5: Title length validation (max 500 chars)."""
        payload = {
            "title": "x" * 501,
            "assignee": "John Doe",
            "priority": "alta",
        }

        response = task_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422
        data = response.json()
        assert "title" in str(data).lower() or "500" in str(data).lower()

    def test_list_tasks_empty(self, task_client, sample_project, auth_headers):
        """HU-011 AC1: View empty task list."""
        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "tasks" in data or isinstance(data, list)
        assert len(data.get("tasks", data)) == 0

    def test_list_tasks_with_data(self, task_client, sample_project, auth_headers, db_session):
        """HU-011 AC1: View complete task list with multiple tasks."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        # Create 3 test tasks
        tasks = [
            Task(
                id=uuid4(),
                project_id=sample_project.id,
                title=f"Task {i}",
                status="abierta",
                assignee="John",
                priority="media",
                version=1,
            )
            for i in range(3)
        ]
        db_session.add_all(tasks)
        db_session.commit()

        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 3

        # Verify columns present
        if tasks_list:
            task = tasks_list[0]
            assert "id" in task
            assert "title" in task
            assert "assignee" in task
            assert "priority" in task
            assert "status" in task

    def test_filter_tasks_by_status_abierta(self, task_client, sample_project, auth_headers, db_session):
        """HU-011 AC2: Filter tasks by 'abierta' status."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        # Create mixed status tasks
        tasks_data = [
            ("Task 1", "abierta"),
            ("Task 2", "abierta"),
            ("Task 3", "vencida"),
            ("Task 4", "cerrada"),
        ]

        for title, status in tasks_data:
            task = Task(
                id=uuid4(),
                project_id=sample_project.id,
                title=title,
                status=status,
                assignee="John",
                priority="media",
                version=1,
            )
            db_session.add(task)
        db_session.commit()

        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks?status=abierta",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 2
        for task in tasks_list:
            assert task["status"] == "abierta"

    def test_filter_tasks_by_status_vencida_visual(self, task_client, sample_project, auth_headers, db_session):
        """HU-011 AC3: Filter tasks by 'vencida' with visual indicator."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        task = Task(
            id=uuid4(),
            project_id=sample_project.id,
            title="Overdue Task",
            status="vencida",
            assignee="John",
            priority="alta",
            version=1,
            due_date=datetime.now() - timedelta(days=1),
        )
        db_session.add(task)
        db_session.commit()

        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks?status=vencida",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 1
        assert tasks_list[0]["status"] == "vencida"

    def test_filter_tasks_no_results(self, task_client, sample_project, auth_headers):
        """HU-011 AC4: Filter with no results shows empty."""
        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks?status=cerrada",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        tasks_list = data.get("tasks", data) if isinstance(data, dict) else data
        assert len(tasks_list) == 0

    def test_get_task_detail(self, task_client, sample_project, auth_headers, db_session):
        """Test GET /projects/{id}/tasks/{task_id} — detail endpoint."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="Detail Test Task",
            status="abierta",
            assignee="John",
            priority="media",
            version=1,
        )
        db_session.add(task)
        db_session.commit()

        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == str(task_id)
        assert data["title"] == "Detail Test Task"

    def test_get_task_not_found(self, task_client, sample_project, auth_headers):
        """Test 404 when task does not exist."""
        from uuid import uuid4

        fake_task_id = uuid4()
        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks/{fake_task_id}",
            headers=auth_headers,
        )

        assert response.status_code == 404

    def test_update_task_success(self, task_client, sample_project, auth_headers, db_session):
        """Test PUT /projects/{id}/tasks/{task_id} — update task."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="Original Title",
            status="abierta",
            assignee="John",
            priority="media",
            version=1,
        )
        db_session.add(task)
        db_session.commit()

        payload = {
            "title": "Updated Title",
            "status": "bloqueada",
            "version": 1,
        }

        response = task_client.put(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["status"] == "bloqueada"
        assert data["version"] == 2

    def test_update_task_conflict_version(self, task_client, sample_project, auth_headers, db_session):
        """HU-010 AC4: Conflict when version mismatch."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="Original",
            status="abierta",
            assignee="John",
            priority="media",
            version=2,  # Current version is 2
        )
        db_session.add(task)
        db_session.commit()

        payload = {
            "title": "Updated",
            "version": 1,  # Trying to update with version 1
        }

        response = task_client.put(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 409  # Conflict
        data = response.json()
        assert "version" in str(data).lower() or "conflict" in str(data).lower()

    def test_delete_task(self, task_client, sample_project, auth_headers, db_session):
        """Test DELETE /projects/{id}/tasks/{task_id} — delete task."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="To Delete",
            status="abierta",
            assignee="John",
            priority="media",
            version=1,
        )
        db_session.add(task)
        db_session.commit()

        response = task_client.delete(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            headers=auth_headers,
        )

        assert response.status_code == 204

    def test_delete_then_get_404(self, task_client, sample_project, auth_headers, db_session):
        """Verify deleted task returns 404 on GET."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="To Delete",
            status="abierta",
            assignee="John",
            priority="media",
            version=1,
        )
        db_session.add(task)
        db_session.commit()

        # Delete
        task_client.delete(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            headers=auth_headers,
        )

        # Verify 404
        response = task_client.get(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            headers=auth_headers,
        )
        assert response.status_code == 404

    def test_invalid_priority_enum(self, task_client, sample_project, auth_headers):
        """Test validation of priority enum."""
        payload = {
            "title": "Test Task",
            "assignee": "John",
            "priority": "invalid_priority",
        }

        response = task_client.post(
            f"/api/v1/projects/{sample_project.id}/tasks",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 422

    def test_edit_inline_status(self, task_client, sample_project, auth_headers, db_session):
        """HU-010 AC2: Edit status inline without modal."""
        from backend.src.models.db_models import Task
        from uuid import uuid4

        task_id = uuid4()
        task = Task(
            id=task_id,
            project_id=sample_project.id,
            title="Task for Status Edit",
            status="abierta",
            assignee="John",
            priority="media",
            version=1,
        )
        db_session.add(task)
        db_session.commit()

        # Change status to bloqueada
        payload = {
            "status": "bloqueada",
            "version": 1,
        }

        response = task_client.put(
            f"/api/v1/projects/{sample_project.id}/tasks/{task_id}",
            json=payload,
            headers=auth_headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "bloqueada"
        assert data["version"] == 2
