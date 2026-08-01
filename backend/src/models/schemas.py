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
    "phases.create", "phases.read", "phases.update", "phases.delete",
    "departments.create", "departments.read", "departments.update", "departments.delete",
    "activities.create", "activities.read", "activities.update", "activities.delete",
    "activities.edit_estimates",
    "evm.read", "audit.read", "csv.import", "csv.export",
    "webhooks.manage", "users.manage", "roles.manage",
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
    currency: str = "COP"
    currency_symbol: str = "$"
    currency_decimals: str = "0"
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
            "country", "currency", "currency_symbol", "currency_decimals",
            "language", "timezone", "date_format", "thousand_separator", "decimal_separator",
        }
        invalid = set(v.keys()) - allowed
        if invalid:
            raise ValueError(f"Invalid setting keys: {', '.join(invalid)}")
        return v


# --- Project Templates ---
class TemplateDepartment(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    bac_percent: float = Field(..., gt=0, le=100)

class TemplatePhase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    bac_percent: float = Field(..., gt=0, le=100)
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

VALID_TRANSITIONS: dict[str, list[str]] = {
    "PLANNING": ["ACTIVE", "CANCELLED"],
    "ACTIVE": ["PAUSED", "COMPLETED", "CANCELLED"],
    "PAUSED": ["ACTIVE", "COMPLETED", "CANCELLED"],
    "COMPLETED": ["PLANNING"],
    "CANCELLED": ["PLANNING"],
}


class ProjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    bac: float = Field(gt=0)
    responsable: str = Field(min_length=1, max_length=255)
    estado: ProjectStatus = "Activo"
    prioridad: Optional[ProjectPriority] = None
    fecha_limite: Optional[date] = None
    siguiente_paso: Optional[str] = Field(None, max_length=1000)
    bloqueos: Optional[str] = Field(None, max_length=1000)
    notas: Optional[str] = Field(None, max_length=5000)
    tipo_proyecto: Optional[ProjectType] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    bac: Optional[float] = Field(None, gt=0)
    state: Optional[ProjectState] = None
    responsable: Optional[str] = Field(None, min_length=1, max_length=255)
    estado: Optional[ProjectStatus] = None
    prioridad: Optional[ProjectPriority] = None
    fecha_limite: Optional[date] = None
    siguiente_paso: Optional[str] = Field(None, max_length=1000)
    bloqueos: Optional[str] = Field(None, max_length=1000)
    notas: Optional[str] = Field(None, max_length=5000)
    tipo_proyecto: Optional[ProjectType] = None
    version: int


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    bac: float
    state: ProjectState
    responsable: str
    estado: ProjectStatus
    prioridad: Optional[ProjectPriority] = None
    fecha_limite: Optional[date] = None
    siguiente_paso: Optional[str] = None
    bloqueos: Optional[str] = None
    notas: Optional[str] = None
    tipo_proyecto: Optional[ProjectType] = None
    user_id: uuid.UUID
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Phases ---
class PhaseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    bac: float = Field(gt=0)


class PhaseUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    bac: Optional[float] = Field(None, gt=0)
    version: int


class PhaseResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    bac: float
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Departments ---
class DepartmentCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    bac: float = Field(gt=0)


class DepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    bac: Optional[float] = Field(None, gt=0)
    version: int


class DepartmentResponse(BaseModel):
    id: uuid.UUID
    phase_id: uuid.UUID
    name: str
    bac: float
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Profiles ---
class ProfileCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    hourly_rate: float = Field(gt=0)


class ProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    hourly_rate: Optional[float] = Field(None, gt=0)
    is_active: Optional[bool] = None
    version: int


class ProfileResponse(BaseModel):
    id: uuid.UUID
    name: str
    hourly_rate: float
    is_active: bool
    version: int
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# --- Activities ---
class ActivityCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    bac: float = Field(gt=0)                          # Presupuesto manual (siempre requerido)
    profile_id: Optional[uuid.UUID] = None
    estimated_hours: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    percentage_completed: float = Field(default=0, ge=0, le=100)
    actual_cost: Optional[float] = Field(None, ge=0)  # None → se calcula desde perfil × horas

    @model_validator(mode="after")
    def validate_profile_fields(self) -> "ActivityCreate":
        has_profile = self.profile_id is not None
        has_hours = self.estimated_hours is not None
        if has_profile != has_hours:
            raise ValueError("profile_id and estimated_hours must both be provided or both omitted")
        return self


class ActivityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    bac: Optional[float] = Field(None, gt=0)
    profile_id: Optional[uuid.UUID] = None
    estimated_hours: Optional[float] = Field(None, ge=0)
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    percentage_completed: Optional[float] = Field(None, ge=0, le=100)
    actual_cost: Optional[float] = Field(None, ge=0)
    version: int


class ActivityResponse(BaseModel):
    id: uuid.UUID
    department_id: uuid.UUID
    name: str
    bac: float
    profile_id: Optional[uuid.UUID] = None
    estimated_hours: Optional[float] = None
    profile_name: Optional[str] = None
    hourly_rate: Optional[float] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    percentage_planned: float         # Calculado dinámicamente desde fechas
    percentage_completed: float
    actual_cost: float
    version: int
    created_at: datetime

    model_config = {"from_attributes": True}


# --- Activity Logs ---
class ActivityLogCreate(BaseModel):
    logged_date: date
    hours_worked: float = Field(ge=0)
    percentage_completed: float = Field(ge=0, le=100)
    notes: Optional[str] = Field(None, max_length=1000)
    profile_id: Optional[str] = None  # Perfil que trabajó → calcula AC real


class ActivityLogResponse(BaseModel):
    id: uuid.UUID
    activity_id: uuid.UUID
    logged_date: date
    hours_worked: float
    percentage_completed: float
    notes: Optional[str] = None
    profile_id: Optional[uuid.UUID] = None
    profile_name: Optional[str] = None
    hourly_rate: Optional[float] = None
    actual_cost_entry: Optional[float] = None  # hours_worked × hourly_rate de este registro
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


# --- EVM Indicators ---
class EVMResponse(BaseModel):
    pv: float
    ev: float
    ac: float
    bac: float
    cv: Optional[float]
    sv: Optional[float]
    cpi: Optional[float]
    spi: Optional[float]
    eac: Optional[float]
    vac: Optional[float]
    cpi_status: Literal["green", "yellow", "red", "neutral"]
    spi_status: Literal["green", "yellow", "red", "neutral"]
    ac_status: Literal["green", "yellow", "red", "neutral"] = "neutral"
    as_of: Optional[datetime] = None


# --- Webhooks ---
class WebhookCreate(BaseModel):
    project_id: uuid.UUID
    url: str = Field(min_length=1, max_length=2048)
    secret: str = Field(min_length=16, max_length=255)
    cpi_threshold: float = Field(default=0.9, ge=0, le=2)
    spi_threshold: float = Field(default=0.9, ge=0, le=2)


class WebhookResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    url: str
    cpi_threshold: float
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


# ──────────────────────────────────────────
# CSV Import
# ──────────────────────────────────────────
class CSVImportResult(BaseModel):
    imported: int
    errors: list[dict[str, Any]] = []
    project_id: uuid.UUID
