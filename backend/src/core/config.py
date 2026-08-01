"""
Configuración centralizada de la aplicación.
Usa Pydantic BaseSettings para validar variables de entorno en startup.
Fail-fast: si falta una variable requerida, la app no arranca.
"""
from functools import lru_cache
from typing import Literal

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env.dev",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # --- App ---
    environment: Literal["development", "staging", "production"] = "development"
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = "INFO"
    debug: bool = False
    app_host: str = "0.0.0.0"
    app_port: int = 8000

    # --- Database ---
    database_url: str = Field(..., min_length=10)

    # --- Redis ---
    redis_url: str = Field(default="redis://localhost:6379")

    # --- JWT (DECISIÓN: 1h access + 7d refresh) ---
    jwt_secret: str = Field(..., alias="JWT_SECRET_KEY", min_length=32)
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60
    refresh_token_expire_days: int = 7

    # --- CORS (DECISIÓN 9: whitelist estricto) ---
    cors_origins: str = "http://localhost:3000"

    # --- Webhooks (DECISIÓN 5) ---
    webhook_secret: str = Field(default="your-webhook-secret-change-in-prod", min_length=16)
    webhook_max_retries: int = 5
    webhook_timeout_seconds: int = 30
    webhook_max_deliveries_per_hour: int = 100

    # --- Upload ---
    upload_max_size_mb: int = 10
    upload_allowed_extensions: str = "csv"

    # --- Session Security (DECISIÓN 9) ---
    session_timeout_minutes: int = 15
    lock_duration_minutes: int = 5
    max_failed_login_attempts: int = 5
    max_concurrent_sessions: int = 3

    # --- Rate Limiting (DECISIÓN 9) ---
    rate_limit_per_user: int = 500
    rate_limit_per_ip: int = 1000
    rate_limit_sensitive: int = 50

    @field_validator("cors_origins")
    @classmethod
    def parse_cors_origins(cls, v: str) -> list[str]:
        return [origin.strip() for origin in v.split(",") if origin.strip()]

    @property
    def is_production(self) -> bool:
        return self.environment == "production"

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


@lru_cache
def get_settings() -> Settings:
    """Retorna instancia singleton de Settings (cacheada)."""
    return Settings()
