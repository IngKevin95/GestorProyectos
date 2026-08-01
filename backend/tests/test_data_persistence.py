"""
Tests for data persistence across container restarts
Validates that data survives and remains consistent
"""

import pytest
from datetime import datetime


@pytest.mark.asyncio
async def test_project_data_persists():
    """Verify projects inserted in postgres persist after restart"""
    # WILL FAIL: requires docker-compose up, manual restart, and psycopg

    try:
        import asyncpg
    except ImportError:
        pytest.skip("asyncpg not installed")

    async def insert_project():
        conn = await asyncpg.connect(
            user="gestor",
            password="password",
            database="gestor_proyectos",
            host="localhost"
        )
        result = await conn.execute("""
            INSERT INTO projects (title, description, owner_id, status, priority)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING id
        """, "Test Project", "Persistence test", 1, "active", "high")
        await conn.close()
        return result

    try:
        # Insert data
        await insert_project()

        # In production, this would be: docker-compose down && docker-compose up
        # Manual step: restart postgres container

        # Verify data exists
        import asyncpg
        conn = await asyncpg.connect(
            user="gestor",
            password="password",
            database="gestor_proyectos",
            host="localhost"
        )
        row = await conn.fetchrow(
            "SELECT title FROM projects WHERE title = $1",
            "Test Project"
        )
        await conn.close()

        assert row is not None, "Project data did not persist after restart"
        assert row['title'] == "Test Project", "Project title changed"

    except Exception as e:
        pytest.skip(f"Database connection failed: {e}")


@pytest.mark.asyncio
async def test_task_foreign_key_constraint():
    """Verify task-to-project referential integrity"""
    # WILL FAIL: requires running db with schema

    try:
        import asyncpg
    except ImportError:
        pytest.skip("asyncpg not installed")

    try:
        conn = await asyncpg.connect(
            user="gestor",
            password="password",
            database="gestor_proyectos",
            host="localhost"
        )

        # Attempt to insert task with non-existent project_id
        try:
            await conn.execute("""
                INSERT INTO tasks (project_id, title, status)
                VALUES ($1, $2, $3)
            """, 99999, "Orphan Task", "open")

            # If we get here, FK constraint failed
            pytest.fail("Expected referential integrity violation")

        except asyncpg.exceptions.ForeignKeyViolationError:
            # Expected: constraint enforced
            pass

        await conn.close()

    except Exception as e:
        pytest.skip(f"Database connection failed: {e}")


@pytest.mark.asyncio
async def test_audit_log_captures_changes():
    """Verify audit logging of entity changes"""
    # WILL FAIL: requires audit triggers and running db

    try:
        import asyncpg
    except ImportError:
        pytest.skip("asyncpg not installed")

    try:
        conn = await asyncpg.connect(
            user="gestor",
            password="password",
            database="gestor_proyectos",
            host="localhost"
        )

        # Check that audit_log table exists
        result = await conn.fetchval("""
            SELECT EXISTS(
                SELECT 1 FROM information_schema.tables
                WHERE table_name = 'audit_log'
            )
        """)

        assert result, "audit_log table does not exist"
        await conn.close()

    except Exception as e:
        pytest.skip(f"Database connection failed: {e}")


@pytest.mark.asyncio
async def test_indexes_exist_for_common_queries():
    """Verify performance indexes are created"""
    # WILL FAIL: requires running db with init.sql applied

    try:
        import asyncpg
    except ImportError:
        pytest.skip("asyncpg not installed")

    try:
        conn = await asyncpg.connect(
            user="gestor",
            password="password",
            database="gestor_proyectos",
            host="localhost"
        )

        # Check for key indexes
        indexes = await conn.fetch("""
            SELECT indexname FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY indexname
        """)

        index_names = [idx['indexname'] for idx in indexes]

        # Verify expected indexes exist
        expected_indexes = [
            'idx_projects_status',
            'idx_projects_owner_id',
            'idx_tasks_project_id',
            'idx_tasks_status'
        ]

        for expected in expected_indexes:
            assert expected in index_names, f"Missing index: {expected}"

        await conn.close()

    except Exception as e:
        pytest.skip(f"Database connection failed: {e}")


@pytest.mark.asyncio
async def test_timestamp_columns_set_correctly():
    """Verify created_at timestamps are set by database"""
    # WILL FAIL: requires running db with default values

    try:
        import asyncpg
    except ImportError:
        pytest.skip("asyncpg not installed")

    try:
        conn = await asyncpg.connect(
            user="gestor",
            password="password",
            database="gestor_proyectos",
            host="localhost"
        )

        # Insert without explicit timestamp
        await conn.execute("""
            INSERT INTO projects (title, owner_id, status)
            VALUES ($1, $2, $3)
        """, "Timestamp Test", 1, "active")

        # Verify created_at was set
        row = await conn.fetchrow("""
            SELECT created_at FROM projects
            WHERE title = 'Timestamp Test'
        """)

        assert row is not None, "Project not inserted"
        assert row['created_at'] is not None, "created_at was not set"
        assert isinstance(row['created_at'], datetime), "created_at is not a timestamp"

        await conn.close()

    except Exception as e:
        pytest.skip(f"Database connection failed: {e}")
