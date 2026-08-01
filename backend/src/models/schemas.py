"""
Schemas Pydantic para request/response de todos los endpoints.
"""
import uuid
from datetime import date, datetime
from typing import Any, Literal, Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator


# --- Shared ---
class PaginationMeta(BaseModel):
    limit: int
    cursor: Optional[str] = None
    has_more: bool
    total: Optional[int] = None


class ErrorDetail(BaseModel):
    code: str
    message: str
    details: dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    request_id: Optional[str] = None


class ErrorResponse(BaseModel):
    error: ErrorDetail


# --- Auth ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class RefreshRequest(BaseModel):
    refresh_token: str


class UserProfile(BaseModel):
    id: uuid.UUID
    email: str
    role: str
    permissions: list[str] = []
    created_at: datetime

    model_config = {"from_attributes": True}


class UserWithStatus(UserProfile):
    is_active: bool
    updated_at: datetime


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    role: Literal["admin", "user"] = "user"


class UserUpdate(BaseModel):
    role: Optional[Literal["admin", "user"]] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)


# --- Roles ---
# All available permission keys in the system
ALL_PERMISSIONS = [
    "projects.create", "projects.read", "projects.update", "projects.delete",
    "audit.read", "webhooks.manage", "users.manage", "roles.manage",
]


class RoleResponse(BaseModel):
    id: uuid.UUID
    name: str
    display_name: str
    description: Optional[str] = None
    permissions: list[str]
    is_system: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class RoleCreate(BaseModel):
    name: str = Field(min_length=2, max_length=50, pattern=r"^[a-z][a-z0-9_]*$")
    display_name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    permissions: list[str] = []

    @field_validator("permissions")
    @classmethod
    def validate_permissions(cls, v: list[str]) -> list[str]:
        invalid = [p for p in v if p not in ALL_PERMISSIONS]
        if invalid:
            raise ValueError(f"Invalid permissions: {', '.join(invalid)}")
        return v


class RoleUpdate(BaseModel):
    display_name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    permissions: Optional[list[str]] = None

    @field_validator("permissions")
    @classmethod
    def validate_permissions(cls, v: list[str] | None) -> list[str] | None:
        if v is not None:
            invalid = [p for p in v if p not in ALL_PERMISSIONS]
            if invalid:
                raise ValueError(f"Invalid permissions: {', '.join(invalid)}")
        return v


# --- System Settings ---
class SettingResponse(BaseModel):
    key: str
    value: str

    model_config = {"from_attributes": True}


class SettingsMap(BaseModel):
    """All system settings as a flat dict."""
    country: str = "CO"
    language: str = "es-CO"
    timezone: str = "America/Bogota"
    date_format: str = "dd/MM/yyyy"
    thousand_separator: str = "."
    decimal_separator: str = ","


class SettingsUpdate(BaseModel):
    settings: dict[str, str]

    @field_validator("settings")
    @classmethod
    def validate_keys(cls, v: dict[str, str]) -> dict[str, str]:
        allowed = {
            "country", "language", "timezone", "date_format", "thousand_separator", "decimal_separator",
        }
        invalid = set(v.keys()) - allowed
        if invalid:
            raise ValueError(f"Invalid setting keys: {', '.join(invalid)}")
        return v


# --- Project Templates ---
class TemplateDepartment(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    effort_percent: float = Field(..., gt=0, le=100)

class TemplatePhase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    effort_percent: float = Field(..., gt=0, le=100)
    departments: list[TemplateDepartment] = []

class TemplateCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=200)
    description: str | None = Field(None, max_length=500)
    structure: list[TemplatePhase]

class TemplateUpdate(BaseModel):
    name: str | None = Field(None, min_length=2, max_length=200)
    description: str | None = Field(None, max_length=500)
    structure: list[TemplatePhase] | None = None

class TemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    structure: list[dict]
    created_by: uuid.UUID
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Projects ---
ProjectState = Literal["PLANNING", "ACTIVE", "PAUSED", "COMPLETED", "CANCELLED"]
ProjectStatus = Literal["Activo", "En Pausa", "Completado", "Cancelado"]
ProjectPriority = Literal["Alta", "Media", "Baja"]
ProjectType = Literal["Mantenimiento", "Recurrente", "Diagnóstico", "Proyecto"]

PriorityStrategy = Literal["relative", "absolute", "mixed"]

VALID_TRANSITIONS: dict[str, list[str]] = {
    "PLANNING": ["ACTIVE", "CANCELLED"],
    "ACTIVE": ["PAUSED", "COMPLETED", "CANCELLED"],
    "PAUSED": ["ACTIVE", "COMPLETED", "CANCELLED"],
    "COMPLETED": ["PLANNING"],
    "CANCELLED": ["PLANNING"],
}


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    total_effort: float = Field(gt=0)
    responsable: str = Field(min_length=1, max_length=255)
    estado: ProjectStatus = "Activo"
    prioridad: Optional[ProjectPriority] = None
    fecha_limite: Optional[date] = None
    siguiente_paso: Optional[str] = Field(None, max_length=1000)
    bloqueos: Optional[str] = Field(None, max_length=1000)
    notas: Optional[str] = Field(None, max_length=5000)
    tipo_proyecto: Optional[ProjectType] = None
    priority_strategy: Optional[PriorityStrategy] = "relative"
    priority_constant: Optional[float] = Field(0.0, ge=0, le=100)
    business_value: Optional[float] = Field(0.0, ge=0, le=100)

    @field_validator("priority_constant")
    @classmethod
    def validate_priority_constant(cls, v: float | None) -> float | None:
        if v is not None and (v < 0 or v > 100):
            raise ValueError("priority_constant must be between 0 and 100")
        return v


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    total_effort: Optional[float] = Field(None, gt=0)
    planned_effort: Optional[float] = Field(None, ge=0)
    completed_effort: Optional[float] = Field(None, ge=0)
    state: Optional[ProjectState] = None
    responsable: Optional[str] = Field(None, min_length=1, max_length=255)
    estado: Optional[ProjectStatus] = None
    prioridad: Optional[ProjectPriority] = None
    fecha_limite: Optional[date] = None
    siguiente_paso: Optional[str] = Field(None, max_length=1000)
    bloqueos: Optional[str] = Field(None, max_length=1000)
    notas: Optional[str] = Field(None, max_length=5000)
    tipo_proyecto: Optional[ProjectType] = None
    priority_strategy: Optional[PriorityStrategy] = None
    priority_constant: Optional[float] = Field(None, ge=0, le=100)
    business_value: Optional[float] = Field(None, ge=0, le=100)
    version: int

    @field_validator("priority_constant")
    @classmethod
    def validate_priority_constant(cls, v: float | None) -> float | None:
        if v is not None and (v < 0 or v > 100):
            raise ValueError("priority_constant must be between 0 and 100")
        return v


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    total_effort: float
    planned_effort: float
    completed_effort: float
    state: ProjectState
    responsable: str
    status: ProjectStatus
    prioridad: Optional[ProjectPriority] = None
    fecha_limite: Optional[date] = None
    siguiente_paso: Optional[str] = None
    bloqueos: Optional[str] = None
    notas: Optional[str] = None
    tipo_proyecto: Optional[ProjectType] = None
    health_status: str = "ok"  # EP-002: ok, blocked, at_risk, no_next_step
    priority_strategy: str = "relative"
    priority_constant: float = 0.0
    business_value: float = 0.0
    score: Optional[float] = None
    user_id: uuid.UUID
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Phases ---
class PhaseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    total_effort: float = Field(gt=0)


class PhaseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    total_effort: Optional[float] = Field(None, gt=0)
    version: int


class PhaseResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    total_effort: float
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Departments ---
class DepartmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    total_effort: float = Field(gt=0)


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    total_effort: Optional[float] = Field(None, gt=0)
    version: int


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    phase_id: uuid.UUID
    name: str
    total_effort: float
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Profiles ---
class ProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    capacity_per_week: float = Field(gt=0)


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    capacity_per_week: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None
    version: int


class ProfileResponse(BaseModel):
    id: uuid.UUID
    name: str
    capacity_per_week: float
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}




# --- Webhooks ---
class WebhookCreate(BaseModel):
    project_id: uuid.UUID
    url: str = Field(min_length=1, max_length=2048)
    secret: str = Field(min_length=16, max_length=255)
    spi_threshold: float = Field(default=0.9, ge=0, le=2)


class WebhookResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    url: str
    spi_threshold: float
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ──────────────────────────────────────────
# Audit Trail
# ──────────────────────────────────────────
class AuditLogResponse(BaseModel):
    id: uuid.UUID
    project_id: Optional[uuid.UUID] = None
    entity_type: str
    entity_id: uuid.UUID
    action: str
    old_value: Optional[dict] = None
    new_value: Optional[dict] = None
    changed_by: uuid.UUID
    changed_at: datetime

    model_config = {"from_attributes": True}
