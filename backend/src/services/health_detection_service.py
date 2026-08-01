"""
Health Detection Service - EP-002
Deterministic rule engine that classifies projects into health states.

Rules:
1. BLOCKED: Project has blockers (non-empty) OR overdue_tasks >= threshold (3+)
2. AT_RISK: target_date <= 7 days AND open_tasks > 0
3. NO_NEXT_STEP: siguiente_paso is empty or whitespace-only
4. OK: None of the above
"""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from enum import Enum
import os

from backend.src.models.db_models import Project


class HealthStatus(str, Enum):
    """Health status enumeration"""
    OK = "ok"
    BLOCKED = "blocked"
    AT_RISK = "at_risk"
    NO_NEXT_STEP = "no_next_step"


class HealthDetectionService:
    """
    Evaluates project health based on explicit, deterministic rules.
    No ML, no subjectivity — pure data-driven logic.
    """

    # Configuration (can be overridden via env vars)
    OVERDUE_THRESHOLD = int(os.getenv("HEALTH_OVERDUE_THRESHOLD", "3"))
    RISK_DAYS = int(os.getenv("HEALTH_RISK_DAYS", "7"))

    @staticmethod
    def detect_health(project: Project, overdue_tasks_count: int = 0, open_tasks_count: int = 0) -> Dict[str, Any]:
        """
        Classify project health based on rules.

        Args:
            project: Project ORM instance
            overdue_tasks_count: Number of overdue tasks (default: 0, assumes no tasks yet)
            open_tasks_count: Number of open tasks (default: 0, assumes no tasks yet)

        Returns:
            {
                "status": "ok" | "blocked" | "at_risk" | "no_next_step",
                "evidence": [list of rules that triggered],
                "details": {
                    "has_blockers": bool,
                    "overdue_tasks": int,
                    "open_tasks": int,
                    "days_to_deadline": Optional[int],
                    "next_step_empty": bool
                }
            }
        """
        details = HealthDetectionService._compute_details(
            project, overdue_tasks_count, open_tasks_count
        )

        # Rule evaluation (priority order: BLOCKED > AT_RISK > NO_NEXT_STEP > OK)
        evidence = []

        # Rule 1: BLOCKED
        if details["has_blockers"]:
            evidence.append("Proyecto tiene bloqueos registrados")
        if details["overdue_tasks"] >= HealthDetectionService.OVERDUE_THRESHOLD:
            evidence.append(f"Proyecto tiene {details['overdue_tasks']} tareas vencidas (umbral: {HealthDetectionService.OVERDUE_THRESHOLD})")

        if evidence:
            return {
                "status": HealthStatus.BLOCKED.value,
                "evidence": evidence,
                "details": details,
            }

        # Rule 2: AT_RISK
        if (
            details["days_to_deadline"] is not None
            and details["days_to_deadline"] <= HealthDetectionService.RISK_DAYS
            and details["open_tasks"] > 0
        ):
            evidence.append(
                f"Fecha límite próxima ({details['days_to_deadline']} días) con tareas abiertas ({details['open_tasks']})"
            )
            return {
                "status": HealthStatus.AT_RISK.value,
                "evidence": evidence,
                "details": details,
            }

        # Rule 3: NO_NEXT_STEP
        if details["next_step_empty"]:
            evidence.append("Proyecto sin siguiente paso definido")
            return {
                "status": HealthStatus.NO_NEXT_STEP.value,
                "evidence": evidence,
                "details": details,
            }

        # Otherwise: OK
        return {
            "status": HealthStatus.OK.value,
            "evidence": ["Proyecto en estado saludable"],
            "details": details,
        }

    @staticmethod
    def _compute_details(
        project: Project, overdue_tasks_count: int = 0, open_tasks_count: int = 0
    ) -> Dict[str, Any]:
        """Compute detailed attributes for a project."""
        has_blockers = bool(project.bloqueos and project.bloqueos.strip())
        next_step_empty = not project.siguiente_paso or not project.siguiente_paso.strip()

        days_to_deadline = None
        if project.fecha_limite:
            today = datetime.now().date()
            delta = (project.fecha_limite - today).days
            # Only report if deadline is in the future or very close
            if delta >= 0:
                days_to_deadline = delta

        return {
            "has_blockers": has_blockers,
            "overdue_tasks": overdue_tasks_count,
            "open_tasks": open_tasks_count,
            "days_to_deadline": days_to_deadline,
            "next_step_empty": next_step_empty,
        }

    @staticmethod
    def update_project_health(project: Project, overdue_tasks_count: int = 0, open_tasks_count: int = 0) -> str:
        """
        Evaluate health and update project model in-place.
        Returns the new health status.
        """
        result = HealthDetectionService.detect_health(project, overdue_tasks_count, open_tasks_count)
        project.health_status = result["status"]
        return result["status"]
