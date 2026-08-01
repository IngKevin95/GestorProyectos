"""Pytest configuration for backend tests"""
import pytest
from httpx import AsyncClient
from pytest_asyncio import fixture
import sys
import os
from pathlib import Path

# Set env vars BEFORE importing src modules
os.environ.setdefault("DATABASE_URL", "postgresql+asyncpg://gestor:password@localhost:5432/gestor_proyectos")
os.environ.setdefault("JWT_SECRET_KEY", "your-secret-key-change-in-production")
os.environ.setdefault("JWT_ALGORITHM", "HS256")
os.environ["SKIP_SESSION_VERIFICATION"] = "true"

backend_root = Path(__file__).parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from src.core.security import create_access_token

TEST_USER_ID = "34006b2b-2023-46f4-b300-b4492fa70076"
TEST_USER_EMAIL = "test@example.com"
TEST_USER_ROLE = "user"


@fixture(scope="session")
async def setup_test_user():
    """Create test user + projects in BD via SQL"""
    import subprocess
    from src.core.security import hash_password

    pwd_hash = hash_password("TestPassword123!")

    # Ensure user exists and create 5 projects
    sql = f"""
    INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at)
    VALUES ('{TEST_USER_ID}'::uuid, '{TEST_USER_EMAIL}', '{pwd_hash}', '{TEST_USER_ROLE}', true, NOW(), NOW())
    ON CONFLICT (email) DO NOTHING;

    DELETE FROM projects WHERE user_id = '{TEST_USER_ID}'::uuid;

    INSERT INTO projects (id, user_id, name, bac, responsable, status, state, health_status, priority_strategy, priority_constant, business_value, version, created_at, updated_at)
    VALUES
      ('aaaaaaaa-aaaa-aaaa-aaaa-000000000001'::uuid, '{TEST_USER_ID}'::uuid, 'Project 1', 100000, 'Lead 1', 'Activo', 'ACTIVE', 'ok', 'relative', 0, 50, 0, NOW(), NOW()),
      ('aaaaaaaa-aaaa-aaaa-aaaa-000000000002'::uuid, '{TEST_USER_ID}'::uuid, 'Project 2', 200000, 'Lead 2', 'Activo', 'ACTIVE', 'ok', 'absolute', 80, 75, 0, NOW(), NOW()),
      ('aaaaaaaa-aaaa-aaaa-aaaa-000000000003'::uuid, '{TEST_USER_ID}'::uuid, 'Project 3', 150000, 'Lead 3', 'Activo', 'ACTIVE', 'ok', 'mixed', 50, 60, 0, NOW(), NOW()),
      ('aaaaaaaa-aaaa-aaaa-aaaa-000000000004'::uuid, '{TEST_USER_ID}'::uuid, 'Project 4', 250000, 'Lead 4', 'Activo', 'ACTIVE', 'ok', 'relative', 0, 80, 0, NOW(), NOW()),
      ('aaaaaaaa-aaaa-aaaa-aaaa-000000000005'::uuid, '{TEST_USER_ID}'::uuid, 'Project 5', 175000, 'Lead 5', 'Activo', 'ACTIVE', 'ok', 'absolute', 90, 70, 0, NOW(), NOW());
    """

    subprocess.run(
        ["docker", "exec", "gestor-postgres", "psql", "-U", "gestor", "-d", "gestor_proyectos", "-c", sql],
        timeout=15,
        capture_output=True
    )
    return TEST_USER_ID


@fixture(scope="session")
async def auth_token(setup_test_user):
    """Generate JWT token"""
    return create_access_token(TEST_USER_ID, TEST_USER_EMAIL, TEST_USER_ROLE)


@fixture(scope="function")
async def client(auth_token):
    """Create test HTTP client with auth"""
    headers = {"Authorization": f"Bearer {auth_token}"}
    async with AsyncClient(base_url="http://localhost:8000", timeout=10.0, headers=headers) as ac:
        yield ac


@fixture(scope="function")
async def test_projects(client: AsyncClient, setup_test_user):
    """Dummy fixture - projects already created in setup_test_user"""
    return [{"name": f"Project {i}"} for i in range(1, 6)]
