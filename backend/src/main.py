"""
FastAPI app — entry point con todos los routers y middleware.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
import os
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
from src.api.routers.tasks import router as tasks_router
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
    from src.models.db_models import Session as DBSession, Base

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as db:
        await db.execute(
            sql_update(DBSession)
            .where(DBSession.is_revoked == False)  # noqa: E712
            .values(is_revoked=True)
        )
        
        # Insert mock user for development / skip_session_verification
        from sqlalchemy import text
        if os.getenv("SKIP_SESSION_VERIFICATION") == "true":
            await db.execute(text("""
                INSERT INTO users (id, email, password_hash, role, is_active)
                VALUES ('10006b2b-2023-46f4-b300-b4492fa70076', 'admin@empresa.com', '$argon2id$v=19$m=65536,t=3,p=4$6P1/j9EaQ2hNidE6JwQgpA$sGhQBDd4D0jXkdFs+6g502w5wT1zyIlGimnhrCPAZaw', 'admin', true)
                ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email, password_hash = EXCLUDED.password_hash
            """))

        await db.commit()

    yield
    await engine.dispose()


app = FastAPI(
    title="GestorProyectos API",
    version="1.0.0",
    docs_url=None,
    redoc_url="/api-redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan,
)

from fastapi.responses import FileResponse

@app.get("/api-docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="/api/static/swagger-ui-bundle.js",
        swagger_css_url="/api/static/swagger-ui.css",
    )

@app.get("/api/static/swagger-ui-bundle.js", include_in_schema=False)
async def swagger_js():
    return FileResponse("src/static/swagger-ui-bundle.js")

@app.get("/api/static/swagger-ui.css", include_in_schema=False)
async def swagger_css():
    return FileResponse("src/static/swagger-ui.css")

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
app.include_router(tasks_router, prefix=API_V1_PREFIX)


@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "version": "1.0.0"}


@app.get(f"{API_V1_PREFIX}/health", tags=["Health"])
async def api_health():
    return {"status": "ok"}
