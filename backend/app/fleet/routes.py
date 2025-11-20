"""
Fleet Module Routes
Handles drivers, vehicles, telemetry, and maintenance operations.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, date

from .models import DriverIn, DriverOut, AssetIn, AssetOut, DriverHoursLog
from ..shared.auth import require_admin
from ..shared.database import get_pool

# Create main router for fleet module
router = APIRouter()

# Create sub-routers for organization
drivers_router = APIRouter(prefix="/api/drivers", tags=["Drivers"])
assets_router = APIRouter(prefix="/api/assets", tags=["Assets"])


# ============================================================================
# DRIVER ROUTES
# ============================================================================

@drivers_router.get("", response_model=List[dict])
async def get_drivers(
        request: Request,
        employment_status: Optional[str] = None,
        home_facility_id: Optional[str] = None
):
    """Get all drivers with optional filtering."""
    pool = await get_pool(request.app)

    query = "SELECT * FROM drivers WHERE 1=1"
    params = []

    if employment_status:
        query += f" AND employment_status = ${len(params) + 1}"
        params.append(employment_status)

    if home_facility_id:
        query += f" AND home_facility_id = ${len(params) + 1}"
        params.append(home_facility_id)

    query += " ORDER BY name"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@drivers_router.post("", response_model=dict, dependencies=[Depends(require_admin)])
async def create_driver(payload: DriverIn, request: Request):
    """Create a new driver"""
    pool = await get_pool(request.app)

    driver_id = payload.id or str(uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO drivers(
                id, name, email, phone, license_number, license_type, license_expiry,
                employment_status, role, status, created_at, updated_at
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        """,
                           driver_id, payload.name, payload.email, payload.phone,
                           payload.license_number, payload.license_type, payload.license_expiry,
                           payload.employment_status, payload.role, payload.status,
                           datetime.utcnow(), datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        return dict(row)


@drivers_router.get("/{driver_id}", response_model=dict)
async def get_driver(driver_id: str, request: Request):
    """Get a specific driver by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not row:
            raise HTTPException(status_code=404, detail="Driver not found")
        return dict(row)


@drivers_router.put("/{driver_id}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_driver(driver_id: str, payload: DriverIn, request: Request):
    """Update an existing driver"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM drivers WHERE id = $1)", driver_id)
        if not exists:
            raise HTTPException(status_code=404, detail="Driver not found")

        await conn.execute("""
            UPDATE drivers SET
                name = $2, email = $3, phone = $4, license_number = $5, license_type = $6,
                license_expiry = $7, employment_status = $8, role = $9, status = $10, updated_at = $11
            WHERE id = $1
        """,
                           driver_id, payload.name, payload.email, payload.phone,
                           payload.license_number, payload.license_type, payload.license_expiry,
                           payload.employment_status, payload.role, payload.status, datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        return dict(row)


@drivers_router.delete("/{driver_id}", dependencies=[Depends(require_admin)])
async def delete_driver(driver_id: str, request: Request):
    """Delete a driver"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM drivers WHERE id = $1", driver_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Driver not found")
        return {"status": "deleted", "id": driver_id}


# ============================================================================
# ASSET/VEHICLE ROUTES
# ============================================================================

@assets_router.get("", response_model=List[dict])
async def get_assets(
        request: Request,
        status: Optional[str] = None,
        asset_type: Optional[str] = None,
        home_facility_id: Optional[str] = None
):
    """Get all assets/vehicles with optional filtering."""
    pool = await get_pool(request.app)

    query = "SELECT * FROM assets WHERE 1=1"
    params = []

    if status:
        query += f" AND status = ${len(params) + 1}"
        params.append(status)

    if asset_type:
        query += f" AND type = ${len(params) + 1}"
        params.append(asset_type)

    if home_facility_id:
        query += f" AND home_facility_id = ${len(params) + 1}"
        params.append(home_facility_id)

    query += " ORDER BY type, registration_number"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@assets_router.post("", response_model=dict, dependencies=[Depends(require_admin)])
async def create_asset(payload: AssetIn, request: Request):
    """Create a new asset/vehicle"""
    pool = await get_pool(request.app)

    asset_id = payload.id or str(uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO assets(
                id, type, registration_number, lat, lon, status, fuel_level, created_at, updated_at
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
                           asset_id, payload.type, payload.registration_number,
                           payload.lat, payload.lon, payload.status, payload.fuel_level,
                           datetime.utcnow(), datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM assets WHERE id = $1", asset_id)
        return dict(row)


@assets_router.get("/{asset_id}", response_model=dict)
async def get_asset(asset_id: str, request: Request):
    """Get a specific asset by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM assets WHERE id = $1", asset_id)
        if not row:
            raise HTTPException(status_code=404, detail="Asset not found")
        return dict(row)


@assets_router.put("/{asset_id}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_asset(asset_id: str, payload: AssetIn, request: Request):
    """Update an existing asset"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        exists = await conn.fetchval("SELECT EXISTS(SELECT 1 FROM assets WHERE id = $1)", asset_id)
        if not exists:
            raise HTTPException(status_code=404, detail="Asset not found")

        await conn.execute("""
            UPDATE assets SET
                type = $2, registration_number = $3, lat = $4, lon = $5,
                status = $6, fuel_level = $7, updated_at = $8
            WHERE id = $1
        """,
                           asset_id, payload.type, payload.registration_number,
                           payload.lat, payload.lon, payload.status, payload.fuel_level,
                           datetime.utcnow()
                           )

        row = await conn.fetchrow("SELECT * FROM assets WHERE id = $1", asset_id)
        return dict(row)


@assets_router.delete("/{asset_id}", dependencies=[Depends(require_admin)])
async def delete_asset(asset_id: str, request: Request):
    """Delete an asset"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM assets WHERE id = $1", asset_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"status": "deleted", "id": asset_id}


# Include sub-routers in main router
router.include_router(drivers_router)
router.include_router(assets_router)
