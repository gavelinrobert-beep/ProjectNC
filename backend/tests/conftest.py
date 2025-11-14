"""
Pytest configuration and fixtures for backend tests.
Provides database connections, test clients, authentication fixtures, and mock data generators.
"""
import asyncio
import os
from typing import AsyncGenerator, Dict, Any, Optional
import pytest
import asyncpg
from httpx import AsyncClient
from fastapi import FastAPI
from fastapi.testclient import TestClient

# Set test environment variables before importing app
os.environ['DATABASE_URL'] = os.environ.get(
    'DATABASE_URL', 
    'postgresql://postgres:postgres@localhost:5432/postgres'
)
os.environ['JWT_SECRET'] = 'test-secret-key-for-testing'
os.environ['CORS_ORIGINS'] = 'http://localhost:5173'

# Import app conditionally to avoid import errors
try:
    from app.main import app
    from app.database import get_pool
    from app.auth import create_access_token
    APP_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import app: {e}")
    APP_AVAILABLE = False
    # Create a minimal app for testing
    app = FastAPI()
    
    # Dummy function for create_access_token if app not available
    def create_access_token(data: dict) -> str:
        import jwt
        return jwt.encode(data, os.environ['JWT_SECRET'], algorithm="HS256")
    
    async def get_pool(app_instance: FastAPI = None) -> Optional[asyncpg.Pool]:
        database_url = os.environ['DATABASE_URL']
        return await asyncpg.create_pool(database_url, min_size=1, max_size=5)


@pytest.fixture(scope="session")
async def db_pool() -> AsyncGenerator[asyncpg.Pool, None]:
    """
    Provide a database connection pool for the test session.
    Creates a pool and ensures cleanup after tests.
    """
    database_url = os.environ['DATABASE_URL']
    pool = await asyncpg.create_pool(database_url, min_size=1, max_size=5)
    
    try:
        yield pool
    finally:
        await pool.close()


@pytest.fixture
async def db_connection(db_pool: asyncpg.Pool) -> AsyncGenerator[asyncpg.Connection, None]:
    """
    Provide a database connection for individual tests.
    Uses transactions for isolation and automatic rollback.
    """
    async with db_pool.acquire() as connection:
        # Start a transaction
        transaction = connection.transaction()
        await transaction.start()
        
        try:
            yield connection
        finally:
            # Rollback transaction to keep tests isolated
            await transaction.rollback()


@pytest.fixture
async def async_client() -> AsyncGenerator[AsyncClient, None]:
    """
    Provide an async HTTP client for testing API endpoints.
    Uses ASGI transport to properly handle lifespan events.
    """
    from httpx import ASGITransport
    from app.main import app as test_app
    transport = ASGITransport(app=test_app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client


@pytest.fixture
def test_client() -> TestClient:
    """
    Provide a synchronous test client for simpler test cases.
    """
    from app.main import app as test_app
    return TestClient(test_app)


# Authentication fixtures for different roles
@pytest.fixture
def admin_token() -> str:
    """Generate a JWT token for an admin user."""
    return create_access_token({
        "sub": "admin@test.com",
        "user_id": 1,
        "role": "admin",
        "name": "Test Admin"
    })


@pytest.fixture
def contractor_token() -> str:
    """Generate a JWT token for a contractor user."""
    return create_access_token({
        "sub": "contractor@test.com",
        "user_id": 2,
        "role": "contractor",
        "name": "Test Contractor"
    })


@pytest.fixture
def operator_token() -> str:
    """Generate a JWT token for a field operator user."""
    return create_access_token({
        "sub": "operator@test.com",
        "user_id": 3,
        "role": "operator",
        "name": "Test Operator"
    })


@pytest.fixture
def viewer_token() -> str:
    """Generate a JWT token for a viewer user."""
    return create_access_token({
        "sub": "viewer@test.com",
        "user_id": 4,
        "role": "viewer",
        "name": "Test Viewer"
    })


@pytest.fixture
def auth_headers_admin(admin_token: str) -> Dict[str, str]:
    """Provide HTTP headers with admin authentication."""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def auth_headers_contractor(contractor_token: str) -> Dict[str, str]:
    """Provide HTTP headers with contractor authentication."""
    return {"Authorization": f"Bearer {contractor_token}"}


@pytest.fixture
def auth_headers_operator(operator_token: str) -> Dict[str, str]:
    """Provide HTTP headers with operator authentication."""
    return {"Authorization": f"Bearer {operator_token}"}


@pytest.fixture
def auth_headers_viewer(viewer_token: str) -> Dict[str, str]:
    """Provide HTTP headers with viewer authentication."""
    return {"Authorization": f"Bearer {viewer_token}"}


# Mock data generators
@pytest.fixture
def mock_user_data() -> Dict[str, Any]:
    """Generate mock user data for testing."""
    return {
        "email": "test@example.com",
        "password": "TestPassword123!",
        "name": "Test User",
        "role": "operator"
    }


@pytest.fixture
def mock_asset_data() -> Dict[str, Any]:
    """Generate mock asset/vehicle data for testing."""
    return {
        "name": "Test Vehicle 01",
        "type": "truck",
        "status": "available",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "fuel_level": 75.5,
        "description": "Test vehicle for unit testing"
    }


@pytest.fixture
def mock_facility_data() -> Dict[str, Any]:
    """Generate mock facility/base data for testing."""
    return {
        "name": "Test Facility",
        "type": "warehouse",
        "latitude": 40.7580,
        "longitude": -73.9855,
        "capacity": 100,
        "status": "operational"
    }


@pytest.fixture
def mock_task_data() -> Dict[str, Any]:
    """Generate mock task/mission data for testing."""
    return {
        "title": "Test Delivery Task",
        "description": "Deliver supplies to location",
        "priority": "high",
        "status": "pending",
        "assigned_to": None,
        "start_location": {"lat": 40.7128, "lng": -74.0060},
        "end_location": {"lat": 40.7580, "lng": -73.9855}
    }


@pytest.fixture
def mock_inventory_item() -> Dict[str, Any]:
    """Generate mock inventory item data for testing."""
    return {
        "name": "Test Supply Item",
        "quantity": 50,
        "unit": "boxes",
        "category": "medical",
        "location": "Warehouse A"
    }


@pytest.fixture
def mock_alert_data() -> Dict[str, Any]:
    """Generate mock alert data for testing."""
    return {
        "title": "Test Alert",
        "message": "This is a test alert",
        "severity": "warning",
        "type": "system",
        "active": True
    }


@pytest.fixture
async def setup_test_data(db_connection: asyncpg.Connection) -> Dict[str, Any]:
    """
    Set up common test data in the database.
    Returns IDs of created records for use in tests.
    """
    test_data = {}
    
    # Note: Actual implementation would depend on database schema
    # This is a placeholder that can be extended based on actual tables
    
    return test_data


@pytest.fixture
def mock_weather_data() -> Dict[str, Any]:
    """Generate mock weather data for testing."""
    return {
        "location": "New York, NY",
        "temperature": 72.5,
        "conditions": "Partly Cloudy",
        "humidity": 65,
        "wind_speed": 10.5,
        "timestamp": "2025-01-15T12:00:00Z"
    }
