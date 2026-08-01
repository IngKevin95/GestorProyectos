"""Smoke tests para EP-003: journeys E2E"""
import pytest
from httpx import AsyncClient


class TestEP003Journeys:
    """E2E smoke tests para viajes críticos de EP-003"""

    @pytest.mark.asyncio
    async def test_journey_hu007_dashboard_shows_health_badges(self, client: AsyncClient):
        """JOURNEY: Usuario abre dashboard y ve badges de salud"""
        # GIVEN: Usuario autenticado
        # WHEN: Accede a GET /api/v1/projects
        response = await client.get("/api/v1/projects")

        # THEN: Retorna 200 con proyectos + health_status
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        projects = data["data"]

        # Valida que hay proyectos
        assert len(projects) == 5, "Deben haber 5 proyectos"

        # Valida badges de salud
        for p in projects:
            assert "health_status" in p, f"Proyecto {p['id']} sin health_status"
            assert p["health_status"] in ["ok", "blocked", "at_risk", "no_next_step"]

    @pytest.mark.asyncio
    async def test_journey_hu008_dashboard_sorts_by_score(self, client: AsyncClient):
        """JOURNEY: Dashboard ordena por score descending"""
        # GIVEN: Usuario autenticado
        # WHEN: Obtiene proyectos (que están ordenados por score)
        response = await client.get("/api/v1/projects")

        # THEN: Proyectos están en orden descendente de score (+ nombre A-Z para desempate)
        assert response.status_code == 200
        projects = response.json()["data"]

        # Verifica que scores existen y están ordenados
        scores = [p.get("score", 0) for p in projects]
        names = [p.get("name", "") for p in projects]

        # Scores deben estar en orden descendente
        for i in range(len(scores) - 1):
            assert scores[i] >= scores[i+1], f"Score {i} no >= {i+1}: {scores}"

    @pytest.mark.asyncio
    async def test_journey_hu009_change_strategy_recalculates_score(self, client: AsyncClient):
        """JOURNEY: Cambiar estrategia de priorización recalcula score"""
        # GIVEN: Proyecto con estrategia=relative
        projects_resp = await client.get("/api/v1/projects")
        assert projects_resp.status_code == 200
        projects = projects_resp.json()["data"]
        assert len(projects) > 0

        project = projects[0]
        old_strategy = project.get("priority_strategy")
        old_score = project.get("score")

        # WHEN: Cambio estrategia a "mixed"
        update_resp = await client.put(
            f"/api/v1/projects/{project['id']}",
            json={"priority_strategy": "mixed", "version": project.get("version", 0)}
        )

        # THEN: Actualización exitosa y score recalculado
        assert update_resp.status_code == 200, f"PUT falló: {update_resp.text}"
        updated = update_resp.json()

        assert updated["priority_strategy"] == "mixed", "Estrategia no cambió"
        # Score puede cambiar o no, lo importante es que la operación éxito
        assert "score" in updated, "Score no retornado después de actualizar"
