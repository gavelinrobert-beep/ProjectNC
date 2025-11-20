"""
Sites Module Routes
Handles depot/inventory CRUD, material tracking, and pickup events.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

from .models import (
    FacilityIn, FacilityOut, InventoryItemIn, InventoryItemOut,
    InventoryTransactionIn, InventoryTransactionOut
)
from ..shared.auth import require_admin
from ..shared.database import get_pool

# Create main router for sites module
router = APIRouter()

# Create sub-routers for organization
facilities_router = APIRouter(prefix="/api/facilities", tags=["Facilities"])
inventory_router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


# ============================================================================
# FACILITY ROUTES
# ============================================================================

@facilities_router.get("", response_model=List[dict])
async def get_facilities(
        request: Request,
        facility_type: Optional[str] = None
):
    """Get all facilities with optional filtering."""
    pool = await get_pool(request.app)

    query = "SELECT * FROM facilities WHERE 1=1"
    params = []

    if facility_type:
        query += f" AND type = ${len(params) + 1}"
        params.append(facility_type)

    query += " ORDER BY name"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@facilities_router.post("", response_model=dict, dependencies=[Depends(require_admin)])
async def create_facility(payload: FacilityIn, request: Request):
    """Create a new facility"""
    pool = await get_pool(request.app)

    facility_id = payload.id or str(uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO facilities(
                id, name, type, lat, lon, capacity, description, created_at
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        """,
                           facility_id, payload.name, payload.type,
                           payload.lat, payload.lon, payload.capacity,
                           payload.description, datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM facilities WHERE id = $1", facility_id)
        return dict(row)


@facilities_router.get("/{facility_id}", response_model=dict)
async def get_facility(facility_id: str, request: Request):
    """Get a specific facility by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM facilities WHERE id = $1", facility_id)
        if not row:
            raise HTTPException(status_code=404, detail="Facility not found")
        return dict(row)


@facilities_router.put("/{facility_id}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_facility(facility_id: str, payload: FacilityIn, request: Request):
    """Update an existing facility"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM facilities WHERE id = $1)", facility_id)
        if not exists:
            raise HTTPException(status_code=404, detail="Facility not found")

        await conn.execute("""
            UPDATE facilities SET
                name = $2, type = $3, lat = $4, lon = $5, capacity = $6, description = $7
            WHERE id = $1
        """,
                           facility_id, payload.name, payload.type,
                           payload.lat, payload.lon, payload.capacity, payload.description
                           )

        row = await conn.fetchrow("SELECT * FROM facilities WHERE id = $1", facility_id)
        return dict(row)


@facilities_router.delete("/{facility_id}", dependencies=[Depends(require_admin)])
async def delete_facility(facility_id: str, request: Request):
    """Delete a facility"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM facilities WHERE id = $1", facility_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Facility not found")
        return {"status": "deleted", "id": facility_id}


# ============================================================================
# INVENTORY ROUTES
# ============================================================================

@inventory_router.get("", response_model=List[dict])
async def get_inventory_items(
        request: Request,
        location_id: Optional[str] = None,
        category: Optional[str] = None
):
    """Get all inventory items with optional filtering."""
    pool = await get_pool(request.app)

    query = "SELECT * FROM inventory WHERE 1=1"
    params = []

    if location_id:
        query += f" AND location_id = ${len(params) + 1}"
        params.append(location_id)

    if category:
        query += f" AND category = ${len(params) + 1}"
        params.append(category)

    query += " ORDER BY name"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@inventory_router.post("", response_model=dict, dependencies=[Depends(require_admin)])
async def create_inventory_item(payload: InventoryItemIn, request: Request):
    """Create a new inventory item"""
    pool = await get_pool(request.app)

    item_id = payload.id or str(uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO inventory(
                id, name, type, category, quantity, unit, location_type, location_id, created_at, updated_at
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """,
                           item_id, payload.name, payload.type, payload.category,
                           payload.quantity, payload.unit, payload.location_type,
                           payload.location_id, datetime.utcnow(), datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM inventory WHERE id = $1", item_id)
        return dict(row)


@inventory_router.get("/{item_id}", response_model=dict)
async def get_inventory_item(item_id: str, request: Request):
    """Get a specific inventory item by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM inventory WHERE id = $1", item_id)
        if not row:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return dict(row)


@inventory_router.put("/{item_id}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_inventory_item(item_id: str, payload: InventoryItemIn, request: Request):
    """Update an existing inventory item"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM inventory WHERE id = $1)", item_id)
        if not exists:
            raise HTTPException(status_code=404, detail="Inventory item not found")

        await conn.execute("""
            UPDATE inventory SET
                name = $2, type = $3, category = $4, quantity = $5, unit = $6,
                location_type = $7, location_id = $8, updated_at = $9
            WHERE id = $1
        """,
                           item_id, payload.name, payload.type, payload.category,
                           payload.quantity, payload.unit, payload.location_type,
                           payload.location_id, datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM inventory WHERE id = $1", item_id)
        return dict(row)


@inventory_router.delete("/{item_id}", dependencies=[Depends(require_admin)])
async def delete_inventory_item(item_id: str, request: Request):
    """Delete an inventory item"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM inventory WHERE id = $1", item_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return {"status": "deleted", "id": item_id}


# Include sub-routers in main router
router.include_router(facilities_router)
router.include_router(inventory_router)
