"""
Logistics Module Routes
Handles shipments, customers, deliveries, and route management.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, date
import json
import random
import string

from .models import (
    ShipmentIn, ShipmentOut, ShipmentEvent, ProofOfDelivery, ShipmentItem,
    CustomerIn, CustomerOut
)
from ..shared.auth import require_admin
from ..shared.database import get_pool

# Create main router for logistics module
router = APIRouter()

# Create sub-routers for organization
shipments_router = APIRouter(prefix="/api/shipments", tags=["Shipments"])
customers_router = APIRouter(prefix="/api/customers", tags=["Customers"])


# ============================================================================
# SHIPMENT ROUTES
# ============================================================================

def generate_tracking_number() -> str:
    """Generate a unique tracking number"""
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choices(chars, k=10))
    return f"SYL-{random_part}"


@shipments_router.get("", response_model=List[dict])
async def get_shipments(
        request: Request,
        status: Optional[str] = None,
        customer_id: Optional[str] = None,
        limit: int = 100
):
    """Get all shipments with filtering options."""
    pool = await get_pool(request.app)

    query = "SELECT * FROM shipments WHERE 1=1"
    params = []

    if status:
        query += f" AND status = ${len(params) + 1}"
        params.append(status)

    if customer_id:
        query += f" AND customer_id = ${len(params) + 1}"
        params.append(customer_id)

    query += f" ORDER BY created_at DESC LIMIT ${len(params) + 1}"
    params.append(limit)

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@shipments_router.post("", response_model=dict, dependencies=[Depends(require_admin)])
async def create_shipment(payload: ShipmentIn, request: Request):
    """Create a new shipment"""
    pool = await get_pool(request.app)

    shipment_id = payload.id or str(uuid4())
    tracking_number = payload.tracking_number or generate_tracking_number()

    items_json = json.dumps([item.dict() for item in payload.items])

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO shipments(
                id, tracking_number, customer_id, status, items, created_at, updated_at
            ) VALUES($1, $2, $3, $4, $5, $6, $7)
        """,
                           shipment_id, tracking_number, payload.customer_id,
                           payload.status, items_json, datetime.utcnow(), datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM shipments WHERE id = $1", shipment_id)
        return dict(row)


@shipments_router.get("/{shipment_id}", response_model=dict)
async def get_shipment(shipment_id: str, request: Request):
    """Get a specific shipment by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM shipments WHERE id = $1", shipment_id)
        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")
        return dict(row)


# ============================================================================
# CUSTOMER ROUTES
# ============================================================================

@customers_router.get("", response_model=List[dict])
async def get_customers(
        request: Request,
        active_only: bool = True,
        customer_type: Optional[str] = None
):
    """Get all customers with optional filtering."""
    pool = await get_pool(request.app)

    query = "SELECT * FROM customers WHERE 1=1"
    params = []

    if active_only:
        query += f" AND active = ${len(params) + 1}"
        params.append(True)

    if customer_type:
        query += f" AND customer_type = ${len(params) + 1}"
        params.append(customer_type)

    query += " ORDER BY name"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@customers_router.post("", response_model=dict, dependencies=[Depends(require_admin)])
async def create_customer(payload: CustomerIn, request: Request):
    """Create a new customer"""
    pool = await get_pool(request.app)

    customer_id = payload.id or str(uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO customers(
                id, name, customer_type, contact_name, contact_phone, contact_email,
                address_street, address_city, address_postal_code, active, created_at, updated_at
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """,
                           customer_id, payload.name, payload.customer_type, payload.contact_name,
                           payload.contact_phone, payload.contact_email,
                           payload.address_street, payload.address_city, payload.address_postal_code,
                           payload.active, datetime.utcnow(), datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM customers WHERE id = $1", customer_id)
        return dict(row)


@customers_router.get("/{customer_id}", response_model=dict)
async def get_customer(customer_id: str, request: Request):
    """Get a specific customer by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM customers WHERE id = $1", customer_id)
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        return dict(row)


# Include sub-routers in main router
router.include_router(shipments_router)
router.include_router(customers_router)
