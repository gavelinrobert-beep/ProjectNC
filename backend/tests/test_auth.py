"""
Test authentication endpoints to verify correct routing.
"""
import pytest
from fastapi.testclient import TestClient


def test_auth_login_endpoint_exists(test_client: TestClient):
    """Test that the login endpoint is accessible at /api/auth/login (not /api/login)."""
    # This should return 401 (unauthorized) or 422 (validation error), not 404
    # A 404 would indicate the route is not found
    response = test_client.post("/api/auth/login", json={})
    assert response.status_code != 404, "Auth login endpoint should not return 404"
    # Expected status codes: 401 (bad credentials) or 422 (validation error for missing fields)
    assert response.status_code in [401, 422], f"Expected 401 or 422, got {response.status_code}"


def test_auth_login_with_invalid_credentials(test_client: TestClient):
    """Test login with invalid credentials returns 401."""
    response = test_client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
    assert "detail" in response.json()


def test_old_auth_endpoint_should_not_exist(test_client: TestClient):
    """Test that the old /api/login endpoint no longer exists (should return 404)."""
    response = test_client.post("/api/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    # This should return 404 since the route should be at /api/auth/login
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_auth_login_endpoint_async(async_client):
    """Test auth login endpoint with async client."""
    response = await async_client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "test"
    })
    # Should not be 404 - route should exist
    assert response.status_code != 404
    # Will likely be 401 without valid credentials
    assert response.status_code in [401, 422]
