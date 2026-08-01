"""Projects API endpoints with health detection (EP-002)"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date
from typing import Optional, List

from app.services.health import calculate_health

router = APIRouter(prefix="/api/v1", tags=["projects"])


# Response models
class ProjectResponse(BaseModel):
    id: int
    nombre: str
    blockers: Optional[str] = None
    overdue_tasks: int = 0
    target_date: Optional[date] = None
    open_tasks: int = 0
    siguiente_paso: Optional[str] = None
    health: str

    class Config:
        from_attributes = True


# Mock DB (for testing)
mock_projects = {
    1: {
        "id": 1,
        "nombre": "Proyecto A",
        "blockers": "Espera presupuesto",
        "overdue_tasks": 0,
        "target_date": date(2026, 12, 31),
        "open_tasks": 0,
        "siguiente_paso": "Contactar cliente",
    },
    2: {
        "id": 2,
        "nombre": "Proyecto B",
        "blockers": "",
        "overdue_tasks": 0,
        "target_date": date(2026, 8, 5),
        "open_tasks": 2,
        "siguiente_paso": "Revisar specs",
    },
    3: {
        "id": 3,
        "nombre": "Proyecto C",
        "blockers": "",
        "overdue_tasks": 0,
        "target_date": date(2026, 12, 31),
        "open_tasks": 0,
        "siguiente_paso": "",
    },
}


@router.get("/projects/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: int):
    """GET /projects/{id}: retorna proyecto con health calculado"""
    if project_id not in mock_projects:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")

    project = mock_projects[project_id]
    health = calculate_health(
        blockers=project.get("blockers"),
        overdue_tasks=project.get("overdue_tasks", 0),
        target_date=project.get("target_date"),
        open_tasks=project.get("open_tasks", 0),
        siguiente_paso=project.get("siguiente_paso"),
    )

    return {
        **project,
        "health": health,
    }


@router.get("/projects", response_model=List[ProjectResponse])
async def list_projects():
    """GET /projects: retorna lista de proyectos con health para cada uno"""
    result = []
    for project_id, project in mock_projects.items():
        health = calculate_health(
            blockers=project.get("blockers"),
            overdue_tasks=project.get("overdue_tasks", 0),
            target_date=project.get("target_date"),
            open_tasks=project.get("open_tasks", 0),
            siguiente_paso=project.get("siguiente_paso"),
        )
        result.append({
            **project,
            "health": health,
        })
    return result
