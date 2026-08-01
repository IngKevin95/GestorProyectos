"""
Tests para EP-002 Health Detection Engine

HU-004: detect_blocked
HU-005: detect_at_risk
HU-006: detect_no_next_step
"""

import pytest
from datetime import date
from freezegun import freeze_time

from app.services.health import (
    detect_blocked,
    detect_at_risk,
    detect_no_next_step,
    calculate_health,
)


class TestDetectBlocked:
    """HU-004: Detectar automáticamente proyectos bloqueados"""

    def test_detect_blocked_by_blockers_present(self):
        """AC1: Proyecto bloqueado por blockers registrados (flujo feliz)"""
        result = detect_blocked(blockers="Pendiente aprobación legal", overdue_tasks=0)
        assert result is True

    def test_detect_blocked_by_overdue_tasks(self):
        """AC2: Proyecto bloqueado por overdue_tasks excesivas"""
        result = detect_blocked(blockers="", overdue_tasks=5)
        assert result is True

    def test_not_blocked_when_empty(self):
        """AC3: Proyecto NO bloqueado (vacío + bajo umbral)"""
        result = detect_blocked(blockers="", overdue_tasks=1)
        assert result is False

    def test_detect_blocked_multiple_blockers(self):
        """AC4: Borde — múltiples blockers registrados"""
        result = detect_blocked(
            blockers="Espera presupuesto; Falta recurso senior", overdue_tasks=0
        )
        assert result is True

    def test_detect_blocked_with_exactly_3_overdue(self):
        """Edge case: overdue_tasks=3 (exactamente umbral) → bloqueado"""
        result = detect_blocked(blockers="", overdue_tasks=3)
        assert result is True

    def test_detect_blocked_with_2_overdue(self):
        """Edge case: overdue_tasks=2 (justo debajo) → no bloqueado"""
        result = detect_blocked(blockers="", overdue_tasks=2)
        assert result is False

    def test_detect_blocked_with_none_blockers(self):
        """Edge case: blockers=None → no bloqueado (si solo)"""
        result = detect_blocked(blockers=None, overdue_tasks=0)
        assert result is False

    def test_detect_blocked_with_whitespace_only(self):
        """Edge case: blockers='   ' (espacios) → no bloqueado tras strip()"""
        result = detect_blocked(blockers="   ", overdue_tasks=0)
        assert result is False


class TestDetectAtRisk:
    """HU-005: Detectar automáticamente proyectos en riesgo"""

    @freeze_time("2026-07-31")
    def test_at_risk_when_date_near_and_tasks_open(self):
        """AC1: Proyecto en riesgo (fecha próxima + tareas abiertas)"""
        target_date = date(2026, 8, 5)  # 6 días
        result = detect_at_risk(target_date=target_date, open_tasks=2)
        assert result is True

    @freeze_time("2026-07-31")
    def test_not_at_risk_when_date_near_but_no_tasks(self):
        """AC2: Proyecto con fecha próxima pero SIN tareas abiertas"""
        target_date = date(2026, 8, 5)  # 6 días
        result = detect_at_risk(target_date=target_date, open_tasks=0)
        assert result is False

    @freeze_time("2026-07-31")
    def test_not_at_risk_when_date_far(self):
        """AC3: Proyecto con tareas pero fecha LEJANA"""
        target_date = date(2026, 12, 31)  # >7 días
        result = detect_at_risk(target_date=target_date, open_tasks=5)
        assert result is False

    @freeze_time("2026-07-31")
    def test_at_risk_exactly_7_days(self):
        """AC4: Borde — exactamente en el umbral de 7 días (inclusive)"""
        target_date = date(2026, 8, 7)  # exactamente 7 días
        result = detect_at_risk(target_date=target_date, open_tasks=1)
        assert result is True

    @freeze_time("2026-07-31")
    def test_not_at_risk_when_8_days_ahead(self):
        """Edge case: target_date=hoy + 8 días → False (apenas fuera de umbral)"""
        target_date = date(2026, 8, 8)  # 8 días
        result = detect_at_risk(target_date=target_date, open_tasks=5)
        assert result is False

    @freeze_time("2026-07-31")
    def test_at_risk_when_today_is_deadline(self):
        """Edge case: target_date=hoy (hoy es fecha límite) → True si open_tasks>0"""
        target_date = date(2026, 7, 31)  # hoy
        result = detect_at_risk(target_date=target_date, open_tasks=1)
        assert result is True

    @freeze_time("2026-07-31")
    def test_not_at_risk_when_date_is_past(self):
        """Edge case: target_date < hoy (pasado) → False"""
        target_date = date(2026, 7, 30)  # ayer
        result = detect_at_risk(target_date=target_date, open_tasks=5)
        assert result is False

    def test_not_at_risk_when_target_date_is_none(self):
        """Edge case: target_date=None → False"""
        result = detect_at_risk(target_date=None, open_tasks=5)
        assert result is False


class TestDetectNoNextStep:
    """HU-006: Detectar automáticamente proyectos sin siguiente paso claro"""

    def test_no_next_step_when_empty(self):
        """AC1: Proyecto sin siguiente paso (campo vacío)"""
        result = detect_no_next_step(siguiente_paso="")
        assert result is True

    def test_has_next_step_when_defined(self):
        """AC2: Proyecto CON siguiente paso definido"""
        result = detect_no_next_step(siguiente_paso="Revisar especificación con cliente")
        assert result is False

    def test_no_next_step_when_whitespace_only(self):
        """AC4: Borde — siguiente paso con espacios en blanco solamente"""
        result = detect_no_next_step(siguiente_paso="   ")
        assert result is True

    def test_no_next_step_when_none(self):
        """Edge case: siguiente_paso=None → no rumbo"""
        result = detect_no_next_step(siguiente_paso=None)
        assert result is True

    def test_has_next_step_with_special_chars(self):
        """Edge case: siguiente_paso con caracteres especiales → válido"""
        result = detect_no_next_step(siguiente_paso="✓ Revisar propuesta")
        assert result is False


class TestAPIEndpoints:
    """T4: API Contract Tests for health field"""

    def test_get_project_includes_health_field(self):
        """GET /api/v1/projects/{id} returns health field"""
        from app.routers.projects import get_project
        import asyncio

        project = asyncio.run(get_project(1))
        project_dict = project.model_dump() if hasattr(project, 'model_dump') else dict(project)
        assert "health" in project_dict
        assert project_dict["health"] in ["Ok", "Bloqueado", "En riesgo", "Sin rumbo"]

    def test_list_projects_includes_health_for_all(self):
        """GET /api/v1/projects returns health for each project"""
        from app.routers.projects import list_projects
        import asyncio

        projects = asyncio.run(list_projects())
        assert len(projects) >= 3
        for project in projects:
            project_dict = project.model_dump() if hasattr(project, 'model_dump') else dict(project)
            assert "health" in project_dict
            assert project_dict["health"] in ["Ok", "Bloqueado", "En riesgo", "Sin rumbo"]

    def test_health_values_correct_in_api(self):
        """Verify health calculations match business logic"""
        from app.routers.projects import get_project
        import asyncio

        # Project 1: blockers present → Bloqueado
        p1 = asyncio.run(get_project(1))
        p1_dict = p1.model_dump() if hasattr(p1, 'model_dump') else dict(p1)
        assert p1_dict["health"] == "Bloqueado"

        # Project 2: fecha próxima + open_tasks → En riesgo
        p2 = asyncio.run(get_project(2))
        p2_dict = p2.model_dump() if hasattr(p2, 'model_dump') else dict(p2)
        assert p2_dict["health"] == "En riesgo"

        # Project 3: siguiente_paso vacío → Sin rumbo
        p3 = asyncio.run(get_project(3))
        p3_dict = p3.model_dump() if hasattr(p3, 'model_dump') else dict(p3)
        assert p3_dict["health"] == "Sin rumbo"


class TestCalculateHealth:
    """Integration: Orquestación de detect_* funciones"""

    @freeze_time("2026-07-31")
    def test_health_blocked_priority(self):
        """Bloqueado + En riesgo → returns 'Bloqueado' (priority order)"""
        # Simular proyecto con blockers Y fecha próxima
        health = calculate_health(
            blockers="Espera presupuesto",
            overdue_tasks=0,
            target_date=date(2026, 8, 5),
            open_tasks=2,
            siguiente_paso="Contactar cliente",
        )
        assert health == "Bloqueado"

    @freeze_time("2026-07-31")
    def test_health_at_risk_priority(self):
        """En riesgo + Sin rumbo → returns 'En riesgo'"""
        health = calculate_health(
            blockers="",
            overdue_tasks=1,
            target_date=date(2026, 8, 5),  # 6 días
            open_tasks=2,
            siguiente_paso="",
        )
        assert health == "En riesgo"

    def test_health_no_next_step(self):
        """Sin rumbo alone → returns 'Sin rumbo'"""
        health = calculate_health(
            blockers="",
            overdue_tasks=0,
            target_date=date(2026, 12, 31),
            open_tasks=0,
            siguiente_paso="",
        )
        assert health == "Sin rumbo"

    def test_health_ok(self):
        """All clear → returns 'Ok'"""
        health = calculate_health(
            blockers="",
            overdue_tasks=0,
            target_date=date(2026, 12, 31),
            open_tasks=0,
            siguiente_paso="Continuar con desarrollo",
        )
        assert health == "Ok"
