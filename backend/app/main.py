"""
FastAPI backend for GestorProyectos
"""

import asyncio
import os
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import asyncpg

# Database configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://gestor:password@postgres:5432/gestor_proyectos"
)

# Initialize database engine and session maker
engine = None
async_session_maker = None


async def check_database_connection() -> bool:
    """Check if database is accessible"""
    try:
        conn = await asyncpg.connect(
            host="postgres",
            port=5432,
            user="gestor",
            password="password",
            database="gestor_proyectos",
            timeout=2
        )
        result = await conn.fetchval("SELECT 1")
        await conn.close()
        return result == 1
    except Exception:
        return False


async def wait_for_database(max_retries: int = 5) -> bool:
    """Wait for database to be ready with exponential backoff"""
    wait_time = 1

    for attempt in range(max_retries):
        if await check_database_connection():
            return True

        if attempt < max_retries - 1:
            print(f"Database not ready, retrying in {wait_time}s... (attempt {attempt + 1}/{max_retries})")
            await asyncio.sleep(wait_time)
            wait_time = min(wait_time * 2, 8)  # exponential backoff, max 8s

    print(f"Failed to connect to database after {max_retries} attempts")
    return False


async def startup():
    """Initialize database connection on startup"""
    global engine, async_session_maker

    # Wait for database to be ready
    db_ready = await wait_for_database()
    if not db_ready:
        raise Exception("Database is not available")

    # Create engine
    engine = create_async_engine(
        DATABASE_URL,
        echo=False,
        future=True,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20
    )

    # Create session maker
    async_session_maker = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    print("✓ Database connection established")


async def shutdown():
    """Close database connection on shutdown"""
    global engine

    if engine:
        await engine.dispose()
        print("✓ Database connection closed")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage app lifecycle"""
    await startup()
    yield
    await shutdown()


# Create FastAPI app
app = FastAPI(
    title="GestorProyectos API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """
    Health check endpoint that verifies database connectivity

    Returns:
        {
            "status": "ok" | "degraded",
            "db": "connected" | "disconnected"
        }
    """
    db_connected = await check_database_connection()

    return {
        "status": "ok" if db_connected else "degraded",
        "db": "connected" if db_connected else "disconnected"
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "GestorProyectos API",
        "version": "1.0.0",
        "docs": "/docs"
    }


# Import additional routes here
# from app.routes import projects, tasks
