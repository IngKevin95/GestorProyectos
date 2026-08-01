"""Health Detection Engine for EP-002"""

from datetime import date
from typing import Optional


def detect_blocked(blockers: Optional[str], overdue_tasks: int) -> bool:
    """
    Detecta si un proyecto está bloqueado.

    Regla: bloqueado = (blockers.strip() != "") OR (overdue_tasks >= 3)
    """
    if blockers is None:
        blockers = ""
    return bool(blockers.strip()) or overdue_tasks >= 3


def detect_at_risk(target_date: Optional[date], open_tasks: int) -> bool:
    """
    Detecta si un proyecto está en riesgo.

    Regla: en_riesgo = (target_date - hoy).days <= 7 AND open_tasks > 0
    """
    if target_date is None or open_tasks == 0:
        return False
    days_remaining = (target_date - date.today()).days
    return days_remaining <= 7 and days_remaining >= 0


def detect_no_next_step(siguiente_paso: Optional[str]) -> bool:
    """
    Detecta si un proyecto está sin rumbo (siguiente paso vacío).

    Regla: sin_rumbo = (siguiente_paso.strip() == "")
    """
    if siguiente_paso is None:
        siguiente_paso = ""
    return not siguiente_paso.strip()


def calculate_health(
    blockers: Optional[str],
    overdue_tasks: int,
    target_date: Optional[date],
    open_tasks: int,
    siguiente_paso: Optional[str],
) -> str:
    """
    Orquesta las tres funciones de detección y retorna estado de salud.

    Prioridad: Bloqueado > En riesgo > Sin rumbo > Ok
    """
    if detect_blocked(blockers, overdue_tasks):
        return "Bloqueado"
    if detect_at_risk(target_date, open_tasks):
        return "En riesgo"
    if detect_no_next_step(siguiente_paso):
        return "Sin rumbo"
    return "Ok"
