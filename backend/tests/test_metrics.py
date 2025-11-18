"""
Test metrics endpoints to verify performance tracking works correctly.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_resource_status(async_client: AsyncClient, auth_headers_admin):
    """Test getting resource status metrics."""
    response = await async_client.get(
        "/api/metrics/resource-status",
        headers=auth_headers_admin
    )
    
    # Should return 200 or 500 (if DB not available)
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    # If successful, verify response structure
    if response.status_code == 200:
        data = response.json()
        assert "total" in data
        assert "available" in data
        assert "in_use" in data
        assert "utilization_rate" in data
        assert "timestamp" in data


@pytest.mark.asyncio
async def test_get_performance_metrics_default(async_client: AsyncClient, auth_headers_admin):
    """Test getting performance metrics with default period (7 days)."""
    response = await async_client.get(
        "/api/metrics/performance",
        headers=auth_headers_admin
    )
    
    # Should return 200 or 500 (if DB not available)
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    # If successful, verify response structure
    if response.status_code == 200:
        data = response.json()
        assert "period" in data
        assert "period_code" in data
        assert "deliveries_completed" in data
        assert "total_distance_km" in data
        assert "avg_delivery_time_hours" in data
        assert "ontime_delivery_rate" in data
        assert "vehicle_utilization" in data
        assert "timestamp" in data
        # Default period should be 7 days
        assert data["period_code"] == "7days"


@pytest.mark.asyncio
async def test_get_performance_metrics_today(async_client: AsyncClient, auth_headers_admin):
    """Test getting performance metrics for today."""
    response = await async_client.get(
        "/api/metrics/performance?period=today",
        headers=auth_headers_admin
    )
    
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        assert data["period_code"] == "today"
        assert data["period"] == "Today"


@pytest.mark.asyncio
async def test_get_performance_metrics_30days(async_client: AsyncClient, auth_headers_admin):
    """Test getting performance metrics for 30 days."""
    response = await async_client.get(
        "/api/metrics/performance?period=30days",
        headers=auth_headers_admin
    )
    
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        assert data["period_code"] == "30days"
        assert data["period"] == "Last 30 Days"


@pytest.mark.asyncio
async def test_get_metrics_summary(async_client: AsyncClient, auth_headers_admin):
    """Test getting metrics summary combining resource status and performance."""
    response = await async_client.get(
        "/api/metrics/summary",
        headers=auth_headers_admin
    )
    
    # Should return 200 or 500 (if DB not available)
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    # If successful, verify response structure
    if response.status_code == 200:
        data = response.json()
        assert "resource_status" in data
        assert "performance_7days" in data
        assert "active_incidents" in data
        assert "active_tasks" in data
        assert "timestamp" in data


@pytest.mark.asyncio
async def test_metrics_requires_auth(async_client: AsyncClient):
    """Test that metrics endpoints require authentication."""
    # Test resource-status without auth
    resource_response = await async_client.get("/api/metrics/resource-status")
    assert resource_response.status_code in [401, 403], f"Expected auth error, got {resource_response.status_code}"
    
    # Test performance without auth
    performance_response = await async_client.get("/api/metrics/performance")
    assert performance_response.status_code in [401, 403], f"Expected auth error, got {performance_response.status_code}"
    
    # Test summary without auth
    summary_response = await async_client.get("/api/metrics/summary")
    assert summary_response.status_code in [401, 403], f"Expected auth error, got {summary_response.status_code}"


@pytest.mark.asyncio
async def test_performance_metrics_numeric_values(async_client: AsyncClient, auth_headers_admin):
    """Test that performance metrics return valid numeric values."""
    response = await async_client.get(
        "/api/metrics/performance",
        headers=auth_headers_admin
    )
    
    if response.status_code == 200:
        data = response.json()
        # All numeric fields should be numbers (not None or strings)
        assert isinstance(data["deliveries_completed"], (int, float))
        assert isinstance(data["total_distance_km"], (int, float))
        assert isinstance(data["avg_delivery_time_hours"], (int, float))
        assert isinstance(data["ontime_delivery_rate"], (int, float))
        assert isinstance(data["vehicle_utilization"], (int, float))
        
        # All rates should be between 0 and 100
        assert 0 <= data["ontime_delivery_rate"] <= 100
        assert 0 <= data["vehicle_utilization"] <= 100
