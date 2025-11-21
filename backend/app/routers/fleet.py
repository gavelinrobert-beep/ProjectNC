from fastapi import APIRouter
from datetime import datetime, timedelta

router = APIRouter(prefix="/api/fleet", tags=["fleet"])

MOCK_VEHICLES = [
    {
        "id": 1,
        "name": "Truck 01",
        "plate": "ABC123",
        "type": "truck",
        "status": "active",
        "fuel_level": 85.0,
        "odometer": 45000
    },
    {
        "id": 2,
        "name": "Van 02",
        "plate": "DEF456",
        "type": "van",
        "status": "active",
        "fuel_level": 92.0,
        "odometer": 32000
    },
    {
        "id": 3,
        "name": "Truck 03",
        "plate": "GHI789",
        "type": "truck",
        "status": "maintenance",
        "fuel_level": 45.0,
        "odometer": 78000
    },
]

MOCK_DRIVERS = [
    {
        "id": 1,
        "name": "Erik Andersson",
        "license_number": "DL001",
        "status": "active",
        "phone": "+46701234567",
        "email": "erik@sylon.se",
        "current_vehicle": "Truck 01",
        "total_deliveries": 245
    },
    {
        "id": 2,
        "name": "Anna Svensson",
        "license_number": "DL002",
        "status": "on_break",
        "phone": "+46709876543",
        "email": "anna@sylon.se",
        "current_vehicle": None,
        "total_deliveries": 198
    },
    {
        "id": 3,
        "name": "Lars Johansson",
        "license_number": "DL003",
        "status": "off_duty",
        "phone": "+46705551234",
        "email": "lars@sylon.se",
        "current_vehicle": None,
        "total_deliveries": 312
    },
]

MOCK_MAINTENANCE = [
    {
        "id": 1,
        "vehicle_name": "Truck 01",
        "type": "routine",
        "status": "scheduled",
        "scheduled_date": (datetime.utcnow() + timedelta(days=3)).isoformat(),
        "cost": 1500.0,
        "description": "Regular service"
    },
    {
        "id": 2,
        "vehicle_name": "Truck 03",
        "type": "repair",
        "status": "in_progress",
        "scheduled_date": datetime.utcnow().isoformat(),
        "cost": 3200.0,
        "description": "Engine repair"
    },
]

@router.get("/vehicles")
def get_vehicles():
    return MOCK_VEHICLES

@router.get("/drivers")
def get_drivers():
    return MOCK_DRIVERS

@router.get("/maintenance")
def get_maintenance():
    return MOCK_MAINTENANCE