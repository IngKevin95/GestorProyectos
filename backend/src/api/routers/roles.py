"""
Router de administración de roles (solo admin).
CRUD: listar, crear, actualizar, eliminar.
"""
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.dependencies import admin_required
from src.core.exceptions import ConflictError, ForbiddenError, NotFoundError
from src.models.db_models import AuditLog, Role
from src.models.schemas import (
    ALL_PERMISSIONS,
    RoleCreate,
    RoleResponse,
    RoleUpdate,
)

router = APIRouter(prefix="/roles", tags=["Roles (Admin)"])


@router.get("", response_model=list[RoleResponse])
async def list_roles(
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Role).order_by(Role.is_system.desc(), Role.created_at))
    return result.scalars().all()


@router.get("/permissions", response_model=list[str])
async def list_available_permissions(
    current_user: dict = Depends(admin_required),
):
    """Return all available permission keys in the system."""
    return ALL_PERMISSIONS


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: uuid.UUID,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise NotFoundError("Role", str(role_id))
    return role


@router.post("", response_model=RoleResponse, status_code=201)
async def create_role(
    body: RoleCreate,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(Role).where(Role.name == body.name))
    if existing.scalar_one_or_none():
        raise ConflictError(f"A role with name '{body.name}' already exists")

    role = Role(
        id=uuid.uuid4(),
        name=body.name,
        display_name=body.display_name,
        description=body.description,
        permissions=body.permissions,
        is_system=False,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(role)
    db.add(AuditLog(
        entity_type="role",
        entity_id=role.id,
        action="CREATE",
        new_value={"name": role.name, "display_name": role.display_name, "permissions": role.permissions},
        changed_by=uuid.UUID(current_user["user_id"]),
    ))
    await db.commit()
    await db.refresh(role)
    return role


@router.put("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: uuid.UUID,
    body: RoleUpdate,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise NotFoundError("Role", str(role_id))

    old_values = {
        "display_name": role.display_name,
        "description": role.description,
        "permissions": role.permissions,
    }

    if body.display_name is not None:
        role.display_name = body.display_name
    if body.description is not None:
        role.description = body.description
    if body.permissions is not None:
        role.permissions = body.permissions

    role.updated_at = datetime.now(UTC)

    new_values = {
        "display_name": role.display_name,
        "description": role.description,
        "permissions": role.permissions,
    }

    db.add(AuditLog(
        entity_type="role",
        entity_id=role.id,
        action="UPDATE",
        old_value=old_values,
        new_value=new_values,
        changed_by=uuid.UUID(current_user["user_id"]),
    ))
    await db.commit()
    await db.refresh(role)
    return role


@router.delete("/{role_id}", status_code=204)
async def delete_role(
    role_id: uuid.UUID,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Role).where(Role.id == role_id))
    role = result.scalar_one_or_none()
    if not role:
        raise NotFoundError("Role", str(role_id))

    if role.is_system:
        raise ForbiddenError("Cannot delete a system role")

    db.add(AuditLog(
        entity_type="role",
        entity_id=role.id,
        action="DELETE",
        old_value={"name": role.name, "display_name": role.display_name},
        changed_by=uuid.UUID(current_user["user_id"]),
    ))
    await db.delete(role)
    await db.commit()
