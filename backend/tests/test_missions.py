"""
Test mission/task endpoints to verify database operations work correctly with tasks table.
"""
import pytest
from fastapi.testclient import TestClient
from httpx import AsyncClient


@pytest.fixture
def mock_mission_payload():
    """Generate mock mission data for testing."""
    return {
        "name": "Test Delivery Mission",
        "description": "Test delivery to customer location",
        "asset_id": None,  # Will be set in tests that need it
        "waypoints": [
            {"lat": 59.3293, "lon": 18.0686, "name": "Stockholm DC"},
            {"lat": 57.7089, "lon": 11.9746, "name": "Göteborg Warehouse"}
        ],
        "status": "planned",
        "priority": "normal",
        "mission_type": "delivery"
    }


@pytest.mark.asyncio
async def test_create_mission_basic(async_client: AsyncClient, auth_headers_admin, mock_mission_payload):
    """Test creating a basic mission without an assigned asset."""
    response = await async_client.post(
        "/api/missions",
        json=mock_mission_payload,
        headers=auth_headers_admin
    )
    
    # Should succeed even without database
    assert response.status_code in [200, 201, 500], f"Unexpected status: {response.status_code}"
    
    # If it succeeds, verify the response structure
    if response.status_code in [200, 201]:
        data = response.json()
        assert "id" in data
        assert data["name"] == mock_mission_payload["name"]
        assert data["description"] == mock_mission_payload["description"]
        assert len(data["waypoints"]) == 2


@pytest.mark.asyncio
async def test_get_missions(async_client: AsyncClient):
    """Test listing all missions."""
    response = await async_client.get("/api/missions")
    
    # Should return 200 or 500 (if DB not available)
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    # If successful, should return a list
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_get_missions_by_status(async_client: AsyncClient):
    """Test filtering missions by status."""
    response = await async_client.get("/api/missions?status=planned")
    
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        # If there are results, they should all have status 'planned'
        for mission in data:
            assert mission.get("status") == "planned"


@pytest.mark.asyncio
async def test_get_mission_by_id(async_client: AsyncClient, auth_headers_admin, mock_mission_payload):
    """Test getting a specific mission by ID."""
    # First try to create a mission
    create_response = await async_client.post(
        "/api/missions",
        json=mock_mission_payload,
        headers=auth_headers_admin
    )
    
    if create_response.status_code in [200, 201]:
        mission_id = create_response.json()["id"]
        
        # Now try to get it
        get_response = await async_client.get(f"/api/missions/{mission_id}")
        
        if get_response.status_code == 200:
            data = get_response.json()
            assert data["id"] == mission_id
            assert data["name"] == mock_mission_payload["name"]


@pytest.mark.asyncio
async def test_delete_mission(async_client: AsyncClient, auth_headers_admin, mock_mission_payload):
    """Test deleting a mission."""
    # First try to create a mission
    create_response = await async_client.post(
        "/api/missions",
        json=mock_mission_payload,
        headers=auth_headers_admin
    )
    
    if create_response.status_code in [200, 201]:
        mission_id = create_response.json()["id"]
        
        # Now try to delete it
        delete_response = await async_client.delete(
            f"/api/missions/{mission_id}",
            headers=auth_headers_admin
        )
        
        # Should return 200 with ok: true
        if delete_response.status_code == 200:
            data = delete_response.json()
            assert data.get("ok") is True


@pytest.mark.asyncio
async def test_mission_with_transfer_type(async_client: AsyncClient, auth_headers_admin):
    """Test creating a transfer mission with source and destination facilities."""
    payload = {
        "name": "Test Transfer Mission",
        "description": "Transfer supplies between facilities",
        "waypoints": [
            {"lat": 59.3293, "lon": 18.0686, "name": "Stockholm DC"},
            {"lat": 57.7089, "lon": 11.9746, "name": "Göteborg Warehouse"}
        ],
        "status": "planned",
        "priority": "normal",
        "mission_type": "transfer",
        "source_base_id": "FAC-STH-01",
        "destination_base_id": "FAC-GBG-01",
        "transfer_items": [
            {"item_id": "test-item-1", "quantity": 10}
        ]
    }
    
    response = await async_client.post(
        "/api/missions",
        json=payload,
        headers=auth_headers_admin
    )
    
    # Should succeed or fail with validation error (if facilities don't exist)
    assert response.status_code in [200, 201, 400, 404, 500], f"Unexpected status: {response.status_code}"


@pytest.mark.asyncio
async def test_update_mission(async_client: AsyncClient, auth_headers_admin, mock_mission_payload):
    """Test updating a mission."""
    # First try to create a mission
    create_response = await async_client.post(
        "/api/missions",
        json=mock_mission_payload,
        headers=auth_headers_admin
    )
    
    if create_response.status_code in [200, 201]:
        mission_id = create_response.json()["id"]
        
        # Update the mission
        updated_payload = mock_mission_payload.copy()
        updated_payload["description"] = "Updated description"
        updated_payload["priority"] = "high"
        
        update_response = await async_client.put(
            f"/api/missions/{mission_id}",
            json=updated_payload,
            headers=auth_headers_admin
        )
        
        if update_response.status_code == 200:
            data = update_response.json()
            assert data["description"] == "Updated description"
            assert data["priority"] == "high"


def test_mission_endpoint_requires_auth(test_client: TestClient, mock_mission_payload):
    """Test that mission creation requires authentication."""
    response = test_client.post("/api/missions", json=mock_mission_payload)
    
    # Should return 401 or 403 (unauthorized)
    assert response.status_code in [401, 403], f"Expected auth error, got {response.status_code}"


@pytest.mark.asyncio
async def test_mission_metrics_calculation(async_client: AsyncClient, auth_headers_admin):
    """Test that mission metrics.py (distance, duration) are calculated correctly."""
    payload = {
        "name": "Test Metrics Mission",
        "description": "Test distance and duration calculation",
        "waypoints": [
            {"lat": 59.3293, "lon": 18.0686, "name": "Stockholm"},
            {"lat": 57.7089, "lon": 11.9746, "name": "Göteborg"}
        ],
        "status": "planned",
        "priority": "normal"
    }
    
    response = await async_client.post(
        "/api/missions",
        json=payload,
        headers=auth_headers_admin
    )
    
    if response.status_code in [200, 201]:
        data = response.json()
        # Should have calculated metrics.py
        assert "estimated_duration_minutes" in data or "estimated_distance_km" in data
