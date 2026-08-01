"""
FastAPI app — entry point con todos los routers y middleware.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from src.api.routers.auth import router as auth_router
from src.api.routers.data import router as data_router
from src.api.routers.projects import router as projects_router
from src.api.routers.users import router as users_router
from src.api.routers.roles import router as roles_router
from src.api.routers.settings import router as settings_router
from src.api.routers.templates import router as templates_router
from src.core.config import get_settings
from src.core.database import engine
from src.middleware.request_id import RequestIDMiddleware
from src.middleware.security_headers import SecurityHeadersMiddleware

settings = get_settings()

API_V1_PREFIX = "/api/v1"

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Revocar todas las sesiones activas al iniciar (fuerza logout en cada despliegue)
    from sqlalchemy import update as sql_update
    from sqlalchemy.ext.asyncio import AsyncSession
    from src.models.db_models import Session as DBSession

    async with AsyncSession(engine) as db:
        await db.execute(
            sql_update(DBSession)
            .where(DBSession.is_revoked == False)  # noqa: E712
            .values(is_revoked=True)
        )
        await db.commit()

    yield
    await engine.dispose()


app = FastAPI(
    title="GestorProyectos API",
    version="1.0.0",
    docs_url="/api-docs" if not settings.is_production else None,
    redoc_url="/api-redoc" if not settings.is_production else None,
    openapi_url="/api/openapi.json" if not settings.is_production else None,
    lifespan=lifespan,
)

# ── Middleware ──────────────────────────────────────────────
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RequestIDMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── Routers ────────────────────────────────────────────────
app.include_router(auth_router, prefix=API_V1_PREFIX)
app.include_router(projects_router, prefix=API_V1_PREFIX)
app.include_router(data_router, prefix=API_V1_PREFIX)
app.include_router(users_router, prefix=API_V1_PREFIX)
app.include_router(roles_router, prefix=API_V1_PREFIX)
app.include_router(settings_router, prefix=API_V1_PREFIX)
app.include_router(templates_router, prefix=API_V1_PREFIX)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.get(f"{API_V1_PREFIX}/health", tags=["Health"])
async def api_health():
    return {"status": "ok"}
