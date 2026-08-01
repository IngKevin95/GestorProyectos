"""
Task CRUD endpoints for EP-004 (Gestión de Tareas por Proyecto)
Routes: POST, GET, PUT, DELETE /api/v1/projects/{project_id}/tasks
"""
from uuid import UUID
from datetime import datetime, UTC
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.db_models import Task, Project
from src.models.schemas import TaskCreate, TaskUpdate, TaskResponse, TaskListResponse
from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.services.task_stats import update_project_task_counts_async

router = APIRouter(prefix="/projects", tags=["tasks"])


@router.post("/{project_id}/tasks", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    project_id: UUID,
    task_data: TaskCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Create a new task for a project."""
    # Verify project exists and user has access
    result = await db.execute(select(Project).where(
        Project.id == project_id,
        Project.user_id == UUID(current_user["user_id"])
    ))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create task
    task = Task(
        project_id=project_id,
        title=task_data.title,
        assignee=task_data.assignee,
        priority=task_data.priority,
        status=task_data.status,
        due_date=task_data.due_date,
        version=1,
    )
    db.add(task)
    await db.commit()
    await db.refresh(task)

    # Update project task counts
    await update_project_task_counts_async(db, project_id)

    return task


@router.get("/{project_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    project_id: UUID,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """List tasks for a project with optional filtering by status."""
    # Verify project exists and user has access
    result = await db.execute(select(Project).where(
        Project.id == project_id,
        Project.user_id == UUID(current_user["user_id"])
    ))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Build query
    stmt = select(Task).where(Task.project_id == project_id)

    # Apply status filter if provided
    if status_filter:
        statuses = [s.strip() for s in status_filter.split(",")]
        stmt = stmt.where(Task.status.in_(statuses))

    result = await db.execute(stmt)
    tasks = result.scalars().all()
    return TaskListResponse(tasks=tasks, count=len(tasks))


@router.get("/{project_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    project_id: UUID,
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Get a specific task."""
    # Verify project exists and user has access
    result = await db.execute(select(Project).where(
        Project.id == project_id,
        Project.user_id == UUID(current_user["user_id"])
    ))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = await db.execute(select(Task).where(
        Task.id == task_id,
        Task.project_id == project_id
    ))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    return task


@router.put("/{project_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    project_id: UUID,
    task_id: UUID,
    task_data: TaskUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Update a task with optimistic locking (version check)."""
    # Verify project exists and user has access
    result = await db.execute(select(Project).where(
        Project.id == project_id,
        Project.user_id == UUID(current_user["user_id"])
    ))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = await db.execute(select(Task).where(
        Task.id == task_id,
        Task.project_id == project_id
    ))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Optimistic locking: check version
    if task.version != task_data.version:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Version mismatch: expected {task.version}, got {task_data.version}",
        )

    # Update fields
    if task_data.title is not None:
        task.title = task_data.title
    if task_data.assignee is not None:
        task.assignee = task_data.assignee
    if task_data.priority is not None:
        task.priority = task_data.priority
    if task_data.status is not None:
        task.status = task_data.status
    if task_data.due_date is not None:
        task.due_date = task_data.due_date

    # Increment version
    task.version += 1
    task.updated_at = datetime.now(UTC)

    await db.commit()
    await db.refresh(task)

    # Update project task counts if status changed
    await update_project_task_counts_async(db, project_id)

    return task


@router.delete("/{project_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    project_id: UUID,
    task_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Delete a task."""
    # Verify project exists and user has access
    result = await db.execute(select(Project).where(
        Project.id == project_id,
        Project.user_id == UUID(current_user["user_id"])
    ))
    project = result.scalar_one_or_none()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    result = await db.execute(select(Task).where(
        Task.id == task_id,
        Task.project_id == project_id
    ))
    task = result.scalar_one_or_none()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()

    # Update project task counts after deletion
    await update_project_task_counts_async(db, project_id)

    return None
