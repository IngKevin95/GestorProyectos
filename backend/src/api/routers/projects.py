"""
Router de Proyectos: CRUD + health detection.
"""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.exceptions import ConflictError, ForbiddenError, InvalidStateTransitionError, NotFoundError, ProjectPausedError
from src.models.db_models import AuditLog, Project
from src.models.schemas import (
    VALID_TRANSITIONS,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from src.services.health_detection_service import HealthDetectionService
from src.services.priority_scoring_service import PriorityScoringService

router = APIRouter(prefix="/projects", tags=["Projects"])


def _check_rls(project: Project, user_id: str) -> None:
    if str(project.user_id) != user_id:
        raise ForbiddenError("You do not own this project")


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(
        name=body.name,
        total_effort=body.total_effort,
        responsable=body.responsable,
        status=body.estado,
        prioridad=body.prioridad,
        fecha_limite=body.fecha_limite,
        siguiente_paso=body.siguiente_paso,
        bloqueos=body.bloqueos,
        notas=body.notas,
        tipo_proyecto=body.tipo_proyecto,
        priority_strategy=body.priority_strategy,
        priority_constant=body.priority_constant,
        business_value=body.business_value,
        user_id=uuid.UUID(current_user["user_id"])
    )

    # EP-002: Evaluate health status on creation
    HealthDetectionService.update_project_health(project)

    db.add(project)
    await db.flush()
    db.add(AuditLog(
        project_id=project.id,
        entity_type="project",
        entity_id=project.id,
        action="CREATE",
        new_value={
            "name": body.name,
            "total_effort": float(body.total_effort),
            "responsable": body.responsable,
            "estado": body.estado,
            "tipo_proyecto": body.tipo_proyecto,
            "health_status": project.health_status
        },
        changed_by=uuid.UUID(current_user["user_id"])
    ))
    await db.commit()
    await db.refresh(project)
    
    project.score = PriorityScoringService.calculate_score(project)
    return project


@router.get("", response_model=dict)
async def list_projects(
    limit: int = Query(50, le=100),
    cursor: str | None = Query(None),
    status: str | None = Query(None, description="Filter by proyecto status (Activo, En Pausa, etc.)"),
    responsable: str | None = Query(None, description="Filter by responsible person"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Project).where(
        Project.user_id == uuid.UUID(current_user["user_id"]),
        Project.deleted_at == None
    )

    # Apply filters
    if status:
        stmt = stmt.where(Project.status == status)
    if responsable:
        stmt = stmt.where(Project.responsable.ilike(f"%{responsable}%"))

    result = await db.execute(stmt)
    items = list(result.scalars().all())

    # Calculate scores (EP-003)
    for p in items:
        p.score = PriorityScoringService.calculate_score(p)

    # Sort descending by score, then by name (A->Z) for deterministic tie-breaking
    # Using negative score for descending, name ascending for tiebreak
    items.sort(key=lambda x: (-x.score, x.name))
    
    # In-memory cursor pagination
    if cursor:
        cursor_uuid = uuid.UUID(cursor)
        try:
            idx = next(i for i, p in enumerate(items) if p.id == cursor_uuid)
            items = items[idx + 1:]
        except StopIteration:
            items = []

    has_more = len(items) > limit
    data = items[:limit]
    
    return {
        "data": [ProjectResponse.model_validate(p) for p in data],
        "pagination": {
            "limit": limit,
            "cursor": str(data[-1].id) if data and has_more else None,
            "has_more": has_more
        }
    }


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(project_id))
    _check_rls(project, current_user["user_id"])
    
    project.score = PriorityScoringService.calculate_score(project)
    return ProjectResponse.model_validate(project)


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: uuid.UUID,
    body: ProjectUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(project_id))
    _check_rls(project, current_user["user_id"])

    # Optimistic locking
    if project.version != body.version:
        raise ConflictError()

    old_state = project.state

    # State machine validation
    if body.state and body.state != project.state:
        if body.state not in VALID_TRANSITIONS.get(project.state, []):
            raise InvalidStateTransitionError(project.state, body.state)
        project.state = body.state

    if body.name:
        project.name = body.name
    if body.total_effort:
        project.total_effort = body.total_effort
    if body.planned_effort is not None:
        project.planned_effort = body.planned_effort
    if body.completed_effort is not None:
        project.completed_effort = body.completed_effort
    if body.responsable:
        project.responsable = body.responsable
    if body.estado:
        project.status = body.estado
    if body.prioridad is not None:
        project.prioridad = body.prioridad
    if body.fecha_limite is not None:
        project.fecha_limite = body.fecha_limite
    if body.siguiente_paso is not None:
        project.siguiente_paso = body.siguiente_paso
    if body.bloqueos is not None:
        project.bloqueos = body.bloqueos
    if body.notas is not None:
        project.notas = body.notas
    if body.tipo_proyecto is not None:
        project.tipo_proyecto = body.tipo_proyecto
    if body.priority_strategy is not None:
        project.priority_strategy = body.priority_strategy
    if body.priority_constant is not None:
        project.priority_constant = body.priority_constant
    if body.business_value is not None:
        project.business_value = body.business_value

    # EP-002: Re-evaluate health status on update
    old_health = project.health_status
    HealthDetectionService.update_project_health(project)

    project.version += 1
    db.add(AuditLog(
        project_id=project.id,
        entity_type="project",
        entity_id=project.id,
        action="UPDATE",
        old_value={"state": old_state, "health_status": old_health},
        new_value={"state": project.state, "status": project.status, "siguiente_paso": project.siguiente_paso, "health_status": project.health_status},
        changed_by=uuid.UUID(current_user["user_id"])
    ))
    await db.commit()
    await db.refresh(project)
    
    # Calculate score for response
    project.score = PriorityScoringService.calculate_score(project)
    
    return project


@router.delete("/{project_id}", status_code=204)
async def delete_project(
    project_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from datetime import UTC, datetime
    result = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(project_id))
    _check_rls(project, current_user["user_id"])
    project.deleted_at = datetime.now(UTC)
    db.add(AuditLog(project_id=project.id, entity_type="project", entity_id=project.id, action="DELETE", changed_by=uuid.UUID(current_user["user_id"])))
    await db.commit()


@router.get("/{project_id}/health", response_model=dict)
async def get_project_health(
    project_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluate and return project health status (EP-002, simplified without Tasks).

    Health classification rules:
    - BLOCKED: Has blockers field populated
    - NO_NEXT_STEP: siguiente_paso is empty or whitespace
    - OK: None of the above
    """
    result = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(project_id))
    _check_rls(project, current_user["user_id"])

    # Simplified health detection (no Activity/Phase/Department queries)
    health_result = HealthDetectionService.detect_health(project, overdue_tasks_count=0, open_tasks_count=0)

    return {
        "project_id": str(project_id),
        "status": health_result["status"],
        "evidence": health_result["evidence"],
        "details": health_result["details"],
    }
