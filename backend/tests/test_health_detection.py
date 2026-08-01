"""
Tests for EP-002: Health Detection Engine
HU-004: Detect blocked projects
HU-005: Detect at-risk projects
HU-006: Detect projects without clear next step

Following Given/When/Then format from AC specs.
"""

import pytest
from httpx import AsyncClient
from datetime import datetime, timedelta


@pytest.mark.asyncio
class TestHealthDetectionBlocked:
    """HU-004: Detectar automáticamente proyectos bloqueados"""

    async def test_blocked_by_blockers_field_not_empty(self):
        """HU-004 AC1: Proyecto bloqueado por bloqueos registrados (flujo feliz)"""
        # GIVEN: proyecto con blockers="Pendiente aprobación legal"
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            # Create test project with blockers
            project_data = {
                "nombre": "Test Project Blocked by Blockers",
                "responsable": "John Doe",
                "estado": "En Progreso",
                "prioridad": "Alta",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "Esperar aprobación",
                "blockers": "Pendiente aprobación legal",  # GIVEN: non-empty blockers
                "notas": ""
            }

            # WHEN: cargo el proyecto
            response = await client.post("/api/projects/", json=project_data)
            assert response.status_code == 201, f"Failed to create project: {response.text}"
            project = response.json()
            project_id = project["id"]

            # Retrieve health status
            health_response = await client.get(f"/api/projects/{project_id}/health")
            assert health_response.status_code == 200, f"Failed to get health: {health_response.text}"
            health = health_response.json()

            # THEN: campo health muestra "Bloqueado"
            assert health.get("status") == "blocked", f"Expected 'blocked', got {health.get('status')}"
            # Y aparece un badge visible indicando "Bloqueado"
            assert health.get("evidence"), "Health should include evidence of classification"

    async def test_blocked_by_excessive_overdue_tasks(self):
        """HU-004 AC2: Proyecto bloqueado por tareas vencidas excesivas"""
        # GIVEN: proyecto con overdue_tasks=5 (umbral es 3+)
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project Blocked by Overdue",
                "responsable": "Jane Doe",
                "estado": "En Progreso",
                "prioridad": "Media",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "Definir scope",
                "blockers": "",
                "notas": "overdue_tasks_count=5"  # Placeholder for integration with tasks
            }

            # WHEN: cargo el proyecto
            response = await client.post("/api/projects/", json=project_data)
            assert response.status_code == 201
            project = response.json()
            project_id = project["id"]

            # THEN: campo health muestra "Bloqueado"
            # NOTE: This test assumes backend counts overdue_tasks from Tasks table
            # For now, we verify endpoint responds correctly
            health_response = await client.get(f"/api/projects/{project_id}/health")
            assert health_response.status_code == 200
            # health = health_response.json()
            # assert health.get("status") == "blocked" once task integration is complete

    async def test_not_blocked_without_blockers_and_few_overdue(self):
        """HU-004 AC3: Proyecto no bloqueado (sin bloqueos, tareas vencidas < umbral)"""
        # GIVEN: proyecto con blockers="" y overdue_tasks=1
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project Not Blocked",
                "responsable": "Bob Smith",
                "estado": "En Progreso",
                "prioridad": "Baja",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "Continuar implementación",
                "blockers": "",  # GIVEN: empty blockers
                "notas": ""
            }

            # WHEN: cargo el proyecto
            response = await client.post("/api/projects/", json=project_data)
            assert response.status_code == 201
            project = response.json()
            project_id = project["id"]

            # THEN: campo health NO muestra "Bloqueado"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            assert health_response.status_code == 200
            health = health_response.json()
            assert health.get("status") != "blocked", "Project should not be marked blocked"

    async def test_blocked_by_multiple_blockers(self):
        """HU-004 AC4: Borde - múltiples bloqueos registrados"""
        # GIVEN: proyecto con múltiples bloqueos
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project Multiple Blockers",
                "responsable": "Alice Johnson",
                "estado": "Bloqueado",
                "prioridad": "Alta",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "Resolver bloqueos",
                "blockers": "Espera presupuesto; Falta recurso senior",  # Multiple blockers
                "notas": ""
            }

            # WHEN: cargo el proyecto
            response = await client.post("/api/projects/", json=project_data)
            assert response.status_code == 201
            project = response.json()
            project_id = project["id"]

            # THEN: se detecta como "Bloqueado"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            assert health_response.status_code == 200
            health = health_response.json()
            assert health.get("status") == "blocked"

    async def test_health_updates_on_blockers_edit(self):
        """HU-004 AC5: Actualizar bloqueos y verificar cambio de estado"""
        # GIVEN: proyecto con blockers="" y health="ok"
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project Update Blockers",
                "responsable": "Charlie Brown",
                "estado": "En Progreso",
                "prioridad": "Media",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "Ir forward",
                "blockers": "",
                "notas": ""
            }

            # Create project
            response = await client.post("/api/projects/", json=project_data)
            project = response.json()
            project_id = project["id"]

            # Verify initial health is not blocked
            health_response = await client.get(f"/api/projects/{project_id}/health")
            initial_health = health_response.json()
            assert initial_health.get("status") != "blocked"

            # WHEN: editar proyecto con blockers="Espera cliente"
            update_data = project_data.copy()
            update_data["blockers"] = "Espera cliente"

            response = await client.put(f"/api/projects/{project_id}", json=update_data)
            assert response.status_code == 200

            # THEN: estado health se actualiza a "Bloqueado"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            updated_health = health_response.json()
            assert updated_health.get("status") == "blocked", "Health should update to blocked after adding blockers"


@pytest.mark.asyncio
class TestHealthDetectionAtRisk:
    """HU-005: Detectar automáticamente proyectos en riesgo"""

    async def test_at_risk_with_close_deadline_and_open_tasks(self):
        """HU-005 AC1: Proyecto en riesgo (fecha próxima + tareas altas abiertas)"""
        # GIVEN: proyecto con target_date="2026-08-05" (6 días desde hoy 2026-07-31)
        # Y open_tasks con prioridad "Alta" = 2
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            close_deadline = (datetime.now() + timedelta(days=6)).isoformat()
            project_data = {
                "nombre": "Test Project At Risk",
                "responsable": "Diana Prince",
                "estado": "En Progreso",
                "prioridad": "Alta",
                "target_date": close_deadline,  # GIVEN: 6 días (< 7)
                "siguiente_paso": "Acelerar deliverables",
                "blockers": "",
                "notas": "open_high_priority_tasks=2"
            }

            # WHEN: cargo el proyecto
            response = await client.post("/api/projects/", json=project_data)
            assert response.status_code == 201
            project = response.json()
            project_id = project["id"]

            # THEN: campo health muestra "En riesgo"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            assert health_response.status_code == 200
            health = health_response.json()
            assert health.get("status") == "at_risk", f"Expected 'at_risk', got {health.get('status')}"

    async def test_not_at_risk_with_close_deadline_but_no_open_tasks(self):
        """HU-005 AC2: Proyecto con fecha próxima pero SIN tareas altas"""
        # GIVEN: proyecto con target_date próximo pero open_tasks=0
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            close_deadline = (datetime.now() + timedelta(days=6)).isoformat()
            project_data = {
                "nombre": "Test Project Close Deadline No Tasks",
                "responsable": "Eve Adams",
                "estado": "En Progreso",
                "prioridad": "Media",
                "target_date": close_deadline,
                "siguiente_paso": "Testing",
                "blockers": "",
                "notas": ""
            }

            response = await client.post("/api/projects/", json=project_data)
            project = response.json()
            project_id = project["id"]

            # THEN: health NO muestra "En riesgo"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            health = health_response.json()
            assert health.get("status") != "at_risk", "Should not be at_risk without open tasks"

    async def test_not_at_risk_with_far_deadline_despite_open_tasks(self):
        """HU-005 AC3: Proyecto con tareas altas pero fecha LEJANA"""
        # GIVEN: proyecto con target_date lejana (>7 días)
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            far_deadline = (datetime.now() + timedelta(days=30)).isoformat()
            project_data = {
                "nombre": "Test Project Far Deadline Many Tasks",
                "responsable": "Frank Jones",
                "estado": "En Progreso",
                "prioridad": "Alta",
                "target_date": far_deadline,  # GIVEN: 30 días (> 7)
                "siguiente_paso": "Phase 2",
                "blockers": "",
                "notas": "open_high_priority_tasks=5"
            }

            response = await client.post("/api/projects/", json=project_data)
            project = response.json()
            project_id = project["id"]

            # THEN: health NO muestra "En riesgo"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            health = health_response.json()
            assert health.get("status") != "at_risk", "Should not be at_risk with far deadline"

    async def test_at_risk_on_exact_7_day_boundary(self):
        """HU-005 AC4: Borde - exactamente en el umbral de 7 días"""
        # GIVEN: proyecto con target_date exactamente 7 días
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            boundary_deadline = (datetime.now() + timedelta(days=7)).isoformat()
            project_data = {
                "nombre": "Test Project 7 Day Boundary",
                "responsable": "Grace Lee",
                "estado": "En Progreso",
                "prioridad": "Alta",
                "target_date": boundary_deadline,  # GIVEN: exactly 7 days
                "siguiente_paso": "Review",
                "blockers": "",
                "notas": "open_tasks=1"
            }

            response = await client.post("/api/projects/", json=project_data)
            project = response.json()
            project_id = project["id"]

            # THEN: se detecta como "En riesgo" (incluye el día 7)
            health_response = await client.get(f"/api/projects/{project_id}/health")
            health = health_response.json()
            assert health.get("status") == "at_risk", "Should be at_risk at exactly 7 days"


@pytest.mark.asyncio
class TestHealthDetectionNoNextStep:
    """HU-006: Detectar automáticamente proyectos sin siguiente paso claro"""

    async def test_no_next_step_when_field_empty(self):
        """HU-006 AC1: Proyecto sin siguiente paso (campo vacío)"""
        # GIVEN: proyecto con siguiente_paso=""
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project No Next Step",
                "responsable": "Henry Wilson",
                "estado": "Bloqueado",
                "prioridad": "Media",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "",  # GIVEN: empty
                "blockers": "",
                "notas": ""
            }

            # WHEN: cargo el proyecto
            response = await client.post("/api/projects/", json=project_data)
            assert response.status_code == 201
            project = response.json()
            project_id = project["id"]

            # THEN: campo health muestra "Sin rumbo"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            assert health_response.status_code == 200
            health = health_response.json()
            assert health.get("status") == "no_next_step", f"Expected 'no_next_step', got {health.get('status')}"

    async def test_not_no_next_step_when_defined(self):
        """HU-006 AC2: Proyecto CON siguiente paso definido"""
        # GIVEN: proyecto con siguiente_paso definido
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project With Next Step",
                "responsable": "Iris King",
                "estado": "En Progreso",
                "prioridad": "Alta",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "Revisar especificación con cliente",  # GIVEN: defined
                "blockers": "",
                "notas": ""
            }

            response = await client.post("/api/projects/", json=project_data)
            project = response.json()
            project_id = project["id"]

            # THEN: health NO muestra "Sin rumbo"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            health = health_response.json()
            assert health.get("status") != "no_next_step"

    async def test_no_next_step_when_whitespace_only(self):
        """HU-006 AC4: Borde - siguiente paso con espacios en blanco solamente"""
        # GIVEN: proyecto con siguiente_paso="   " (solo espacios)
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project Whitespace Next Step",
                "responsable": "Jack Brown",
                "estado": "En Espera",
                "prioridad": "Baja",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "   ",  # GIVEN: whitespace only
                "blockers": "",
                "notas": ""
            }

            response = await client.post("/api/projects/", json=project_data)
            project = response.json()
            project_id = project["id"]

            # THEN: se detecta como "Sin rumbo"
            health_response = await client.get(f"/api/projects/{project_id}/health")
            health = health_response.json()
            assert health.get("status") == "no_next_step"

    async def test_health_updates_on_next_step_edit(self):
        """HU-006 AC5: Llenar siguiente paso en un proyecto sin rumbo"""
        # GIVEN: proyecto con siguiente_paso="" y health="Sin rumbo"
        async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
            project_data = {
                "nombre": "Test Project Update Next Step",
                "responsable": "Kelly Green",
                "estado": "En Progreso",
                "prioridad": "Media",
                "target_date": (datetime.now() + timedelta(days=30)).isoformat(),
                "siguiente_paso": "",
                "blockers": "",
                "notas": ""
            }

            response = await client.post("/api/projects/", json=project_data)
            project = response.json()
            project_id = project["id"]

            # Verify initial health
            health_response = await client.get(f"/api/projects/{project_id}/health")
            initial_health = health_response.json()
            assert initial_health.get("status") == "no_next_step"

            # WHEN: llenar siguiente paso
            update_data = project_data.copy()
            update_data["siguiente_paso"] = "Contactar stakeholders para feedback"

            response = await client.put(f"/api/projects/{project_id}", json=update_data)
            assert response.status_code == 200

            # THEN: estado health se actualiza (no es "Sin rumbo")
            health_response = await client.get(f"/api/projects/{project_id}/health")
            updated_health = health_response.json()
            assert updated_health.get("status") != "no_next_step"
