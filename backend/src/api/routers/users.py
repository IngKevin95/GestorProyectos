"""
Router de administración de usuarios (solo admin).
CRUD: listar, crear, actualizar rol, activar/desactivar.
"""
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.dependencies import admin_required
from src.core.exceptions import ConflictError, NotFoundError
from src.core.security import hash_password
from src.models.db_models import AuditLog, User
from src.models.schemas import (
    UserCreate,
    UserProfile,
    UserUpdate,
    UserWithStatus,
)

router = APIRouter(prefix="/users", tags=["Users (Admin)"])


@router.get("", response_model=list[UserWithStatus])
async def list_users(
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/{user_id}", response_model=UserWithStatus)
async def get_user(
    user_id: uuid.UUID,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User", str(user_id))
    return user


@router.post("", response_model=UserWithStatus, status_code=201)
async def create_user(
    body: UserCreate,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.email == body.email))
    if existing.scalar_one_or_none():
        raise ConflictError("A user with this email already exists")

    user = User(
        id=uuid.uuid4(),
        email=body.email,
        password_hash=hash_password(body.password),
        role=body.role,
        is_active=True,
        created_at=datetime.now(UTC),
        updated_at=datetime.now(UTC),
    )
    db.add(user)
    db.add(AuditLog(
        entity_type="user",
        entity_id=user.id,
        action="CREATE",
        new_value={"email": user.email, "role": user.role},
        changed_by=uuid.UUID(current_user["user_id"]),
    ))
    await db.commit()
    await db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserWithStatus)
async def update_user(
    user_id: uuid.UUID,
    body: UserUpdate,
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User", str(user_id))

    old_values = {"role": user.role, "is_active": user.is_active}

    if body.role is not None:
        user.role = body.role
    if body.is_active is not None:
        user.is_active = body.is_active
    if body.password is not None:
        user.password_hash = hash_password(body.password)

    user.updated_at = datetime.now(UTC)
    db.add(AuditLog(
        entity_type="user",
        entity_id=user.id,
        action="UPDATE",
        old_value=old_values,
        new_value={"role": user.role, "is_active": user.is_active},
        changed_by=uuid.UUID(current_user["user_id"]),
    ))
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/stats/summary")
async def users_summary(
    current_user: dict = Depends(admin_required),
    db: AsyncSession = Depends(get_db),
):
    total = await db.execute(select(func.count(User.id)))
    active = await db.execute(select(func.count(User.id)).where(User.is_active == True))
    admins = await db.execute(select(func.count(User.id)).where(User.role == "admin"))
    return {
        "total": total.scalar(),
        "active": active.scalar(),
        "admins": admins.scalar(),
    }
