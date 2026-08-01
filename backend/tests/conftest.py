"""Pytest configuration for backend tests"""
import pytest
from httpx import AsyncClient
from pytest_asyncio import fixture


@fixture(scope="function")
async def client():
    """Create test HTTP client pointing to local backend"""
    async with AsyncClient(base_url="http://localhost:8000", timeout=10.0) as ac:
        yield ac
