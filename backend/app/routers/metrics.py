from fastapi import APIRouter
import random

router = APIRouter(prefix="/api/metrics", tags=["metrics"])

@router.get("/performance")
def get_performance(period: str = "7days"):
    return {
        "period": period,
        "total_deliveries": 245,
        "on_time_percentage": 92.5,
        "average_delay_minutes": 12,
        "fuel_efficiency": 8.3
    }

@router.get("/resource-status")
def get_resource_status():
    return {
        "vehicles": {
            "total": 15,
            "active": 12,
            "maintenance": 2,
            "idle": 1
        },
        "drivers": {
            "total": 20,
            "active": 16,
            "on_break": 3,
            "off_duty": 1
        }
    }

@router.get("/live-operations")
def get_live_operations():
    return {
        "active_deliveries": 8,
        "active_routes": 5,
        "vehicles_in_motion": 12,
        "pending_tasks": 23
    }