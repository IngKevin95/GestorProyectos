"""
Task statistics calculation service for EP-004.
Calculates open_tasks and overdue_tasks counts for projects.
"""
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from src.models.db_models import Task, Project


def calculate_project_stats(db: Session, project_id: UUID) -> dict:
    """
    Calculate open_tasks and overdue_tasks counts for a project.

    open_tasks = COUNT(tasks WHERE status IN ('abierta', 'bloqueada'))
    overdue_tasks = COUNT(tasks WHERE status = 'vencida')

    Returns:
        dict: {"open_tasks": int, "overdue_tasks": int}
    """
    # Query open and blocked tasks
    open_count = db.query(Task).filter(
        Task.project_id == project_id,
        Task.status.in_(["abierta", "bloqueada"])
    ).count()

    # Query overdue tasks
    overdue_count = db.query(Task).filter(
        Task.project_id == project_id,
        Task.status == "vencida"
    ).count()

    return {
        "open_tasks": open_count,
        "overdue_tasks": overdue_count,
    }


def update_project_task_counts(db: Session, project_id: UUID) -> Project:
    """
    Update the project's open_tasks and overdue_tasks fields based on current Task records.
    This is called after creating/updating/deleting a task.

    Implements optimistic locking: increments Project.version to ensure consistency.

    Returns:
        Project: Updated project object with persisted stats
    """
    stats = calculate_project_stats(db, project_id)

    project = db.query(Project).filter(Project.id == project_id).first()
    if project:
        project.open_tasks = stats["open_tasks"]
        project.overdue_tasks = stats["overdue_tasks"]
        project.version += 1
        db.commit()
        db.refresh(project)

    return project


async def update_project_task_counts_async(db: AsyncSession, project_id: UUID) -> Project:
    """
    Async version: Update the project's open_tasks and overdue_tasks fields based on current Task records.
    This is called after creating/updating/deleting a task.

    Implements optimistic locking: increments Project.version to ensure consistency.

    Returns:
        Project: Updated project object with persisted stats
    """
    # Calculate stats
    open_stmt = select(Task).where(
        Task.project_id == project_id,
        Task.status.in_(["abierta", "bloqueada"])
    )
    overdue_stmt = select(Task).where(
        Task.project_id == project_id,
        Task.status == "vencida"
    )

    open_result = await db.execute(open_stmt)
    open_count = len(open_result.scalars().all())

    overdue_result = await db.execute(overdue_stmt)
    overdue_count = len(overdue_result.scalars().all())

    # Update project
    project_stmt = select(Project).where(Project.id == project_id)
    result = await db.execute(project_stmt)
    project = result.scalar_one_or_none()

    if project:
        project.open_tasks = open_count
        project.overdue_tasks = overdue_count
        project.version += 1
        db.add(project)
        await db.commit()
        await db.refresh(project)

    return project
