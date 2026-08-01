"""
Router de Proyectos: CRUD + state machine + EVM consolidado.
"""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.exceptions import ConflictError, ForbiddenError, InvalidStateTransitionError, NotFoundError, ProjectPausedError
from src.models.db_models import Activity, AuditLog, Department, Phase, Project
from src.models.schemas import (
    VALID_TRANSITIONS,
    EVMResponse,
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from src.services.evm_calculator import ActivityInput, consolidate_evm
from src.services.health_detection_service import HealthDetectionService

router = APIRouter(prefix="/projects", tags=["Projects"])


def _check_rls(project: Project, user_id: str) -> None:
    if str(project.user_id) != user_id:
        raise ForbiddenError("You do not own this project")


async def _get_all_activities(db: AsyncSession, project_id: uuid.UUID) -> list[ActivityInput]:
    """Recopila todas las actividades activas de un proyecto para consolidación EVM."""
    stmt = (
        select(Activity)
        .join(Department, Activity.department_id == Department.id)
        .join(Phase, Department.phase_id == Phase.id)
        .where(Phase.project_id == project_id, Activity.deleted_at == None, Phase.deleted_at == None, Department.deleted_at == None)
    )
    result = await db.execute(stmt)
    return [
        ActivityInput(a.bac, a.percentage_planned, a.percentage_completed, a.actual_cost)
        for a in result.scalars().all()
    ]


@router.post("", response_model=ProjectResponse, status_code=201)
async def create_project(
    body: ProjectCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    project = Project(
        name=body.name,
        bac=body.bac,
        responsable=body.responsable,
        status=body.estado,
        prioridad=body.prioridad,
        fecha_limite=body.fecha_limite,
        siguiente_paso=body.siguiente_paso,
        bloqueos=body.bloqueos,
        notas=body.notas,
        tipo_proyecto=body.tipo_proyecto,
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
            "bac": float(body.bac),
            "responsable": body.responsable,
            "estado": body.estado,
            "tipo_proyecto": body.tipo_proyecto,
            "health_status": project.health_status
        },
        changed_by=uuid.UUID(current_user["user_id"])
    ))
    await db.commit()
    await db.refresh(project)
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

    stmt = stmt.order_by(Project.created_at.desc()).limit(limit + 1)
    if cursor:
        stmt = stmt.where(Project.id < uuid.UUID(cursor))

    result = await db.execute(stmt)
    items = result.scalars().all()
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


@router.get("/{project_id}", response_model=dict)
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

    activities = await _get_all_activities(db, project_id)
    evm = consolidate_evm(activities)

    return {"project": ProjectResponse.model_validate(project), "evm": EVMResponse(**evm.__dict__)}


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
    if body.bac:
        project.bac = body.bac
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


@router.get("/{project_id}/evm", response_model=EVMResponse)
async def get_project_evm(
    project_id: uuid.UUID,
    as_of: str | None = Query(None, description="ISO datetime for point-in-time query"),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(project_id))
    _check_rls(project, current_user["user_id"])

    activities = await _get_all_activities(db, project_id)
    evm = consolidate_evm(activities)
    return EVMResponse(**evm.__dict__)


@router.get("/{project_id}/health", response_model=dict)
async def get_project_health(
    project_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Evaluate and return project health status (EP-002).

    Health classification rules:
    - BLOCKED: Has blockers OR overdue_tasks >= 3
    - AT_RISK: target_date <= 7 days AND open_tasks > 0
    - NO_NEXT_STEP: siguiente_paso is empty or whitespace
    - OK: None of the above
    """
    result = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(project_id))
    _check_rls(project, current_user["user_id"])

    # Evaluate health (placeholder: no task integration yet)
    # TODO: Query overdue_tasks and open_tasks from Tasks table once EP-004 is complete
    health_result = HealthDetectionService.detect_health(project, overdue_tasks_count=0, open_tasks_count=0)

    return {
        "project_id": str(project_id),
        "status": health_result["status"],
        "evidence": health_result["evidence"],
        "details": health_result["details"],
    }
