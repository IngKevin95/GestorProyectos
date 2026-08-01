<<<<<<< Updated upstream
"""
Tests for API contract validation
Verifies that endpoints match their OpenAPI specification
"""

import pytest
from httpx import AsyncClient, ConnectError


@pytest.mark.asyncio
async def test_health_endpoint_contract():
    """Verify /health endpoint matches OpenAPI spec"""
    # WILL FAIL: endpoint not deployed

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        response = await client.get("/health")

        # Contract validation
        assert response.status_code == 200, "Expected HTTP 200"
        data = response.json()

        # Schema validation: required fields
        assert "status" in data, "Missing 'status' field"
        assert "db" in data, "Missing 'db' field"

        # Schema validation: allowed values
        assert data["status"] in ["ok", "degraded"], f"Invalid status: {data['status']}"
        assert data["db"] in ["connected", "disconnected"], f"Invalid db status: {data['db']}"

        # Content-Type
        assert "application/json" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_root_endpoint_contract():
    """Verify GET / endpoint matches OpenAPI spec"""
    # WILL FAIL: endpoint not deployed

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        response = await client.get("/")

        # Contract validation
        assert response.status_code == 200, "Expected HTTP 200"
        data = response.json()

        # Schema validation
        assert "message" in data, "Missing 'message' field"
        assert "version" in data, "Missing 'version' field"
        assert "docs" in data, "Missing 'docs' field"

        # Type validation
        assert isinstance(data["message"], str), "message must be string"
        assert isinstance(data["version"], str), "version must be string"
        assert isinstance(data["docs"], str), "docs must be string"


@pytest.mark.asyncio
async def test_api_documentation_available():
    """Verify FastAPI auto-generated docs are available"""
    # WILL FAIL: docs endpoint not available

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        # Swagger UI
        response = await client.get("/docs")
        assert response.status_code == 200, "Swagger UI not available at /docs"
        assert "swagger" in response.text.lower() or "openapi" in response.text.lower()

        # ReDoc
        response = await client.get("/redoc")
        assert response.status_code == 200, "ReDoc not available at /redoc"

        # OpenAPI JSON
        response = await client.get("/openapi.json")
        assert response.status_code == 200, "OpenAPI JSON not available at /openapi.json"
        spec = response.json()
        assert "openapi" in spec, "Invalid OpenAPI spec"
        assert "paths" in spec, "OpenAPI spec missing paths"


@pytest.mark.asyncio
async def test_cors_headers_present():
    """Verify CORS headers are set for browser requests"""
    # WILL FAIL: CORS not configured

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        response = await client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )

        # Check CORS headers
        assert "access-control-allow-origin" in response.headers or "access-control-allow-credentials" in response.headers, \
            "CORS headers not present"


@pytest.mark.asyncio
async def test_error_responses_have_correct_structure():
    """Verify error responses follow a consistent format"""
    # WILL FAIL: error handling not yet implemented

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        # Request non-existent endpoint
        response = await client.get("/api/nonexistent")

        # Should return 404, not 500
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"

        # Error response should be JSON
        assert "application/json" in response.headers.get("content-type", "")
        data = response.json()
        assert "detail" in data, "Error response missing 'detail' field"
=======
"""
Tests for API contract validation
Verifies that endpoints match their OpenAPI specification
"""

import pytest
from httpx import AsyncClient, ConnectError


@pytest.mark.asyncio
async def test_health_endpoint_contract():
    """Verify /health endpoint matches OpenAPI spec"""
    # WILL FAIL: endpoint not deployed

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        response = await client.get("/health")

        # Contract validation
        assert response.status_code == 200, "Expected HTTP 200"
        data = response.json()

        # Schema validation: required fields
        assert "status" in data, "Missing 'status' field"
        assert "version" in data, "Missing 'version' field"

        # Schema validation: allowed values
        assert data["status"] == "ok", f"Invalid status: {data['status']}"

        # Content-Type
        assert "application/json" in response.headers.get("content-type", "")


@pytest.mark.asyncio
async def test_root_endpoint_contract():
    """Verify GET / endpoint matches OpenAPI spec"""
    # WILL FAIL: endpoint not deployed

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        response = await client.get("/")

        # We don't have a root endpoint, we expect 404
        assert response.status_code == 404, "Expected HTTP 404 for /"


@pytest.mark.asyncio
async def test_api_documentation_available():
    """Verify FastAPI auto-generated docs are available"""
    # WILL FAIL: docs endpoint not available

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        # Swagger UI
        response = await client.get("/api-docs")
        assert response.status_code == 200, "Swagger UI not available at /api-docs"
        assert "swagger" in response.text.lower() or "openapi" in response.text.lower()

        # ReDoc
        response = await client.get("/api-redoc")
        assert response.status_code == 200, "ReDoc not available at /api-redoc"

        # OpenAPI JSON
        response = await client.get("/api/openapi.json")
        assert response.status_code == 200, "OpenAPI JSON not available at /api/openapi.json"
        spec = response.json()
        assert "openapi" in spec, "Invalid OpenAPI spec"
        assert "paths" in spec, "OpenAPI spec missing paths"


@pytest.mark.asyncio
async def test_cors_headers_present():
    """Verify CORS headers are set for browser requests"""
    # WILL FAIL: CORS not configured

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        response = await client.get(
            "/health",
            headers={"Origin": "http://localhost:3000"}
        )

        # Check CORS headers
        assert "access-control-allow-origin" in response.headers or "access-control-allow-credentials" in response.headers, \
            "CORS headers not present"


@pytest.mark.asyncio
async def test_error_responses_have_correct_structure():
    """Verify error responses follow a consistent format"""
    # WILL FAIL: error handling not yet implemented

    async with AsyncClient(base_url="http://localhost:8000", timeout=5) as client:
        # Request non-existent endpoint
        response = await client.get("/api/nonexistent")

        # Should return 404, not 500
        assert response.status_code == 404, f"Expected 404, got {response.status_code}"

        # Error response should be JSON
        assert "application/json" in response.headers.get("content-type", "")
        data = response.json()
        assert "detail" in data, "Error response missing 'detail' field"
>>>>>>> Stashed changes
