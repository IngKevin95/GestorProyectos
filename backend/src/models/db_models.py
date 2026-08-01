"""
SQLAlchemy ORM models — Todos los modelos de la BD con soft delete y audit trail.
13 tablas según especificación.
"""
import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    Date,
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
    event,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship


class Base(DeclarativeBase):
    pass


# Constants for repeated SQL literals (S1192)
_CK_TOTAL_EFFORT_POSITIVE = "total_effort > 0"
_FK_USERS_ID = "users.id"
_FK_PROFILES_ID = "profiles.id"


# --- USERS ---
class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(50), nullable=False, default="user")
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    failed_login_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    last_failed_login: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    projects: Mapped[list["Project"]] = relationship("Project", back_populates="owner")
    sessions: Mapped[list["Session"]] = relationship("Session", back_populates="user")
    account_lockouts: Mapped[list["AccountLockout"]] = relationship("AccountLockout", back_populates="user")


# --- PROJECTS ---
class Project(Base):
    __tablename__ = "projects"
    __table_args__ = (
        CheckConstraint(_CK_TOTAL_EFFORT_POSITIVE, name="ck_projects_effort_positive"),
        UniqueConstraint("user_id", "name", "deleted_at", name="uq_projects_user_name"),
        Index("idx_projects_user_id", "user_id"),
        Index("idx_projects_deleted_at", "deleted_at"),
        Index("idx_projects_state", "state"),
        Index("idx_projects_status", "status"),
        Index("idx_projects_priority", "prioridad"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    total_effort: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    planned_effort: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    completed_effort: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    state: Mapped[str] = mapped_column(
        Enum("PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED", name="project_state"),
        nullable=False,
        default="PLANNING",
    )
    # Campos para gestión de proyectos (EP-001)
    responsable: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="Activo")  # Activo, En Pausa, Completado, Cancelado
    prioridad: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # Alta, Media, Baja
    fecha_limite: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    siguiente_paso: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    bloqueos: Mapped[Optional[str]] = mapped_column(String(1000), nullable=True)
    notas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    tipo_proyecto: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # Mantenimiento, Recurrente, Diagnóstico, Proyecto
    # Health detection (EP-002)
    health_status: Mapped[str] = mapped_column(
        Enum("ok", "blocked", "at_risk", "no_next_step", name="project_health_status"),
        nullable=False,
        default="ok"
    )
    # Priority configuration (EP-003)
    priority_strategy: Mapped[str] = mapped_column(
        Enum("relative", "absolute", "mixed", name="priority_strategy_enum"),
        nullable=False,
        default="relative"
    )
    priority_constant: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    business_value: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False, default=0.0)
    # Task statistics (EP-004)
    open_tasks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    overdue_tasks: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    # ---
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey(_FK_USERS_ID), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)

    owner: Mapped["User"] = relationship("User", back_populates="projects")
    tasks: Mapped[list["Task"]] = relationship("Task", back_populates="project", cascade="all, delete-orphan")


# --- AUDIT LOG (inmutable) ---
class AuditLog(Base):
    __tablename__ = "audit_log"
    __table_args__ = (
        Index("idx_audit_log_entity", "entity_type", "entity_id"),
        Index("idx_audit_log_changed_at", "changed_at"),
        Index("idx_audit_log_changed_by", "changed_by"),
        Index("idx_audit_log_project_id", "project_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), nullable=True)
    entity_type: Mapped[str] = mapped_column(String(50), nullable=False)
    entity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # CREATE, UPDATE, DELETE
    old_value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    new_value: Mapped[Optional[dict]] = mapped_column(JSONB, nullable=True)
    changed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey(_FK_USERS_ID), nullable=False)
    changed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# --- WEBHOOKS ---
class Webhook(Base):
    __tablename__ = "webhooks"
    __table_args__ = (
        Index("idx_webhooks_user_id", "user_id"),
        Index("idx_webhooks_project_id", "project_id"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey(_FK_USERS_ID), nullable=False)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    url: Mapped[str] = mapped_column(String(2048), nullable=False)
    secret: Mapped[str] = mapped_column(String(255), nullable=False)
    spi_threshold: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False, default=0.9)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


class WebhookDelivery(Base):
    __tablename__ = "webhook_deliveries"
    __table_args__ = (
        Index("idx_webhook_deliveries_webhook_id", "webhook_id"),
        Index("idx_webhook_deliveries_status", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    webhook_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("webhooks.id"), nullable=False)
    event_type: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False)
    attempt_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    next_retry_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(50), nullable=False, default="pending")  # pending, delivered, failed
    response_status_code: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    last_error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    delivered_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


class WebhookFailedQueue(Base):
    __tablename__ = "webhooks_failed_queue"
    __table_args__ = (Index("idx_webhooks_failed_webhook_id", "webhook_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    webhook_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("webhooks.id"), nullable=False)
    delivery_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("webhook_deliveries.id"), nullable=False)
    last_error: Mapped[str] = mapped_column(Text, nullable=False)
    attempts_total: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    last_attempt_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())


# --- SESSIONS ---
class Session(Base):
    __tablename__ = "sessions"
    __table_args__ = (
        Index("idx_sessions_user_id", "user_id"),
        Index("idx_sessions_user_expires", "user_id", "expires_at"),
        Index("idx_sessions_token", "refresh_token_hash"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey(_FK_USERS_ID), nullable=False)
    refresh_token_hash: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    last_active_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    is_revoked: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped["User"] = relationship("User", back_populates="sessions")


# --- ACCOUNT LOCKOUTS ---
class AccountLockout(Base):
    __tablename__ = "account_lockouts"
    __table_args__ = (Index("idx_account_lockouts_user_id", "user_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey(_FK_USERS_ID), nullable=False)
    locked_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    locked_by_admin: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    unlocked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    reason: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="account_lockouts")


# --- PROFILES ---
class Profile(Base):
    __tablename__ = "profiles"
    __table_args__ = (
        CheckConstraint("capacity_per_week > 0", name="ck_profiles_capacity_positive"),
        Index("idx_profiles_name", "name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False, unique=True)
    capacity_per_week: Mapped[float] = mapped_column(Numeric(15, 2), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)


# --- ROLES ---
class Role(Base):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    display_name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    permissions: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="[]")
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


# --- SYSTEM SETTINGS ---
class SystemSetting(Base):
    __tablename__ = "system_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(String(500), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


# --- PROJECT TEMPLATES ---
class ProjectTemplate(Base):
    __tablename__ = "project_templates"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False, unique=True)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    structure: Mapped[dict] = mapped_column(JSONB, nullable=False, server_default="[]")
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())


# --- TASKS (EP-004) ---
class Task(Base):
    __tablename__ = "tasks"
    __table_args__ = (
        Index("idx_tasks_project_id", "project_id"),
        Index("idx_tasks_project_status", "project_id", "status"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("projects.id"), nullable=False)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[str] = mapped_column(
        Enum("abierta", "vencida", "bloqueada", "cerrada", name="task_status"),
        nullable=False,
        default="abierta"
    )
    assignee: Mapped[str] = mapped_column(String(255), nullable=False)
    priority: Mapped[str] = mapped_column(
        Enum("alta", "media", "baja", name="task_priority"),
        nullable=False,
        default="media"
    )
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    version: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    project: Mapped["Project"] = relationship("Project", back_populates="tasks")
