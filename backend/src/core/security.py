"""
Seguridad: JWT, hashing de contraseñas, generación de tokens.
Decisión: Access token 1h, Refresh token 7d, Argon2id passwords.
"""
import hashlib
import secrets
from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt
from passlib.context import CryptContext

from src.core.config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


# ──────────────────────────────────────────
# Password hashing
# ──────────────────────────────────────────
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ──────────────────────────────────────────
# JWT tokens
# ──────────────────────────────────────────
def _create_token(data: dict[str, Any], expires_delta: timedelta) -> str:
    payload = data.copy()
    payload["exp"] = datetime.now(UTC) + expires_delta
    payload["iat"] = datetime.now(UTC)
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: str, email: str, role: str) -> str:
    return _create_token(
        {"sub": user_id, "email": email, "role": role, "type": "access"},
        timedelta(minutes=settings.access_token_expire_minutes),
    )


def create_refresh_token(user_id: str) -> str:
    return _create_token(
        {"sub": user_id, "type": "refresh"},
        timedelta(days=settings.refresh_token_expire_days),
    )


def decode_access_token(token: str) -> dict[str, Any]:
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != "access":
        raise JWTError("Invalid token type")
    return payload


def decode_refresh_token(token: str) -> dict[str, Any]:
    payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    if payload.get("type") != "refresh":
        raise JWTError("Invalid token type")
    return payload


# ──────────────────────────────────────────
# Refresh token storage (hashed)
# ──────────────────────────────────────────
def hash_refresh_token(token: str) -> str:
    """Almacena hash del refresh token en BD, no el token en claro."""
    return hashlib.sha256(token.encode()).hexdigest()


def generate_webhook_signature(payload: str, secret: str) -> str:
    """HMAC-SHA256 para firma de webhooks. Header: X-App-Signature-256"""
    import hmac
    return "sha256=" + hmac.new(secret.encode(), payload.encode(), hashlib.sha256).hexdigest()
