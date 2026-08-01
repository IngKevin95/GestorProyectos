"""
Dependencias FastAPI reutilizables.
"""
import uuid
from datetime import UTC, datetime

from fastapi import Depends, Header
from jose import JWTError
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.core.exceptions import ForbiddenError, InvalidTokenError
from src.core.security import decode_access_token


async def get_current_user(
    authorization: str = Header(...),
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Valida JWT Bearer token y verifica que la sesión no esté revocada."""
    import os

    if not authorization.startswith("Bearer "):
        raise InvalidTokenError()
    token = authorization.removeprefix("Bearer ")
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise InvalidTokenError()

    # Skip session verification in tests
    if os.getenv("SKIP_SESSION_VERIFICATION") == "true":
        try:
            return {"user_id": payload["sub"], "email": payload["email"], "role": payload["role"]}
        except KeyError:
            raise InvalidTokenError()

    # Verificar que el usuario tiene al menos una sesión activa (no revocada).
    # Esto garantiza que un deploy (que revoca todas las sesiones) fuerza el logout.
    from src.models.db_models import Session as DBSession  # local import evita ciclo

    try:
        user_uuid = uuid.UUID(payload["sub"])
    except (ValueError, AttributeError):
        raise InvalidTokenError()

    result = await db.execute(
        select(DBSession)
        .where(
            DBSession.user_id == user_uuid,
            DBSession.is_revoked == False,  # noqa: E712
            DBSession.expires_at > datetime.now(UTC),
        )
        .limit(1)
    )
    if result.scalar_one_or_none() is None:
        raise InvalidTokenError()

    return {"user_id": payload["sub"], "email": payload["email"], "role": payload["role"]}


def admin_required(current_user: dict = Depends(get_current_user)) -> dict:
    if current_user["role"] != "admin":
        raise ForbiddenError("Admin role required")
    return current_user
