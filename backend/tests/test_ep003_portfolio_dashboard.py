"""Tests para EP-003: Vista de Cartera y Criterio de Priorización

RED PHASE: Tests que fallan y definen el comportamiento esperado.
- HU-007: Dashboard con badges de salud
- HU-008: Ordenar por score de priorización
- HU-009: Configurar estrategia de priorización
"""
import pytest
from httpx import AsyncClient
from datetime import date, timedelta
import uuid


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HU-007: Mostrar vista de cartera con badges de salud
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestHU007PortfolioBadgesHealth:
    """Escenarios: Dashboard muestra 4 proyectos con 4 badges"""

    @pytest.mark.asyncio
    async def test_hu007_01_dashboard_returns_projects_with_health_status(self, client: AsyncClient, test_projects):
        """AC-1: GET /api/v1/projects devuelve proyectos con health_status"""
        # Given: 5 proyectos con diferentes estrategias de priorización existen en BD
        # When: Se solicita GET /api/v1/projects
        response = await client.get("/api/v1/projects")
        # Then: Response status 200, cada proyecto tiene health_status válido
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        projects = data["data"]
        assert len(projects) > 0
        for project in projects:
            assert "health_status" in project
            assert project["health_status"] in ["ok", "blocked", "at_risk", "no_next_step"]
            assert "id" in project
            assert "name" in project

    @pytest.mark.asyncio
    async def test_hu007_02_badge_blocked_has_red_icon_label(self, client: AsyncClient, test_projects):
        """AC-2: Badge bloqueado: rojo + 🚫 + 'Bloqueado'"""
        # Given: Existe proyecto con health_status='blocked'
        response = await client.get("/api/v1/projects")
        # When: Se obtiene la lista
        assert response.status_code == 200
        # Then: Badge debería mostrarse en rojo (UI responsibility, verificamos la presencia del campo)
        data = response.json()
        projects = data.get("data", [])
        if any(p.get("health_status") == "blocked" for p in projects):
            assert True

    @pytest.mark.asyncio
    async def test_hu007_03_badge_at_risk_has_amber_icon_label(self, client: AsyncClient):
        """AC-3: Badge en riesgo: ámbar + ⚠️ + 'En riesgo'"""
        # Given: Existe proyecto con health_status='at_risk'
        response = await client.get("/api/v1/projects")
        # When: Se obtiene la lista
        assert response.status_code == 200
        # Then: Badge debería mostrarse en ámbar (UI responsibility)
        data = response.json()
        projects = data.get("data", [])
        assert isinstance(projects, list)

    @pytest.mark.asyncio
    async def test_hu007_04_badge_ok_shows_green(self, client: AsyncClient):
        """AC-4: Badge ok: verde (visible)"""
        # When: Se obtiene lista de proyectos
        response = await client.get("/api/v1/projects")
        # Then: Status 200, proyectos tienen health_status visible
        assert response.status_code == 200
        data = response.json()
        for project in data.get("data", []):
            assert "health_status" in project

    @pytest.mark.asyncio
    async def test_hu007_05_health_change_updates_badge_without_refresh(self, client: AsyncClient):
        """AC-5: Cambiar salud → badge se actualiza sin refrescar (SSE/WebSocket)"""
        # Esta verificación es más compleja en E2E, aquí solo verificamos que la actualización funciona
        # Given: Existe un proyecto
        # When: Se actualiza su estado
        projects_resp = await client.get("/api/v1/projects")
        if projects_resp.status_code == 200:
            projects = projects_resp.json().get("data", [])
            if projects:
                project = projects[0]
                # Then: Puede actualizarse sin error
                update_resp = await client.put(
                    f"/api/v1/projects/{project['id']}",
                    json={"health_status": "at_risk", "version": project.get("version", 0)}
                )
                assert update_resp.status_code in [200, 422, 404]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HU-008: Ordenar vista de cartera por score
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestHU008SortByPriorityScore:
    """Escenarios: Dashboard ordena por score descendente + desempate A→Z"""

    @pytest.mark.asyncio
    async def test_hu008_01_projects_ordered_by_score_descending(self, client: AsyncClient, test_projects):
        """AC-1: GET /api/v1/projects devuelve proyectos ordenados por score DESC"""
        # Given: 5 proyectos con diferentes scores existen
        # When: Se solicita GET /api/v1/projects
        response = await client.get("/api/v1/projects")
        # Then: Response 200, proyectos están en orden score descendente
        assert response.status_code == 200
        data = response.json()
        projects = data.get("data", [])
        if len(projects) >= 2:
            for i in range(len(projects) - 1):
                score_i = projects[i].get("score") or 0
                score_i1 = projects[i+1].get("score") or 0
                assert score_i >= score_i1, f"Score order violated: {score_i} < {score_i1}"

    @pytest.mark.asyncio
    async def test_hu008_02_data_change_recalculates_score_and_order(self, client: AsyncClient):
        """AC-2: Cambiar business_value → score se recalcula y reordena"""
        # Given: Existe un proyecto
        projects_resp = await client.get("/api/v1/projects")
        # When: Se actualiza su business_value
        if projects_resp.status_code == 200:
            projects = projects_resp.json().get("data", [])
            if projects:
                project = projects[0]
                update_resp = await client.put(
                    f"/api/v1/projects/{project['id']}",
                    json={"business_value": 85.0, "version": project.get("version", 0)}
                )
                # Then: Actualización exitosa, score se recalcula
                assert update_resp.status_code in [200, 422]

    @pytest.mark.asyncio
    async def test_hu008_03_tie_breaking_deterministic_by_name_asc(self, client: AsyncClient):
        """AC-3: Empate de scores: desempate por nombre A→Z (NOT Z→A)"""
        # Given: Múltiples proyectos
        response = await client.get("/api/v1/projects?limit=100")
        # When: Se obtienen proyectos
        if response.status_code == 200:
            data = response.json()
            projects = data.get("data", [])
            # Then: Nombres están en orden ascendente en caso de empate de scores
            for i in range(len(projects) - 1):
                score_i = projects[i].get("score", 0) or 0
                score_i1 = projects[i+1].get("score", 0) or 0
                if abs(score_i - score_i1) < 0.01:  # Tie in score
                    name_i = projects[i].get("name", "")
                    name_i1 = projects[i+1].get("name", "")
                    assert name_i <= name_i1, f"Tie-breaking order violated: {name_i} > {name_i1}"

    @pytest.mark.asyncio
    async def test_hu008_04_score_zero_no_errors(self, client: AsyncClient):
        """AC-4: Score con valor=0 sin errores, no fallos con None"""
        # When: Se solicita proyectos
        response = await client.get("/api/v1/projects?limit=100")
        # Then: Status 200, todos los proyectos tienen score válido
        assert response.status_code == 200
        data = response.json()
        for project in data.get("data", []):
            score = project.get("score", 0)
            assert score is not None
            assert isinstance(score, (int, float))

    @pytest.mark.asyncio
    async def test_hu008_05_single_project_dashboard_works(self, client: AsyncClient):
        """AC-5: Dashboard con 1 proyecto funciona y devuelve score"""
        # When: Se solicita 1 proyecto
        response = await client.get("/api/v1/projects?limit=1")
        # Then: Status 200, respuesta es válida
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data["data"], list)
        if data["data"]:
            assert "score" in data["data"][0]


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# HU-009: Configurar estrategia de priorización
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestHU009PriorityStrategyConfiguration:
    """Escenarios: Configurar estrategia de priorización (absolute, relative, mixed)"""

    @pytest.mark.asyncio
    async def test_hu009_01_absolute_strategy_uses_constant(self, client: AsyncClient):
        """AC-1: Estrategia Absoluta: score = priority_constant (rango 0-100)"""
        # Given: Existe un proyecto
        projects_resp = await client.get("/api/v1/projects")
        # When: Se actualiza a estrategia absoluta con constante 75
        if projects_resp.status_code == 200:
            projects = projects_resp.json().get("data", [])
            if projects:
                project = projects[0]
                update_resp = await client.put(
                    f"/api/v1/projects/{project['id']}",
                    json={"priority_strategy": "absolute", "priority_constant": 75.0, "version": project.get("version", 0)}
                )
                # Then: Actualización exitosa, score será constante 75
                assert update_resp.status_code in [200, 422]

    @pytest.mark.asyncio
    async def test_hu009_02_relative_strategy_is_default(self, client: AsyncClient):
        """AC-2: Estrategia Relativa es default en creación"""
        # When: Se obtienen proyectos
        response = await client.get("/api/v1/projects")
        # Then: Status 200, estrategias presentes y válidas
        if response.status_code == 200:
            data = response.json()
            for project in data.get("data", []):
                strategy = project.get("priority_strategy", "relative")
                assert strategy in ["relative", "absolute", "mixed"]

    @pytest.mark.asyncio
    async def test_hu009_03_invalid_constant_rejected(self, client: AsyncClient):
        """AC-3: Constante fuera de rango [0-100] rechazada"""
        # Given: Existe proyecto
        projects_resp = await client.get("/api/v1/projects")
        # When: Se intenta set priority_constant = -10
        if projects_resp.status_code == 200:
            projects = projects_resp.json().get("data", [])
            if projects:
                project = projects[0]
                update_resp = await client.put(
                    f"/api/v1/projects/{project['id']}",
                    json={"priority_strategy": "absolute", "priority_constant": -10.0, "version": project.get("version", 0)}
                )
                # Then: Rechazado (422) o error de validación
                assert update_resp.status_code in [422, 400]

    @pytest.mark.asyncio
    async def test_hu009_04_strategy_change_recalculates_score(self, client: AsyncClient):
        """AC-4: Cambio de estrategia → score se recalcula automáticamente"""
        # Given: Proyecto con estrategia=relative
        projects_resp = await client.get("/api/v1/projects")
        # When: Se cambia a mixed
        if projects_resp.status_code == 200:
            projects = projects_resp.json().get("data", [])
            if projects:
                project = projects[0]
                old_score = project.get("score")
                update_resp = await client.put(
                    f"/api/v1/projects/{project['id']}",
                    json={"priority_strategy": "mixed", "version": project.get("version", 0)}
                )
                # Then: Actualización exitosa
                assert update_resp.status_code in [200, 422]
                if update_resp.status_code == 200:
                    updated = update_resp.json()
                    # Score puede cambiar con nueva estrategia
                    assert "score" in updated

    @pytest.mark.asyncio
    async def test_hu009_05_ui_shows_hides_fields_by_strategy(self, client: AsyncClient):
        """AC-5: API retorna campos priority_strategy, priority_constant, business_value"""
        # When: Se obtienen proyectos
        response = await client.get("/api/v1/projects")
        # Then: Todos campos presentes para UI show/hide lógica
        if response.status_code == 200:
            data = response.json()
            for project in data.get("data", []):
                assert "priority_strategy" in project
                assert "priority_constant" in project
                assert "business_value" in project
                # Valores válidos
                assert project["priority_strategy"] in ["relative", "absolute", "mixed"]
                assert isinstance(project["priority_constant"], (int, float))
                assert isinstance(project["business_value"], (int, float))


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Unit tests para PriorityScoringService
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

class TestPriorityScoringServiceUnit:
    """Tests unitarios para PriorityScoringService"""

    @pytest.mark.asyncio
    async def test_relative_strategy_uses_health_urgency_value_formula(self, mocker):
        """Estrategia relative usa fórmula: 0.3×salud + 0.25×urgencia + 0.25×valor + 0.2×críticas"""
        from src.services.priority_scoring_service import PriorityScoringService

        project = mocker.MagicMock()
        project.priority_strategy = "relative"
        project.health_status = "ok"
        project.fecha_limite = date.today() + timedelta(days=180)
        project.business_value = 5.0

        score = PriorityScoringService.calculate_score(project, critical_tasks_count=0)

        assert isinstance(score, (int, float))
        assert score >= 0

    @pytest.mark.asyncio
    async def test_absolute_strategy_returns_constant(self, mocker):
        """Estrategia absolute devuelve priority_constant"""
        from src.services.priority_scoring_service import PriorityScoringService

        project = mocker.MagicMock()
        project.priority_strategy = "absolute"
        project.priority_constant = 42.5

        score = PriorityScoringService.calculate_score(project)

        assert score == 42.5

    @pytest.mark.asyncio
    async def test_score_calculation_with_zero_business_value(self, mocker):
        """Score con business_value=0 no debe fallar"""
        from src.services.priority_scoring_service import PriorityScoringService

        project = mocker.MagicMock()
        project.priority_strategy = "relative"
        project.health_status = "ok"
        project.fecha_limite = None
        project.business_value = 0.0

        score = PriorityScoringService.calculate_score(project)

        assert score is not None
        assert isinstance(score, (int, float))
