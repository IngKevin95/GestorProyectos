<<<<<<< Updated upstream
"""
Tests for HU-024: PostgreSQL 15 in docker-compose
Verifies database initialization, persistence, and health checks.
"""

import asyncio
import psycopg
import pytest
from contextlib import asynccontextmanager


@pytest.mark.asyncio
async def test_postgres_container_starts_and_accepts_connections():
    """HU-024 AC1: docker-compose levanta PostgreSQL en localhost:5432"""
    # This test verifies postgres is running and accepting connections
    # WILL FAIL: postgres container not yet running

    try:
        async with await psycopg.AsyncConnection.connect(
            "postgresql://gestor:password@localhost:5432/gestor_proyectos",
            timeout=5
        ) as conn:
            result = await conn.execute("SELECT 1")
            assert result is not None
    except Exception as e:
        pytest.fail(f"Could not connect to postgres on localhost:5432: {e}")


@pytest.mark.asyncio
async def test_gestor_proyectos_database_exists():
    """HU-024 AC2: Base de datos 'gestor_proyectos' se crea automáticamente"""
    # WILL FAIL: database creation not yet implemented

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5432/postgres",
        timeout=5
    ) as conn:
        result = await conn.execute(
            "SELECT 1 FROM pg_database WHERE datname = 'gestor_proyectos'"
        )
        databases = await result.fetchall()
        assert len(databases) > 0, "Database 'gestor_proyectos' does not exist"


@pytest.mark.asyncio
async def test_required_tables_exist():
    """HU-024 AC2: Las tablas (projects, tasks, team, audit_log) existen"""
    # WILL FAIL: tables not created yet

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5432/gestor_proyectos",
        timeout=5
    ) as conn:
        required_tables = ["projects", "tasks", "team", "audit_log"]

        for table_name in required_tables:
            result = await conn.execute(
                f"""
                SELECT 1 FROM information_schema.tables
                WHERE table_name = '{table_name}' AND table_schema = 'public'
                """
            )
            tables = await result.fetchall()
            assert len(tables) > 0, f"Table '{table_name}' does not exist"


@pytest.mark.asyncio
async def test_data_persists_across_restarts():
    """HU-024 AC3: Volumen persiste datos después de docker-compose down/up"""
    # WILL FAIL: persistence test requires manual docker-compose restart
    # This test documents the manual step needed for verification

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5432/gestor_proyectos",
        timeout=5
    ) as conn:
        # Create test table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS test_persistence (id SERIAL PRIMARY KEY, data TEXT)
        """)
        await conn.execute("INSERT INTO test_persistence (data) VALUES ('test_data')")
        await conn.commit()

        # Verify insert
        result = await conn.execute("SELECT data FROM test_persistence WHERE data = 'test_data'")
        rows = await result.fetchall()
        assert len(rows) > 0, "Test data not inserted"

        # NOTE: After this point, user must manually:
        # 1. docker-compose down
        # 2. docker-compose up -d
        # 3. Re-run this test
        # If test still passes, data persisted correctly

        print("✓ Test data inserted. Now manually restart docker-compose and re-run this test.")


@pytest.mark.asyncio
async def test_postgres_health_check():
    """HU-024 implicit: Health check verifies postgres is responding"""
    # WILL FAIL: no health check yet

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5432/postgres",
        timeout=5
    ) as conn:
        # Simple health check query
        result = await conn.execute("SELECT 1 as health")
        health = await result.fetchval()
        assert health == 1, "Health check failed"
=======
"""
Tests for HU-024: PostgreSQL 15 in docker-compose
Verifies database initialization, persistence, and health checks.
"""

import asyncio
import sys
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
import psycopg
import pytest
from contextlib import asynccontextmanager


@pytest.mark.asyncio
async def test_postgres_container_starts_and_accepts_connections():
    """HU-024 AC1: docker-compose levanta PostgreSQL en localhost:5445"""
    # This test verifies postgres is running and accepting connections
    # WILL FAIL: postgres container not yet running

    try:
        async with await psycopg.AsyncConnection.connect(
            "postgresql://gestor:password@localhost:5445/gestor_proyectos",
            connect_timeout=5
        ) as conn:
            result = await conn.execute("SELECT 1")
            assert result is not None
    except Exception as e:
        pytest.fail(f"Could not connect to postgres on localhost:5445: {e}")


@pytest.mark.asyncio
async def test_gestor_proyectos_database_exists():
    """HU-024 AC2: Base de datos 'gestor_proyectos' se crea automáticamente"""
    # WILL FAIL: database creation not yet implemented

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5445/postgres",
        connect_timeout=5
    ) as conn:
        result = await conn.execute(
            "SELECT 1 FROM pg_database WHERE datname = 'gestor_proyectos'"
        )
        databases = await result.fetchall()
        assert len(databases) > 0, "Database 'gestor_proyectos' does not exist"


@pytest.mark.asyncio
async def test_required_tables_exist():
    """HU-024 AC2: Las tablas (projects, tasks, team, audit_log) existen"""
    # WILL FAIL: tables not created yet

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5445/gestor_proyectos",
        connect_timeout=5
    ) as conn:
        required_tables = ["projects", "users", "audit_log", "sessions"]

        for table_name in required_tables:
            result = await conn.execute(
                f"""
                SELECT 1 FROM information_schema.tables
                WHERE table_name = '{table_name}' AND table_schema = 'public'
                """
            )
            tables = await result.fetchall()
            assert len(tables) > 0, f"Table '{table_name}' does not exist"


@pytest.mark.asyncio
async def test_data_persists_across_restarts():
    """HU-024 AC3: Volumen persiste datos después de docker-compose down/up"""
    # WILL FAIL: persistence test requires manual docker-compose restart
    # This test documents the manual step needed for verification

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5445/gestor_proyectos",
        connect_timeout=5
    ) as conn:
        # Create test table
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS test_persistence (id SERIAL PRIMARY KEY, data TEXT)
        """)
        await conn.execute("INSERT INTO test_persistence (data) VALUES ('test_data')")
        await conn.commit()

        # Verify insert
        result = await conn.execute("SELECT data FROM test_persistence WHERE data = 'test_data'")
        rows = await result.fetchall()
        assert len(rows) > 0, "Test data not inserted"

        # NOTE: After this point, user must manually:
        # 1. docker-compose down
        # 2. docker-compose up -d
        # 3. Re-run this test
        # If test still passes, data persisted correctly

        print("OK Test data inserted. Now manually restart docker-compose and re-run this test.")


@pytest.mark.asyncio
async def test_postgres_health_check():
    """HU-024 implicit: Health check verifies postgres is responding"""
    # WILL FAIL: no health check yet

    async with await psycopg.AsyncConnection.connect(
        "postgresql://gestor:password@localhost:5445/postgres",
        connect_timeout=5
    ) as conn:
        # Simple health check query
        result = await conn.execute("SELECT 1 as health")
        row = await result.fetchone()
        health = row[0] if row else None
        assert health == 1, "Health check failed"
>>>>>>> Stashed changes
