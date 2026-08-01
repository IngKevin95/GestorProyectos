"""
Webhook Service: HMAC-SHA256, retry con backoff exponencial, 3 intentos máx.
DECISIÓN 5: Header X-App-Signature-256.
"""
import hashlib
import hmac
import json
import uuid
from datetime import UTC, datetime, timedelta

import httpx
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.db_models import WebhookDelivery, WebhookFailedQueue


RETRY_DELAYS = [60, 300, 900]  # 1min, 5min, 15min


def _sign_payload(payload: str, secret: str) -> str:
    """DECISIÓN 5: X-App-Signature-256 = sha256=<hmac>"""
    return "sha256=" + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()


async def dispatch_webhook(
    webhook_id: uuid.UUID,
    url: str,
    secret: str,
    event_type: str,
    payload: dict,
    db: AsyncSession,
) -> None:
    """
    Envía webhook con firma HMAC. Registra entrega en WebhookDelivery.
    Si falla, encola para reintentos con backoff exponencial.
    """
    body = json.dumps(payload, default=str)
    signature = _sign_payload(body, secret)
    headers = {
        "Content-Type": "application/json",
        "X-App-Signature-256": signature,
        "X-App-Event": event_type,
    }

    delivery = WebhookDelivery(
        webhook_id=webhook_id,
        event_type=event_type,
        payload=payload,
        attempt_count=1,
        status="pending",
    )
    db.add(delivery)
    await db.flush()

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, content=body, headers=headers)
            delivery.response_status_code = response.status_code
            if response.status_code < 300:
                delivery.status = "delivered"
                delivery.delivered_at = datetime.now(UTC)
            else:
                delivery.status = "failed"
                delivery.last_error = f"HTTP {response.status_code}"
                _schedule_retry(delivery)
    except Exception as e:
        delivery.status = "failed"
        delivery.last_error = str(e)
        _schedule_retry(delivery)

    if delivery.status == "failed" and delivery.attempt_count > len(RETRY_DELAYS):
        db.add(WebhookFailedQueue(
            webhook_id=webhook_id,
            delivery_id=delivery.id,
            last_error=delivery.last_error or "",
            attempts_total=delivery.attempt_count,
            last_attempt_at=datetime.now(UTC),
        ))


def _schedule_retry(delivery: WebhookDelivery) -> None:
    attempt = delivery.attempt_count
    if attempt <= len(RETRY_DELAYS):
        delivery.next_retry_at = datetime.now(UTC) + timedelta(seconds=RETRY_DELAYS[attempt - 1])
    else:
        delivery.next_retry_at = None  # No more retries


async def retry_pending_deliveries(db: AsyncSession) -> None:
    """Llamado por background task periódico para reintentar deliveries pendientes."""
    from src.models.db_models import Webhook
    now = datetime.now(UTC)
    result = await db.execute(
        select(WebhookDelivery).where(
            WebhookDelivery.status == "failed",
            WebhookDelivery.next_retry_at <= now,
            WebhookDelivery.attempt_count <= len(RETRY_DELAYS),
        )
    )
    deliveries = result.scalars().all()

    for delivery in deliveries:
        wh_result = await db.execute(select(Webhook).where(Webhook.id == delivery.webhook_id))
        webhook = wh_result.scalar_one_or_none()
        if not webhook or not webhook.is_active:
            continue

        delivery.attempt_count += 1
        body = json.dumps(delivery.payload, default=str)
        signature = _sign_payload(body, webhook.secret)
        headers = {
            "Content-Type": "application/json",
            "X-App-Signature-256": signature,
            "X-App-Event": delivery.event_type,
        }

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(webhook.url, content=body, headers=headers)
                if response.status_code < 300:
                    delivery.status = "delivered"
                    delivery.delivered_at = now
                else:
                    _schedule_retry(delivery)
        except Exception as e:
            delivery.last_error = str(e)
            _schedule_retry(delivery)
