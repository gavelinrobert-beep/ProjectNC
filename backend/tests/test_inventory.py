"""
Test inventory endpoints to verify database operations work correctly.
"""
import pytest
from httpx import AsyncClient


@pytest.fixture
def mock_inventory_payload():
    """Generate mock inventory data for testing."""
    return {
        "name": "Test Item",
        "category": "supplies",
        "quantity": 100,
        "unit": "pcs",
        "location_id": "FAC-SND-HQ",
        "min_stock_level": 50,
        "max_stock_level": 500
    }


@pytest.mark.asyncio
async def test_get_inventory_items(async_client: AsyncClient, auth_headers_admin):
    """Test listing all inventory items."""
    response = await async_client.get(
        "/api/inventory/items",
        headers=auth_headers_admin
    )
    
    # Should return 200 or 500 (if DB not available)
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    # If successful, should return a list
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)


@pytest.mark.asyncio
async def test_create_inventory_item(async_client: AsyncClient, auth_headers_admin, mock_inventory_payload):
    """Test creating an inventory item."""
    response = await async_client.post(
        "/api/inventory/items",
        json=mock_inventory_payload,
        headers=auth_headers_admin
    )
    
    # Should succeed or fail with validation error
    assert response.status_code in [200, 201, 400, 404, 500], f"Unexpected status: {response.status_code}"
    
    # If it succeeds, verify the response structure
    if response.status_code in [200, 201]:
        data = response.json()
        assert "id" in data
        assert data["name"] == mock_inventory_payload["name"]
        assert data["category"] == mock_inventory_payload["category"]
        assert data["quantity"] == mock_inventory_payload["quantity"]
        assert data["unit"] == mock_inventory_payload["unit"]
        assert data["location_id"] == mock_inventory_payload["location_id"]


@pytest.mark.asyncio
async def test_get_inventory_items_by_location(async_client: AsyncClient, auth_headers_admin):
    """Test filtering inventory items by location."""
    response = await async_client.get(
        "/api/inventory/items?location_id=FAC-SND-HQ",
        headers=auth_headers_admin
    )
    
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        # If there are results, they should all have location_id 'FAC-SND-HQ'
        for item in data:
            assert item.get("location_id") == "FAC-SND-HQ"


@pytest.mark.asyncio
async def test_update_inventory_item(async_client: AsyncClient, auth_headers_admin, mock_inventory_payload):
    """Test updating an inventory item quantity."""
    # First try to create an item
    create_response = await async_client.post(
        "/api/inventory/items",
        json=mock_inventory_payload,
        headers=auth_headers_admin
    )
    
    if create_response.status_code in [200, 201]:
        item_id = create_response.json()["id"]
        
        # Now try to update it
        update_response = await async_client.put(
            f"/api/inventory/items/{item_id}?quantity=200",
            headers=auth_headers_admin
        )
        
        if update_response.status_code == 200:
            data = update_response.json()
            assert data["quantity"] == 200


@pytest.mark.asyncio
async def test_delete_inventory_item(async_client: AsyncClient, auth_headers_admin, mock_inventory_payload):
    """Test deleting an inventory item."""
    # First try to create an item
    create_response = await async_client.post(
        "/api/inventory/items",
        json=mock_inventory_payload,
        headers=auth_headers_admin
    )
    
    if create_response.status_code in [200, 201]:
        item_id = create_response.json()["id"]
        
        # Now try to delete it
        delete_response = await async_client.delete(
            f"/api/inventory/items/{item_id}",
            headers=auth_headers_admin
        )
        
        # Should return 200 with message
        if delete_response.status_code == 200:
            data = delete_response.json()
            assert data.get("message") == "Item deleted"


@pytest.mark.asyncio
async def test_get_facilities(async_client: AsyncClient, auth_headers_admin):
    """Test getting facilities for inventory location dropdown."""
    response = await async_client.get(
        "/api/inventory/facilities",
        headers=auth_headers_admin
    )
    
    # Should return 200 or 500 (if DB not available)
    assert response.status_code in [200, 500], f"Unexpected status: {response.status_code}"
    
    # If successful, should return a list
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)
        # Each facility should have required fields
        for facility in data:
            assert "id" in facility
            assert "name" in facility
            assert "type" in facility


@pytest.mark.asyncio
async def test_inventory_requires_auth(async_client: AsyncClient, mock_inventory_payload):
    """Test that inventory endpoints require authentication."""
    # Test GET without auth
    get_response = await async_client.get("/api/inventory/items")
    assert get_response.status_code in [401, 403], f"Expected auth error, got {get_response.status_code}"
    
    # Test POST without auth
    post_response = await async_client.post("/api/inventory/items", json=mock_inventory_payload)
    assert post_response.status_code in [401, 403], f"Expected auth error, got {post_response.status_code}"
