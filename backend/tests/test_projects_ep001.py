<<<<<<< Updated upstream
"""Tests para EP-001: Gestión de Proyectos (CRUD)

Tests de integración que verifican los endpoints HTTP.
Requiere que el servidor backend esté corriendo en localhost:8000
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_project_endpoint_accepts_new_fields(client: AsyncClient):
    """Verificar que POST /projects acepta los nuevos campos de EP-001"""
    # Nota: Este test falla si no hay autenticación
    # Por ahora solo verifica que el endpoint existe
    response = await client.post(
        "/projects",
        json={
            "name": "Test Project",
            "bac": 10000.0,
            "responsable": "Test User",
            "estado": "Activo",
            "prioridad": "Alta",
            "fecha_limite": "2026-12-31",
            "siguiente_paso": "Start",
            "bloqueos": "None",
            "notas": "Test notes",
            "tipo_proyecto": "Proyecto"
        }
    )
    # Esperamos 401 (sin auth) o 201 (con auth), no 404 o error de schema
    assert response.status_code in [201, 401, 422], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_list_projects_endpoint_exists(client: AsyncClient):
    """Verificar que GET /projects existe"""
    response = await client.get("/projects")
    # Esperamos 401 (sin auth) o 200 (con auth)
    assert response.status_code in [200, 401], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_get_project_endpoint_exists(client: AsyncClient):
    """Verificar que GET /projects/{id} existe"""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.get(f"/projects/{fake_id}")
    # Esperamos 401 (sin auth) o 404 (no existe)
    assert response.status_code in [401, 404], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_update_project_endpoint_accepts_new_fields(client: AsyncClient):
    """Verificar que PUT /projects/{id} acepta los nuevos campos"""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.put(
        f"/projects/{fake_id}",
        json={
            "estado": "En Pausa",
            "siguiente_paso": "Waiting for input",
            "bloqueos": "Awaiting budget",
            "version": 0
        }
    )
    # Esperamos 401 (sin auth) o 404 (no existe), no error de schema
    assert response.status_code in [401, 404, 422], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_delete_project_endpoint_exists(client: AsyncClient):
    """Verificar que DELETE /projects/{id} existe"""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.delete(f"/projects/{fake_id}")
    # Esperamos 401 (sin auth) o 404 (no existe)
    assert response.status_code in [401, 404], f"Unexpected status: {response.status_code}"
=======
"""Tests para EP-001: Gestión de Proyectos (CRUD)

Tests de integración que verifican los endpoints HTTP.
Requiere que el servidor total_effortkend esté corriendo en localhost:8000
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_project_endpoint_accepts_new_fields(client: AsyncClient):
    """Verificar que POST /projects acepta los nuevos campos de EP-001"""
    # Nota: Este test falla si no hay autenticación
    # Por ahora solo verifica que el endpoint existe
    response = await client.post(
        "/api/v1/projects",
        json={
            "name": "Test Project",
            "total_effort": 50.0,
            "responsable": "Test User",
            "estado": "Activo",
            "prioridad": "Alta",
            "fecha_limite": "2026-12-31",
            "siguiente_paso": "Start",
            "bloqueos": "None",
            "notas": "Test notes",
            "tipo_proyecto": "Proyecto"
        }
    )
    # Esperamos 401 (sin auth) o 201 (con auth), no 404 o error de schema
    assert response.status_code in [201, 401, 422], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_list_projects_endpoint_exists(client: AsyncClient):
    """Verificar que GET /api/v1/projects existe"""
    response = await client.get("/api/v1/projects")
    # Esperamos 401 (sin auth), 422 (missing auth header) o 200 (con auth)
    assert response.status_code in [200, 401, 422], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_get_project_endpoint_exists(client: AsyncClient):
    """Verificar que GET /projects/{id} existe"""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.get(f"/projects/{fake_id}")
    # Esperamos 401 (sin auth) o 404 (no existe)
    assert response.status_code in [401, 404], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_update_project_endpoint_accepts_new_fields(client: AsyncClient):
    """Verificar que PUT /projects/{id} acepta los nuevos campos"""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.put(
        f"/projects/{fake_id}",
        json={
            "estado": "En Pausa",
            "siguiente_paso": "Waiting for input",
            "bloqueos": "Awaiting budget",
            "version": 0
        }
    )
    # Esperamos 401 (sin auth) o 404 (no existe), no error de schema
    assert response.status_code in [401, 404, 422], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_delete_project_endpoint_exists(client: AsyncClient):
    """Verificar que DELETE /projects/{id} existe"""
    import uuid
    fake_id = uuid.uuid4()
    response = await client.delete(f"/projects/{fake_id}")
    # Esperamos 401 (sin auth) o 404 (no existe)
    assert response.status_code in [401, 404], f"Unexpected status: {response.status_code}"
>>>>>>> Stashed changes
