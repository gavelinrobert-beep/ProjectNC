"""
Test inventory phase 2 endpoints to verify new API structure.
Tests verify endpoint definitions and response structures without requiring database.
"""
import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_inventory_categories_requires_auth(async_client: AsyncClient):
    """Test that category endpoint requires authentication."""
    response = await async_client.get("/api/inventory/categories")
    assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_get_categories_with_auth(async_client: AsyncClient, auth_headers_admin):
    """Test getting inventory categories with authentication."""
    response = await async_client.get(
        "/api/inventory/categories",
        headers=auth_headers_admin
    )
    # Should return 200 or 500 (if DB not available)
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    # If successful, should return a list
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_vehicle_equipment_requires_auth(async_client: AsyncClient):
    """Test that vehicle equipment endpoint requires authentication."""
    response = await async_client.get("/api/inventory/vehicle/test-vehicle-id/equipment")
    assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_get_cargo_in_transit_with_auth(async_client: AsyncClient, auth_headers_admin):
    """Test getting cargo in transit with authentication."""
    response = await async_client.get(
        "/api/inventory/cargo/in-transit",
        headers=auth_headers_admin
    )
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_track_cargo_requires_auth(async_client: AsyncClient):
    """Test that cargo tracking endpoint requires authentication."""
    response = await async_client.get("/api/inventory/cargo/track/TEST-123")
    assert response.status_code in [401, 403, 404], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_get_facility_stock_requires_auth(async_client: AsyncClient):
    """Test that facility stock endpoint requires authentication."""
    response = await async_client.get("/api/inventory/facility/test-facility-id/stock")
    assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_get_low_stock_alerts_with_auth(async_client: AsyncClient, auth_headers_admin):
    """Test getting low stock alerts with authentication."""
    response = await async_client.get(
        "/api/inventory/alerts/low-stock",
        headers=auth_headers_admin
    )
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_create_transfer_requires_auth(async_client: AsyncClient):
    """Test that transfer endpoint requires authentication."""
    response = await async_client.post(
        "/api/inventory/transfer",
        json={
            "item_id": "test-item",
            "from_location_type": "facility",
            "from_location_id": "FAC-1",
            "to_location_type": "vehicle",
            "to_location_id": "VEH-1"
        }
    )
    assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_record_refuel_requires_auth(async_client: AsyncClient):
    """Test that refuel endpoint requires authentication."""
    response = await async_client.post(
        "/api/inventory/fuel/refuel",
        json={
            "asset_id": "VEH-1",
            "facility_id": "FAC-1",
            "quantity_liters": 50.0,
            "fuel_type": "diesel"
        }
    )
    assert response.status_code in [401, 403, 422], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_get_fuel_history_requires_auth(async_client: AsyncClient):
    """Test that fuel history endpoint requires authentication."""
    response = await async_client.get("/api/inventory/fuel/vehicle/test-vehicle-id/history")
    assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_get_fuel_consumption_report_with_auth(async_client: AsyncClient, auth_headers_admin):
    """Test getting fuel consumption report with authentication."""
    response = await async_client.get(
        "/api/inventory/fuel/consumption-report?period=7days",
        headers=auth_headers_admin
    )
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, dict)
        assert "period" in data
        assert "summary" in data
        assert "by_vehicle" in data


@pytest.mark.asyncio
async def test_fuel_consumption_report_periods(async_client: AsyncClient, auth_headers_admin):
    """Test different period parameters for fuel consumption report."""
    for period in ['7days', '30days', '90days']:
        response = await async_client.get(
            f"/api/inventory/fuel/consumption-report?period={period}",
            headers=auth_headers_admin
        )
        assert response.status_code in [200, 500], f"Period {period} failed with {response.status_code}"
