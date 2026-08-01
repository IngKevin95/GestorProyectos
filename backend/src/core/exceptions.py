"""
Excepciones de dominio con códigos de error estándar.
"""
from fastapi import HTTPException, status


class DomainError(HTTPException):
    def __init__(self, status_code: int, code: str, message: str, details: dict | None = None):
        super().__init__(status_code=status_code, detail={"code": code, "message": message, "details": details or {}})


class NotFoundError(DomainError):
    def __init__(self, entity: str, entity_id: str = ""):
        super().__init__(404, "NOT_FOUND", f"{entity} not found", {"entity": entity, "id": entity_id})


class UnauthorizedError(DomainError):
    def __init__(self, message: str = "Invalid credentials"):
        super().__init__(401, "UNAUTHORIZED", message)


class ForbiddenError(DomainError):
    def __init__(self, message: str = "Permission denied"):
        super().__init__(403, "FORBIDDEN", message)


class ConflictError(DomainError):
    """Optimistic locking conflict (versión desactualizada)."""
    def __init__(self, message: str = "Resource was modified. Please reload."):
        super().__init__(409, "CONFLICT", message)


class InvalidStateTransitionError(DomainError):
    def __init__(self, current: str, target: str):
        super().__init__(400, "INVALID_STATE_TRANSITION", f"Cannot transition from {current} to {target}")


class ProjectPausedError(DomainError):
    """Intento de modificar datos en proyecto PAUSED."""
    def __init__(self):
        super().__init__(403, "PROJECT_PAUSED", "Project is PAUSED. No modifications allowed.")


class AccountLockedError(DomainError):
    def __init__(self, minutes_remaining: int = 5):
        super().__init__(423, "ACCOUNT_LOCKED", f"Account locked. Try again in {minutes_remaining} minutes.")


class RateLimitError(DomainError):
    def __init__(self):
        super().__init__(429, "RATE_LIMIT_EXCEEDED", "Too many requests. Please slow down.")


class CSVValidationError(DomainError):
    def __init__(self, errors: list[dict]):
        super().__init__(422, "CSV_VALIDATION_FAILED", "CSV file contains validation errors.", {"errors": errors})


class InvalidTokenError(DomainError):
    def __init__(self):
        super().__init__(401, "INVALID_TOKEN", "Token is invalid or expired.")


class InternalServerError(DomainError):
    def __init__(self, message: str = "Internal server error"):
        super().__init__(500, "INTERNAL_ERROR", message)
