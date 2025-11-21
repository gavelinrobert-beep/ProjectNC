from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/v1/works", tags=["works"])  # Note: /api/v1/works not /api/works

MOCK_PROJECTS = [
    {
        "id": 1,
        "name": "E4 Highway Expansion",
        "status": "in_progress",
        "start_date": (datetime.utcnow() - timedelta(days=30)).isoformat(),
        "end_date": (datetime.utcnow() + timedelta(days=90)).isoformat(),
        "budget": 5000000,
        "spent": 1200000,
        "completion_percentage": 24
    },
    {
        "id": 2,
        "name": "Stockholm Bridge Repair",
        "status": "planning",
        "start_date": datetime.utcnow().isoformat(),
        "end_date": (datetime.utcnow() + timedelta(days=60)).isoformat(),
        "budget": 2500000,
        "spent": 0,
        "completion_percentage": 0
    },
]

MOCK_WORK_ORDERS = [
    {
        "id": 1,
        "project_id": 1,
        "title": "Foundation Work",
        "status": "in_progress",
        "priority": "high",
        "assigned_to": "Team Alpha",
        "due_date": (datetime.utcnow() + timedelta(days=5)).isoformat()
    },
    {
        "id": 2,
        "project_id": 1,
        "title": "Material Delivery",
        "status": "completed",
        "priority": "medium",
        "assigned_to": "Team Beta",
        "completed_date": (datetime.utcnow() - timedelta(days=1)).isoformat()
    },
]

MOCK_MACHINE_HOURS = [
    {
        "id": 1,
        "machine_name": "Excavator 01",
        "date": datetime.utcnow().isoformat(),
        "hours": 8.5,
        "operator": "Erik Andersson",
        "project": "E4 Highway Expansion"
    },
    {
        "id": 2,
        "machine_name": "Crane 01",
        "date": datetime.utcnow().isoformat(),
        "hours": 6.0,
        "operator": "Anna Svensson",
        "project": "E4 Highway Expansion"
    },
]

MOCK_CHANGE_ORDERS = [
    {
        "id": 1,
        "project_id": 1,
        "description": "Additional foundation work required",
        "status": "approved",
        "cost_impact": 150000,
        "submitted_date": (datetime.utcnow() - timedelta(days=3)).isoformat()
    },
]

# Dashboard stats endpoint
@router.get("/dashboard/stats")
def get_dashboard_stats():
    return {
        "active_projects": len([p for p in MOCK_PROJECTS if p["status"] == "in_progress"]),
        "active_work_orders": len([w for w in MOCK_WORK_ORDERS if w["status"] == "in_progress"]),
        "machine_hours_today": sum(m["hours"] for m in MOCK_MACHINE_HOURS),
        "pending_change_orders": len([c for c in MOCK_CHANGE_ORDERS if c["status"] == "pending"])
    }

@router.get("/projects")
def get_projects():
    return MOCK_PROJECTS

@router.get("/work-orders")
def get_work_orders():
    return MOCK_WORK_ORDERS

@router.get("/machine-hours")
def get_machine_hours():
    return MOCK_MACHINE_HOURS

@router.get("/change-orders")
def get_change_orders():
    return MOCK_CHANGE_ORDERS