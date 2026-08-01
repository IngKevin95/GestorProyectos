"""
Router de autenticación: login, logout, refresh, revoke.
"""
import uuid
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import get_settings
from src.core.database import get_db
from src.core.dependencies import get_current_user
from src.core.exceptions import AccountLockedError, InvalidTokenError, UnauthorizedError
from src.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from src.models.db_models import AccountLockout, Role, Session, User
from src.models.schemas import LoginRequest, RefreshRequest, TokenResponse, UserProfile

router = APIRouter(prefix="/auth", tags=["Authentication"])
settings = get_settings()


async def _check_lockout(user: User, db: AsyncSession) -> None:
    """Raises AccountLockedError if user is currently locked out. Auto-unlocks expired lockouts."""
    lockout_result = await db.execute(
        select(AccountLockout)
        .where(AccountLockout.user_id == user.id, AccountLockout.unlocked_at == None)
        .order_by(AccountLockout.locked_at.desc())
    )
    lockout = lockout_result.scalar_one_or_none()
    if not lockout:
        return
    now = datetime.now(UTC)
    lock_expires = lockout.locked_at.replace(tzinfo=UTC) + timedelta(minutes=settings.lock_duration_minutes)
    if now < lock_expires:
        remaining = int((lock_expires - now).total_seconds() / 60) + 1
        raise AccountLockedError(remaining)
    # Lockout expired — auto-unlock and reset counter
    lockout.unlocked_at = now
    user.failed_login_count = 0
    await db.commit()


async def _handle_failed_login(user: User, db: AsyncSession) -> None:
    """Track failed login attempts and lock account if threshold exceeded."""
    user.failed_login_count = (user.failed_login_count or 0) + 1
    user.last_failed_login = datetime.now(UTC)
    if user.failed_login_count >= settings.max_failed_login_attempts:
        db.add(AccountLockout(
            user_id=user.id,
            locked_by_admin=False,
            reason=f"Too many failed login attempts ({user.failed_login_count})",
        ))
        await db.commit()
        raise AccountLockedError(settings.lock_duration_minutes)
    await db.commit()


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Find user (include inactive to give proper lockout feedback)
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user:
        await _check_lockout(user, db)

    # Validate credentials
    if not user or not user.is_active or not verify_password(body.password, user.password_hash):
        if user and user.is_active:
            await _handle_failed_login(user, db)
        raise UnauthorizedError("Invalid email or password")

    now = datetime.now(UTC)

    # Reset failed login counter on successful login
    if user.failed_login_count > 0:
        user.failed_login_count = 0
        user.last_failed_login = None

    # Check concurrent sessions (DECISIÓN 9)
    sessions_result = await db.execute(
        select(Session).where(Session.user_id == user.id, Session.is_revoked == False, Session.expires_at > now)
    )
    active_sessions = sessions_result.scalars().all()

    if len(active_sessions) >= settings.max_concurrent_sessions:
        for s in active_sessions:
            s.is_revoked = True
        db.add(AccountLockout(user_id=user.id, locked_by_admin=False, reason="Concurrent session limit exceeded"))
        await db.commit()
        raise AccountLockedError(settings.lock_duration_minutes)

    # Generate tokens
    access_token = create_access_token(str(user.id), user.email, user.role)
    refresh_token = create_refresh_token(str(user.id))

    db.add(Session(
        user_id=user.id,
        refresh_token_hash=hash_refresh_token(refresh_token),
        expires_at=now + timedelta(days=settings.refresh_token_expire_days),
    ))
    await db.commit()

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/logout")
async def logout(
    body: RefreshRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    token_hash = hash_refresh_token(body.refresh_token)
    result = await db.execute(select(Session).where(Session.refresh_token_hash == token_hash))
    session = result.scalar_one_or_none()
    if session:
        session.is_revoked = True
        await db.commit()
    return {"message": "Logged out successfully"}


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, db: AsyncSession = Depends(get_db)):
    from jose import JWTError
    try:
        decode_refresh_token(body.refresh_token)
    except JWTError:
        raise InvalidTokenError()

    token_hash = hash_refresh_token(body.refresh_token)
    now = datetime.now(UTC)

    result = await db.execute(
        select(Session).where(
            Session.refresh_token_hash == token_hash,
            Session.is_revoked == False,
            Session.expires_at > now,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise InvalidTokenError()

    # Rotation: revoke old, issue new
    session.is_revoked = True
    user_result = await db.execute(select(User).where(User.id == session.user_id))
    user = user_result.scalar_one()

    new_access = create_access_token(str(user.id), user.email, user.role)
    new_refresh = create_refresh_token(str(user.id))

    db.add(Session(
        user_id=user.id,
        refresh_token_hash=hash_refresh_token(new_refresh),
        expires_at=now + timedelta(days=settings.refresh_token_expire_days),
    ))
    await db.commit()

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/revoke")
async def revoke_all(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    """Revocar TODOS los refresh tokens del usuario (logout de todos los dispositivos)."""
    result = await db.execute(
        select(Session).where(Session.user_id == uuid.UUID(current_user["user_id"]), Session.is_revoked == False)
    )
    for session in result.scalars().all():
        session.is_revoked = True
    await db.commit()
    return {"message": "All sessions revoked"}


@router.get("/me", response_model=UserProfile)
async def get_me(current_user: dict = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.id == uuid.UUID(current_user["user_id"])))
    user = result.scalar_one_or_none()
    if not user:
        raise UnauthorizedError()
    # Fetch role permissions
    role_result = await db.execute(select(Role).where(Role.name == user.role))
    role = role_result.scalar_one_or_none()
    permissions = role.permissions if role else []
    # Build response manually to include permissions
    return UserProfile(
        id=user.id,
        email=user.email,
        role=user.role,
        permissions=list(permissions),
        created_at=user.created_at,
    )
