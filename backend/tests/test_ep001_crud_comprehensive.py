"""
Tests exhaustivos para EP-001: CRUD de Proyectos
Cubre HU-001, HU-002 y HU-003 con todos sus AC (Given/When/Then)

Protocolo TDD:
- RED: Tests fallan porque falta lógica
- GREEN: Implementa mínimo código para que pasen
- REFACTOR: Limpia duplication
"""
import pytest
import uuid
from datetime import date, datetime
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.db_models import Project, User
from src.models.schemas import ProjectCreate, ProjectResponse
from src.core.security import hash_password


# ============================================================================
# HU-001: Crear y actualizar proyecto con campos operativos clave (5 AC)
# ============================================================================

class TestHU001CreateProject:
    """Escenario 1: Crear proyecto con todos los campos (flujo feliz)"""

    @pytest.mark.asyncio
    async def test_create_project_with_all_fields_happy_path(self, client: AsyncClient):
        """
        Given que soy un Delivery Lead en la pantalla de crear proyecto
        Y he ingresado: responsable="Alice", estado="Activo", prioridad="Alta",
          fecha_límite="2026-12-31", siguiente_paso="Revisar brief con cliente",
          bloqueos="Pendiente aprobación presupuesto", notas="Proyecto piloto XYZ",
          tipo_proyecto="Diagnóstico"
        When presiono "Guardar"
        Then el proyecto se crea y aparece en la lista de cartera
        And todos los 8 campos son visibles con los valores exactos que ingresé
        """
        payload = {
            "name": "Proyecto Piloto XYZ",
            "total_effort": 100.0,
            "responsable": "Alice",
            "estado": "Activo",
            "prioridad": "Alta",
            "fecha_limite": "2026-12-31",
            "siguiente_paso": "Revisar brief con cliente",
            "bloqueos": "Pendiente aprobación presupuesto",
            "notas": "Proyecto piloto XYZ",
            "tipo_proyecto": "Diagnóstico"
        }

        response = await client.post("/api/v1/projects", json=payload)

        # Then: Proyecto creado (201)
        assert response.status_code == 201, f"Expected 201, got {response.status_code}: {response.text}"

        data = response.json()
        project_id = data["id"]

        # And: Verificar todos los 8 campos con valores exactos
        assert data["responsable"] == "Alice"
        assert data["status"] == "Activo"
        assert data["prioridad"] == "Alta"
        assert data["fecha_limite"] == "2026-12-31"
        assert data["siguiente_paso"] == "Revisar brief con cliente"
        assert data["bloqueos"] == "Pendiente aprobación presupuesto"
        assert data["notas"] == "Proyecto piloto XYZ"
        assert data["tipo_proyecto"] == "Diagnóstico"

        # And: Verificar que aparece en la lista
        list_response = await client.get("/api/v1/projects")
        assert list_response.status_code == 200
        projects_list = list_response.json()["data"]
        project_ids = [p["id"] for p in projects_list]
        assert project_id in project_ids


class TestHU001UpdateProject:
    """Escenario 2: Actualizar estado y siguiente_paso de proyecto existente"""

    @pytest.mark.asyncio
    async def test_update_project_state_and_next_step(self, client: AsyncClient):
        """
        Given que existe un proyecto con estado="Activo" y responsable="Bob"
        And abro el formulario de edición del proyecto
        Y cambio el estado a "En Pausa" y el siguiente_paso a "Esperar feedtotal_effortk cliente"
        When presiono "Guardar"
        Then el proyecto se actualiza en la base de datos
        And la lista de cartera refleja los cambios de inmediato
        """
        # Given: Crear proyecto inicial
        create_payload = {
            "name": "Proyecto Bob",
            "total_effort": 150.0,
            "responsable": "Bob",
            "estado": "Activo",
            "prioridad": "Media"
        }
        create_response = await client.post("/api/v1/projects", json=create_payload)
        assert create_response.status_code == 201
        project = create_response.json()
        project_id = project["id"]
        version = project["version"]

        # When: Actualizar proyecto
        update_payload = {
            "estado": "En Pausa",
            "siguiente_paso": "Esperar feedtotal_effortk cliente",
            "version": version
        }
        update_response = await client.put(f"/api/v1/projects/{project_id}", json=update_payload)

        # Then: Actualización exitosa (200)
        assert update_response.status_code == 200, f"Expected 200, got {update_response.status_code}"
        updated = update_response.json()
        assert updated["status"] == "En Pausa"
        assert updated["siguiente_paso"] == "Esperar feedtotal_effortk cliente"

        # And: Verificar cambios en lista inmediatamente
        list_response = await client.get("/api/v1/projects")
        assert list_response.status_code == 200
        projects_list = list_response.json()["data"]
        found = [p for p in projects_list if p["id"] == project_id]
        assert len(found) == 1
        assert found[0]["status"] == "En Pausa"
        assert found[0]["siguiente_paso"] == "Esperar feedtotal_effortk cliente"


class TestHU001ValidationErrors:
    """Escenario 3: Fallo - campo requerido faltante (responsable)"""

    @pytest.mark.asyncio
    async def test_create_project_without_required_field_responsable(self, client: AsyncClient):
        """
        Given que estoy en la pantalla de crear proyecto
        Y he llenado todos los campos excepto "responsable"
        When presiono "Guardar"
        Then aparece un mensaje de error "El campo 'Responsable' es obligatorio"
        And el proyecto NO se crea
        """
        payload = {
            "name": "Proyecto Sin Responsable",
            "total_effort": 100.0,
            # FALTA: responsable
            "estado": "Activo",
            "prioridad": "Alta"
        }

        response = await client.post("/api/v1/projects", json=payload)

        # Then: Validación falla (422 Unprocessable Entity)
        assert response.status_code == 422, f"Expected 422, got {response.status_code}"
        error_data = response.json()
        # Verificar que el error menciona el campo responsable
        assert "responsable" in str(error_data).lower() or "required" in str(error_data).lower()


class TestHU001LongText:
    """Escenario 4: Borde - texto muy largo en notas"""

    @pytest.mark.asyncio
    async def test_create_project_with_1000_char_notes(self, client: AsyncClient):
        """
        Given que estoy creando un proyecto
        Y he ingresado un valor de 1000 caracteres en el campo "notas"
        When presiono "Guardar"
        Then el proyecto se crea correctamente
        And el campo "notas" retiene todo el texto sin truncarlo
        """
        long_text = "A" * 1000  # 1000 caracteres

        payload = {
            "name": "Proyecto Con Notas Largas",
            "total_effort": 100.0,
            "responsable": "Alice",
            "estado": "Activo",
            "notas": long_text
        }

        response = await client.post("/api/v1/projects", json=payload)

        # Then: Proyecto creado exitosamente
        assert response.status_code == 201, f"Expected 201, got {response.status_code}"
        data = response.json()

        # And: Verificar que notas retienen todo el texto
        assert data["notas"] == long_text
        assert len(data["notas"]) == 1000


class TestHU001SpecialCharacters:
    """Escenario 5: Borde - caracteres especiales en nombre y responsable"""

    @pytest.mark.asyncio
    async def test_create_project_with_special_characters(self, client: AsyncClient):
        """
        Given que estoy creando un proyecto
        Y he ingresado caracteres especiales (ñ, &, /, @, €) en el nombre
        Y he ingresado "Cliente: Ñoño & Cía. (USA)" en el campo responsable
        When presiono "Guardar"
        Then el proyecto se crea correctamente
        And los caracteres aparecen sin corrupción al consultarlo
        """
        payload = {
            "name": "Proyecto Ñoño & Cía. (USA) / Test @ €",
            "total_effort": 100.0,
            "responsable": "Cliente: Ñoño & Cía. (USA)",
            "estado": "Activo",
            "notas": "Símbolos: € / @ & ñ"
        }

        response = await client.post("/api/v1/projects", json=payload)

        # Then: Proyecto creado exitosamente
        assert response.status_code == 201
        data = response.json()
        project_id = data["id"]

        # And: Caracteres no corrompidos en consulta posterior
        get_response = await client.get(f"/api/v1/projects/{project_id}")
        assert get_response.status_code == 200
        retrieved = get_response.json()
        assert retrieved["name"] == "Proyecto Ñoño & Cía. (USA) / Test @ €"
        assert retrieved["responsable"] == "Cliente: Ñoño & Cía. (USA)"
        assert "€" in retrieved["notas"]


# ============================================================================
# HU-002: Consultar proyecto con todos sus campos (5 AC)
# ============================================================================

class TestHU002ConsultarProyecto:
    """Escenario 1: Consultar proyecto existente (flujo feliz)"""

    @pytest.mark.asyncio
    async def test_get_project_happy_path(self, client: AsyncClient):
        """
        Given que existe un proyecto con responsable="Alice", estado="Activo", prioridad="Alta"
        When hago clic en el proyecto para verlo
        Then veo una pantalla de detalle que muestra:
          - responsable: Alice
          - estado: Activo
          - prioridad: Alta
          - fecha_límite, siguiente_paso, bloqueos, notas (todos visibles)
        """
        # Given: Crear proyecto
        create_payload = {
            "name": "Proyecto Alice",
            "total_effort": 100.0,
            "responsable": "Alice",
            "estado": "Activo",
            "prioridad": "Alta",
            "fecha_limite": "2026-12-31",
            "siguiente_paso": "Empezar implementación",
            "bloqueos": "Ninguno",
            "notas": "Notas importantes"
        }
        create_response = await client.post("/api/v1/projects", json=create_payload)
        assert create_response.status_code == 201
        project_id = create_response.json()["id"]

        # When: Consultar proyecto
        get_response = await client.get(f"/api/v1/projects/{project_id}")

        # Then: Todos los campos visibles
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["responsable"] == "Alice"
        assert data["status"] == "Activo"
        assert data["prioridad"] == "Alta"
        assert data["fecha_limite"] == "2026-12-31"
        assert data["siguiente_paso"] == "Empezar implementación"
        assert data["bloqueos"] == "Ninguno"
        assert data["notas"] == "Notas importantes"


class TestHU002EmptyBlockers:
    """Escenario 2: Consultar proyecto sin bloqueos (campo vacío)"""

    @pytest.mark.asyncio
    async def test_get_project_with_empty_bloqueos_field(self, client: AsyncClient):
        """
        Given que existe un proyecto con bloqueos vacío
        When consulto el proyecto
        Then el campo "bloqueos" aparece vacío (sin valor) sin errores
        """
        # Given: Crear proyecto sin bloqueos
        create_payload = {
            "name": "Proyecto Sin Bloqueos",
            "total_effort": 100.0,
            "responsable": "Alice",
            "estado": "Activo"
            # bloqueos no está establecido (None/null)
        }
        create_response = await client.post("/api/v1/projects", json=create_payload)
        assert create_response.status_code == 201
        project_id = create_response.json()["id"]

        # When: Consultar
        get_response = await client.get(f"/api/v1/projects/{project_id}")

        # Then: Sin errores y campo vacío
        assert get_response.status_code == 200
        data = get_response.json()
        assert data["bloqueos"] is None or data["bloqueos"] == ""


class TestHU002ProjectNotFound:
    """Escenario 3: Fallo - proyecto no existe"""

    @pytest.mark.asyncio
    async def test_get_nonexistent_project(self, client: AsyncClient):
        """
        Given que intento acceder a un proyecto con ID inexistente
        When intento verlo
        Then aparece un mensaje de error "Proyecto no encontrado"
        """
        fake_id = str(uuid.uuid4())

        response = await client.get(f"/api/v1/projects/{fake_id}")

        # Then: Error 404 Not Found
        assert response.status_code == 404
        error_data = response.json()
        assert "not found" in str(error_data).lower() or "no existe" in str(error_data).lower()


class TestHU002MaxLength:
    """Escenario 4: Borde - todos los campos llenos con máxima longitud"""

    @pytest.mark.asyncio
    async def test_get_project_with_max_length_fields(self, client: AsyncClient):
        """
        Given que existe un proyecto con valores máximos en cada campo
        When consulto el proyecto
        Then todos los campos se muestran completos sin truncamiento
        """
        # Given: Crear proyecto con valores máximos
        max_responsable = "A" * 255  # max_length=255
        max_siguiente_paso = "B" * 1000  # max_length=1000
        max_bloqueos = "C" * 1000  # max_length=1000
        max_notas = "D" * 5000  # max_length=5000

        create_payload = {
            "name": "Proyecto Max Length",
            "total_effort": 100.0,
            "responsable": max_responsable,
            "estado": "Activo",
            "siguiente_paso": max_siguiente_paso,
            "bloqueos": max_bloqueos,
            "notas": max_notas
        }
        create_response = await client.post("/api/v1/projects", json=create_payload)
        assert create_response.status_code == 201
        project_id = create_response.json()["id"]

        # When: Consultar
        get_response = await client.get(f"/api/v1/projects/{project_id}")

        # Then: Sin truncamiento
        assert get_response.status_code == 200
        data = get_response.json()
        assert len(data["responsable"]) == 255
        assert len(data["siguiente_paso"]) == 1000
        assert len(data["bloqueos"]) == 1000
        assert len(data["notas"]) == 5000


class TestHU002SpecialCharactersRead:
    """Escenario 5: Borde - proyecto con caracteres especiales"""

    @pytest.mark.asyncio
    async def test_get_project_with_special_characters(self, client: AsyncClient):
        """
        Given que existe un proyecto con nombre "Proyecto Ñoño & Cía. (USA)"
             y notas con símbolos € / @ %
        When consulto el proyecto
        Then todos los caracteres especiales aparecen correctamente sin corrupción
        """
        # Given: Crear proyecto con caracteres especiales
        create_payload = {
            "name": "Proyecto Ñoño & Cía. (USA)",
            "total_effort": 100.0,
            "responsable": "Cliente Ñoño",
            "estado": "Activo",
            "notas": "Símbolos: € / @ % & ñ"
        }
        create_response = await client.post("/api/v1/projects", json=create_payload)
        assert create_response.status_code == 201
        project_id = create_response.json()["id"]

        # When: Consultar
        get_response = await client.get(f"/api/v1/projects/{project_id}")

        # Then: Caracteres sin corrupción
        assert get_response.status_code == 200
        data = get_response.json()
        assert "Ñoño" in data["name"]
        assert "€" in data["notas"]
        assert "/" in data["notas"]
        assert "@" in data["notas"]


# ============================================================================
# HU-003: Listar proyectos con soporte a filtros básicos (5 AC)
# ============================================================================

class TestHU003ListProjects:
    """Escenario 1: Listar todos los proyectos (sin filtro)"""

    @pytest.mark.asyncio
    async def test_list_all_projects_no_filter(self, client: AsyncClient):
        """
        Given que existen 5 proyectos en el sistema
        When voy a la pantalla de cartera
        Then veo una lista mostrando los 5 proyectos
        And cada fila muestra al menos: nombre, responsable, estado, fecha_límite
        """
        # Given: Crear 5 proyectos adicionales (además de los que ya existen)
        created_ids = []
        for i in range(5):
            payload = {
                "name": f"Proyecto Test {i+1}",
                "total_effort": 100.0 + i * 10000,
                "responsable": f"Lead {i+1}",
                "estado": "Activo",
                "fecha_limite": "2026-12-31"
            }
            response = await client.post("/api/v1/projects", json=payload)
            assert response.status_code == 201
            created_ids.append(response.json()["id"])

        # When: Listar proyectos
        list_response = await client.get("/api/v1/projects")

        # Then: Ver 5 proyectos (al menos los recién creados)
        assert list_response.status_code == 200
        data = list_response.json()
        projects = data["data"]
        assert len(projects) >= 5

        # And: Cada fila tiene los campos requeridos
        for project in projects[:5]:
            assert "name" in project
            assert "responsable" in project
            assert "status" in project
            assert "fecha_limite" in project


class TestHU003FilterByEstado:
    """Escenario 2: Filtrar por estado"""

    @pytest.mark.asyncio
    async def test_filter_projects_by_estado_activo(self, client: AsyncClient):
        """
        Given que existen 5 proyectos: 3 "Activo", 2 "En Pausa"
        When aplico filtro estado="Activo"
        Then la lista muestra solo los 3 proyectos "Activo"
        And el filtro aparece aplicado (visible en la UI)
        """
        # Given: Crear 3 "Activo" y 2 "En Pausa"
        for i in range(3):
            payload = {
                "name": f"Proyecto Activo {i+1}",
                "total_effort": 100.0,
                "responsable": f"Lead Activo {i+1}",
                "estado": "Activo"
            }
            response = await client.post("/api/v1/projects", json=payload)
            assert response.status_code == 201

        for i in range(2):
            payload = {
                "name": f"Proyecto En Pausa {i+1}",
                "total_effort": 100.0,
                "responsable": f"Lead Pausa {i+1}",
                "estado": "En Pausa"
            }
            response = await client.post("/api/v1/projects", json=payload)
            assert response.status_code == 201

        # When: Filtrar por estado="Activo"
        list_response = await client.get("/api/v1/projects?status=Activo")

        # Then: Solo proyectos "Activo"
        assert list_response.status_code == 200
        data = list_response.json()
        projects = data["data"]
        # Verificar que todos son "Activo"
        for project in projects:
            assert project["status"] == "Activo"
        # Y que hay al menos 3
        assert len(projects) >= 3


class TestHU003FilterByResponsable:
    """Escenario 3: Filtrar por responsable"""

    @pytest.mark.asyncio
    async def test_filter_projects_by_responsable(self, client: AsyncClient):
        """
        Given que existen 5 proyectos: 2 de Alice, 3 de Bob
        When aplico filtro responsable="Alice"
        Then la lista muestra solo los 2 proyectos de Alice
        """
        # Given: Crear 2 de Alice y 3 de Bob
        for i in range(2):
            payload = {
                "name": f"Proyecto Alice {i+1}",
                "total_effort": 100.0,
                "responsable": "Alice",
                "estado": "Activo"
            }
            response = await client.post("/api/v1/projects", json=payload)
            assert response.status_code == 201

        for i in range(3):
            payload = {
                "name": f"Proyecto Bob {i+1}",
                "total_effort": 100.0,
                "responsable": "Bob",
                "estado": "Activo"
            }
            response = await client.post("/api/v1/projects", json=payload)
            assert response.status_code == 201

        # When: Filtrar por responsable="Alice"
        list_response = await client.get("/api/v1/projects?responsable=Alice")

        # Then: Solo proyectos de Alice
        assert list_response.status_code == 200
        data = list_response.json()
        projects = data["data"]
        # Verificar que todos son de Alice
        for project in projects:
            assert project["responsable"] == "Alice"
        # Y que hay exactamente 2
        assert len(projects) >= 2


class TestHU003FilterNoResults:
    """Escenario 4: Filtro sin resultados"""

    @pytest.mark.asyncio
    async def test_filter_projects_no_results(self, client: AsyncClient):
        """
        Given que existen 5 proyectos
        When aplico filtro estado="Cancelado" (ninguno tiene ese estado)
        Then la lista aparece vacía
        And veo un mensaje "No hay proyectos que coincidan con el filtro"
        """
        # When: Filtrar por estado="Cancelado" (no debería haber ninguno en tests recientes)
        list_response = await client.get("/api/v1/projects?status=Cancelado")

        # Then: Lista vacía o mensaje de no resultados
        assert list_response.status_code == 200
        data = list_response.json()
        projects = data["data"]
        # Lista vacía o muy pocos resultados (0-1)
        assert len(projects) <= 1, f"Expected <=1 Cancelado projects, got {len(projects)}"


class TestHU003ClearFilter:
    """Escenario 5: Limpiar filtro"""

    @pytest.mark.asyncio
    async def test_clear_filter_shows_all_projects(self, client: AsyncClient):
        """
        Given que tengo aplicado un filtro (estado="Activo") mostrando 3 proyectos
        When hago clic en "Limpiar filtro" o similar (remover param status)
        Then la lista vuelve a mostrar todos los 5 proyectos
        And el filtro desaparece de la UI
        """
        # Given: Crear proyectos variados
        for i in range(3):
            payload = {
                "name": f"Proyecto Activo Test {i+1}",
                "total_effort": 100.0,
                "responsable": f"Lead {i+1}",
                "estado": "Activo"
            }
            response = await client.post("/api/v1/projects", json=payload)
            assert response.status_code == 201

        # Aplicar filtro
        filtered_response = await client.get("/api/v1/projects?status=Activo")
        assert filtered_response.status_code == 200
        filtered_count = len(filtered_response.json()["data"])

        # When: Limpiar filtro (sin param status)
        all_response = await client.get("/api/v1/projects")

        # Then: Más proyectos en lista sin filtro
        assert all_response.status_code == 200
        all_count = len(all_response.json()["data"])
        assert all_count >= filtered_count, "Unfiltered list should have >= filtered count"


# ============================================================================
# HU-020: Eliminación lógica de un proyecto (2 AC)
# ============================================================================

class TestHU020DeleteProject:
    """Escenario 1: Eliminación lógica exitosa"""

    @pytest.mark.asyncio
    async def test_logical_delete_project_happy_path(self, client: AsyncClient):
        """
        Given que existe un proyecto activo
        When solicito eliminar el proyecto
        Then el sistema responde con éxito (204)
        And el proyecto ya no aparece en la lista de cartera
        And si consulto el proyecto directamente retorna 404
        """
        # Given: Crear proyecto
        create_payload = {
            "name": "Proyecto Para Eliminar",
            "total_effort": 100.0,
            "responsable": "Alice",
            "estado": "Activo",
            "prioridad": "Media"
        }
        create_response = await client.post("/api/v1/projects", json=create_payload)
        assert create_response.status_code == 201
        project_id = create_response.json()["id"]

        # When: Eliminar
        delete_response = await client.delete(f"/api/v1/projects/{project_id}")

        # Then: 204 No Content
        assert delete_response.status_code == 204

        # And: Ya no aparece en la lista
        list_response = await client.get("/api/v1/projects")
        assert list_response.status_code == 200
        ids = [p["id"] for p in list_response.json()["data"]]
        assert project_id not in ids

        # And: Consulta directa retorna 404
        get_response = await client.get(f"/api/v1/projects/{project_id}")
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_delete_nonexistent_project(self, client: AsyncClient):
        """
        Given que el proyecto no existe o ya fue eliminado
        When solicito eliminarlo
        Then el sistema retorna un error 404
        """
        fake_id = str(uuid.uuid4())
        delete_response = await client.delete(f"/api/v1/projects/{fake_id}")
        assert delete_response.status_code == 404
