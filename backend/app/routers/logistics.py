from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime, timedelta
import random

router = APIRouter(prefix="/api/logistics", tags=["logistics"])

# Mock data for now
MOCK_DELIVERIES = [
    {
        "id": 1,
        "customer_name": "IKEA Stockholm",
        "delivery_address": "Kungens Kurva, Stockholm",
        "status": "in_transit",
        "scheduled_date": (datetime.utcnow() + timedelta(hours=2)).isoformat(),
        "notes": "Fragile items",
        "created_at": datetime.utcnow().isoformat()
    },
    {
        "id": 2,
        "customer_name": "Volvo Göteborg",
        "delivery_address": "Torslanda, Göteborg",
        "status": "delivered",
        "scheduled_date": (datetime.utcnow() - timedelta(days=1)).isoformat(),
        "completed_date": datetime.utcnow().isoformat(),
        "notes": "Signed by reception",
        "created_at": (datetime.utcnow() - timedelta(days=2)).isoformat()
    },
    {
        "id": 3,
        "customer_name": "Spotify HQ",
        "delivery_address": "Regeringsgatan 19, Stockholm",
        "status": "pending",
        "scheduled_date": (datetime.utcnow() + timedelta(hours=6)).isoformat(),
        "notes": "Call before delivery",
        "created_at": datetime.utcnow().isoformat()
    },
]

MOCK_ROUTES = [
    {
        "id": 1,
        "name": "Stockholm City Route",
        "driver_name": "Erik Andersson",
        "vehicle_name": "Truck 01",
        "status": "active",
        "stops_count": 5,
        "start_time": datetime.utcnow().isoformat()
    },
    {
        "id": 2,
        "name": "Göteborg North",
        "driver_name": "Anna Svensson",
        "vehicle_name": "Van 02",
        "status": "completed",
        "stops_count": 3,
        "start_time": (datetime.utcnow() - timedelta(hours=4)).isoformat()
    },
]

MOCK_CUSTOMERS = [
    {
        "id": 1,
        "name": "IKEA Stockholm",
        "contact_name": "Per Nilsson",
        "email": "per@ikea.se",
        "phone": "+46201234567",
        "address": "Kungens Kurva",
        "total_orders": 45,
        "last_order_date": datetime.utcnow().isoformat()
    },
    {
        "id": 2,
        "name": "Volvo Göteborg",
        "contact_name": "Maria Berg",
        "email": "maria@volvo.se",
        "phone": "+46319876543",
        "address": "Torslanda",
        "total_orders": 32,
        "last_order_date": (datetime.utcnow() - timedelta(days=5)).isoformat()
    },
    {
        "id": 3,
        "name": "Spotify HQ",
        "contact_name": "Johan Kask",
        "email": "johan@spotify.se",
        "phone": "+46851234567",
        "address": "Regeringsgatan 19",
        "total_orders": 28,
        "last_order_date": (datetime.utcnow() - timedelta(days=2)).isoformat()
    },
]

@router.get("/deliveries")
def get_deliveries():
    return MOCK_DELIVERIES

@router.post("/deliveries")
def create_delivery(delivery: dict):
    new_delivery = {
        "id": len(MOCK_DELIVERIES) + 1,
        "created_at": datetime.utcnow().isoformat(),
        **delivery
    }
    MOCK_DELIVERIES.append(new_delivery)
    return new_delivery

@router.get("/routes")
def get_routes():
    return MOCK_ROUTES

@router.get("/customers")
def get_customers():
    return MOCK_CUSTOMERS