from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/sites", tags=["sites"])

MOCK_DEPOTS = [
    {
        "id": 1,
        "name": "Stockholm Depot",
        "address": "Stockholm South Industrial Area",
        "capacity": 1000,
        "current_utilization": 650,
        "status": "active",
        "manager": "Johan Berg"
    },
    {
        "id": 2,
        "name": "Göteborg Depot",
        "address": "Göteborg North Harbor",
        "capacity": 800,
        "current_utilization": 420,
        "status": "active",
        "manager": "Sara Lund"
    },
]

MOCK_INVENTORY = [
    {
        "id": 1,
        "name": "Pallets",
        "sku": "PLT001",
        "category": "Equipment",
        "quantity": 150,
        "unit": "pcs",
        "reorder_level": 50,
        "unit_cost": 25.0
    },
    {
        "id": 2,
        "name": "Fuel",
        "sku": "FUEL001",
        "category": "Consumable",
        "quantity": 5000,
        "unit": "liters",
        "reorder_level": 1000,
        "unit_cost": 1.5
    },
    {
        "id": 3,
        "name": "Boxes",
        "sku": "BOX001",
        "category": "Packaging",
        "quantity": 8,
        "unit": "pcs",
        "reorder_level": 100,
        "unit_cost": 0.5
    },
]

MOCK_MATERIALS = [
    {
        "id": 1,
        "name": "Steel Beams",
        "category": "Construction",
        "unit_of_measure": "tons",
        "standard_cost": 850.0,
        "supplier": "Nordic Steel AB"
    },
    {
        "id": 2,
        "name": "Concrete Mix",
        "category": "Construction",
        "unit_of_measure": "m³",
        "standard_cost": 120.0,
        "supplier": "Cementa"
    },
]

@router.get("/depots")
def get_depots():
    return MOCK_DEPOTS

@router.get("/inventory")
def get_inventory():
    return MOCK_INVENTORY

@router.get("/materials")
def get_materials():
    return MOCK_MATERIALS