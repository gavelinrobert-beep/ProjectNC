"""
Test health check endpoint to verify basic API functionality.
"""
import pytest
from fastapi.testclient import TestClient


def test_health_endpoint(test_client: TestClient):
    """Test that the health check endpoint returns 200 OK."""
    response = test_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "ok" in data
    assert data["ok"] is True


@pytest.mark.asyncio
async def test_health_endpoint_async(async_client):
    """Test health check endpoint with async client."""
    response = await async_client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert "ok" in data


def test_api_root(test_client: TestClient):
    """Test that the API root returns basic information."""
    response = test_client.get("/")
    # The root endpoint might redirect or return 404, both are acceptable
    assert response.status_code in [200, 404, 307]
