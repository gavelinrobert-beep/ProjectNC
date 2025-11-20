"""
Tests for SYLON Works module endpoints.
Tests projects, work orders, machine hours, change orders, winter maintenance, and documentation.
"""
import pytest
from fastapi.testclient import TestClient


def test_list_projects_empty(test_client: TestClient, auth_headers_admin):
    """Test listing projects when none exist"""
    response = test_client.get("/api/v1/works/projects", headers=auth_headers_admin)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_project(test_client: TestClient, auth_headers_admin):
    """Test creating a new project"""
    project_data = {
        "project_number": "PRJ-2025-001",
        "name": "Test Construction Project",
        "description": "A test project for unit testing",
        "status": "planning",
        "budget": 1000000.00
    }
    
    response = test_client.post(
        "/api/v1/works/projects",
        json=project_data,
        headers=auth_headers_admin
    )
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == project_data["name"]
    assert data["project_number"] == project_data["project_number"]
    assert "id" in data


def test_create_duplicate_project_number(test_client: TestClient, auth_headers_admin):
    """Test that duplicate project numbers are rejected"""
    project_data = {
        "project_number": "PRJ-2025-DUP",
        "name": "Test Project",
        "status": "planning"
    }
    
    # Create first project
    response1 = test_client.post(
        "/api/v1/works/projects",
        json=project_data,
        headers=auth_headers_admin
    )
    assert response1.status_code == 201
    
    # Try to create duplicate
    response2 = test_client.post(
        "/api/v1/works/projects",
        json=project_data,
        headers=auth_headers_admin
    )
    assert response2.status_code == 400


def test_list_work_orders_empty(test_client: TestClient, auth_headers_admin):
    """Test listing work orders when none exist"""
    response = test_client.get("/api/v1/works/work-orders", headers=auth_headers_admin)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_work_order(test_client: TestClient, auth_headers_admin):
    """Test creating a new work order"""
    work_order_data = {
        "order_number": "WO-2025-001",
        "title": "Test Work Order",
        "description": "A test work order",
        "type": "construction",
        "priority": "high",
        "status": "draft"
    }
    
    response = test_client.post(
        "/api/v1/works/work-orders",
        json=work_order_data,
        headers=auth_headers_admin
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == work_order_data["title"]
    assert data["order_number"] == work_order_data["order_number"]
    assert data["type"] == work_order_data["type"]


def test_start_work_order(test_client: TestClient, auth_headers_admin):
    """Test starting a work order"""
    # First create a work order
    work_order_data = {
        "order_number": "WO-2025-START",
        "title": "Work Order to Start",
        "type": "maintenance",
        "status": "draft"
    }
    
    create_response = test_client.post(
        "/api/v1/works/work-orders",
        json=work_order_data,
        headers=auth_headers_admin
    )
    assert create_response.status_code == 201
    work_order_id = create_response.json()["id"]
    
    # Start the work order
    start_response = test_client.post(
        f"/api/v1/works/work-orders/{work_order_id}/start",
        headers=auth_headers_admin
    )
    assert start_response.status_code == 200
    data = start_response.json()
    assert data["status"] == "in_progress"
    assert data["actual_start"] is not None


def test_complete_work_order(test_client: TestClient, auth_headers_admin):
    """Test completing a work order"""
    # First create a work order
    work_order_data = {
        "order_number": "WO-2025-COMPLETE",
        "title": "Work Order to Complete",
        "type": "maintenance",
        "status": "in_progress"
    }
    
    create_response = test_client.post(
        "/api/v1/works/work-orders",
        json=work_order_data,
        headers=auth_headers_admin
    )
    assert create_response.status_code == 201
    work_order_id = create_response.json()["id"]
    
    # Complete the work order
    complete_response = test_client.post(
        f"/api/v1/works/work-orders/{work_order_id}/complete",
        headers=auth_headers_admin
    )
    assert complete_response.status_code == 200
    data = complete_response.json()
    assert data["status"] == "completed"
    assert data["actual_end"] is not None


def test_create_machine_hours(test_client: TestClient, auth_headers_admin):
    """Test logging machine hours"""
    machine_hours_data = {
        "start_time": "2025-01-20T08:00:00Z",
        "end_time": "2025-01-20T12:00:00Z",
        "hourly_rate": 500.00
    }
    
    response = test_client.post(
        "/api/v1/works/machine-hours",
        json=machine_hours_data,
        headers=auth_headers_admin
    )
    assert response.status_code == 201
    data = response.json()
    assert data["hours"] is not None  # Should be auto-calculated
    assert data["total_cost"] is not None  # Should be auto-calculated


def test_list_change_orders(test_client: TestClient, auth_headers_admin):
    """Test listing change orders"""
    response = test_client.get("/api/v1/works/change-orders", headers=auth_headers_admin)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_create_change_order(test_client: TestClient, auth_headers_admin):
    """Test creating a change order (ÄTA)"""
    # First create a project
    project_data = {
        "project_number": "PRJ-2025-CO",
        "name": "Project for Change Order",
        "status": "active"
    }
    project_response = test_client.post(
        "/api/v1/works/projects",
        json=project_data,
        headers=auth_headers_admin
    )
    assert project_response.status_code == 201
    project_id = project_response.json()["id"]
    
    # Create change order
    change_order_data = {
        "change_order_number": "ÄTA-2025-001",
        "project_id": project_id,
        "title": "Additional Foundation Work",
        "description": "Need to strengthen foundation due to soil conditions",
        "reason": "Unexpected soil conditions discovered during excavation",
        "estimated_cost": 50000.00,
        "estimated_hours": 40.0,
        "status": "draft"
    }
    
    response = test_client.post(
        "/api/v1/works/change-orders",
        json=change_order_data,
        headers=auth_headers_admin
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == change_order_data["title"]
    assert data["change_order_number"] == change_order_data["change_order_number"]


def test_submit_change_order(test_client: TestClient, auth_headers_admin):
    """Test submitting a change order for approval"""
    # Create project and change order first
    project_data = {
        "project_number": "PRJ-2025-SUBMIT",
        "name": "Project for Submit Test",
        "status": "active"
    }
    project_response = test_client.post(
        "/api/v1/works/projects",
        json=project_data,
        headers=auth_headers_admin
    )
    project_id = project_response.json()["id"]
    
    change_order_data = {
        "change_order_number": "ÄTA-2025-SUBMIT",
        "project_id": project_id,
        "title": "Change Order to Submit",
        "description": "Test submission",
        "status": "draft"
    }
    
    create_response = test_client.post(
        "/api/v1/works/change-orders",
        json=change_order_data,
        headers=auth_headers_admin
    )
    change_order_id = create_response.json()["id"]
    
    # Submit the change order
    submit_response = test_client.post(
        f"/api/v1/works/change-orders/{change_order_id}/submit",
        headers=auth_headers_admin
    )
    assert submit_response.status_code == 200
    data = submit_response.json()
    assert data["status"] == "submitted"
    assert data["submitted_at"] is not None


def test_approve_change_order(test_client: TestClient, auth_headers_admin):
    """Test approving a change order"""
    # Create project and change order first
    project_data = {
        "project_number": "PRJ-2025-APPROVE",
        "name": "Project for Approval Test",
        "status": "active"
    }
    project_response = test_client.post(
        "/api/v1/works/projects",
        json=project_data,
        headers=auth_headers_admin
    )
    project_id = project_response.json()["id"]
    
    change_order_data = {
        "change_order_number": "ÄTA-2025-APPROVE",
        "project_id": project_id,
        "title": "Change Order to Approve",
        "description": "Test approval",
        "status": "submitted"
    }
    
    create_response = test_client.post(
        "/api/v1/works/change-orders",
        json=change_order_data,
        headers=auth_headers_admin
    )
    change_order_id = create_response.json()["id"]
    
    # Approve the change order
    approve_response = test_client.post(
        f"/api/v1/works/change-orders/{change_order_id}/approve",
        headers=auth_headers_admin
    )
    assert approve_response.status_code == 200
    data = approve_response.json()
    assert data["status"] == "approved"
    assert data["approved_at"] is not None
    assert data["approved_by"] is not None


def test_list_winter_maintenance(test_client: TestClient, auth_headers_admin):
    """Test listing winter maintenance entries"""
    response = test_client.get("/api/v1/works/winter-maintenance", headers=auth_headers_admin)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_list_documentation(test_client: TestClient, auth_headers_admin):
    """Test listing documentation"""
    response = test_client.get("/api/v1/works/documentation", headers=auth_headers_admin)
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_authentication_required(test_client: TestClient):
    """Test that authentication is required for Works endpoints"""
    # Try to access projects without auth
    response = test_client.get("/api/v1/works/projects")
    assert response.status_code == 401
    
    # Try to create work order without auth
    response = test_client.post(
        "/api/v1/works/work-orders",
        json={"order_number": "WO-TEST", "title": "Test"}
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_project_statistics(test_client: TestClient, auth_headers_admin):
    """Test getting project statistics"""
    # Create a project first
    project_data = {
        "project_number": "PRJ-2025-STATS",
        "name": "Project for Statistics",
        "status": "active"
    }
    
    create_response = test_client.post(
        "/api/v1/works/projects",
        json=project_data,
        headers=auth_headers_admin
    )
    assert create_response.status_code == 201
    project_id = create_response.json()["id"]
    
    # Get statistics
    stats_response = test_client.get(
        f"/api/v1/works/projects/{project_id}/statistics",
        headers=auth_headers_admin
    )
    assert stats_response.status_code == 200
    data = stats_response.json()
    assert "total_work_orders" in data
    assert "total_machine_hours" in data
    assert "total_change_orders" in data
