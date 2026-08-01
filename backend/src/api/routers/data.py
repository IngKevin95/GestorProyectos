"""
Routers para CSV Import, Export PDF, Webhooks y Audit Trail.
"""
import logging
import uuid

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.exceptions import ForbiddenError, NotFoundError, InternalServerError
from src.models.db_models import AuditLog, Project, Webhook
from src.models.schemas import AuditLogResponse, WebhookCreate, WebhookResponse

logger = logging.getLogger(__name__)
from src.services.webhook_service import dispatch_webhook

router = APIRouter(tags=["Data & Integrations"])


# ─── WEBHOOKS ─────────────────────────────────────────────

@router.post("/webhooks", response_model=WebhookResponse, status_code=201)
async def create_webhook(
    body: WebhookCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == body.project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(body.project_id))
    if str(project.user_id) != current_user["user_id"]:
        raise ForbiddenError()

    webhook = Webhook(
        user_id=uuid.UUID(current_user["user_id"]),
        project_id=body.project_id,
        url=str(body.url),
        secret=body.secret,
        cpi_threshold=body.cpi_threshold,
        spi_threshold=body.spi_threshold,
    )
    db.add(webhook)
    await db.commit()
    await db.refresh(webhook)
    return webhook


@router.get("/webhooks", response_model=list[WebhookResponse])
async def list_webhooks(
    project_id: uuid.UUID | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Webhook).where(Webhook.user_id == uuid.UUID(current_user["user_id"]))
    if project_id:
        stmt = stmt.where(Webhook.project_id == project_id)
    result = await db.execute(stmt)
    return result.scalars().all()


@router.delete("/webhooks/{webhook_id}", status_code=204)
async def delete_webhook(
    webhook_id: uuid.UUID,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Webhook).where(Webhook.id == webhook_id))
    webhook = result.scalar_one_or_none()
    if not webhook:
        raise NotFoundError("Webhook", str(webhook_id))
    if str(webhook.user_id) != current_user["user_id"]:
        raise ForbiddenError()
    await db.delete(webhook)
    await db.commit()


# ─── AUDIT TRAIL ──────────────────────────────────────────

@router.get("/projects/{project_id}/audit", response_model=list[AuditLogResponse])
async def get_audit_log(
    project_id: uuid.UUID,
    entity_type: str | None = Query(None),
    limit: int = Query(100, le=500),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Project).where(Project.id == project_id, Project.deleted_at == None))
    project = result.scalar_one_or_none()
    if not project:
        raise NotFoundError("Project", str(project_id))
    if str(project.user_id) != current_user["user_id"]:
        raise ForbiddenError()

    # Filter by project_id column (covers all entity types linked to this project)
    stmt = (
        select(AuditLog)
        .where(AuditLog.project_id == project_id)
        .order_by(AuditLog.changed_at.desc())
        .limit(limit)
    )
    if entity_type:
        stmt = stmt.where(AuditLog.entity_type == entity_type)
    result = await db.execute(stmt)
    return result.scalars().all()
