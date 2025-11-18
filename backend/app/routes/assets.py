"""
Asset CRUD endpoints with database persistence.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from uuid import uuid4

from ..models import AssetIn
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="/api", tags=["assets"])


@router.get("/assets", response_model=List[dict])
async def get_assets(request: Request):
    """Get all assets from database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM assets")
        return [dict(row) for row in rows]


@router.post("/assets", response_model=dict, dependencies=[Depends(require_admin)])
async def create_asset(payload: AssetIn, request: Request):
    """Create a new asset in database"""
    aid = payload.id or str(uuid4())
    asset = payload.dict()
    asset["id"] = aid

    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO assets (id, type, registration_number, vin, make, model, year,
                                lat, lon, route, route_index, speed, heading, status,
                                cargo_capacity_kg, cargo_volume_m3, pallet_capacity,
                                fuel_type, fuel_level, fuel_capacity, fuel_consumption_rate,
                                battery, battery_drain, has_battery, battery_capacity_kwh,
                                home_facility_id, current_driver_id,
                                in_geofence, last_alarm_tick,
                                created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17,
                    $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, NOW(), NOW())
        """,
            aid,
            asset.get("type"),
            asset.get("registration_number"),
            asset.get("vin"),
            asset.get("make"),
            asset.get("model"),
            asset.get("year"),
            asset.get("lat"),
            asset.get("lon"),
            asset.get("route", "stationary"),
            asset.get("route_index", 0.0),
            asset.get("speed", 0.0),
            asset.get("heading", 0.0),
            asset.get("status", "parked"),
            asset.get("cargo_capacity_kg"),
            asset.get("cargo_volume_m3"),
            asset.get("pallet_capacity"),
            asset.get("fuel_type", "diesel"),
            asset.get("fuel_level", 100.0),
            asset.get("fuel_capacity", 100.0),
            asset.get("fuel_consumption_rate", 8.0),
            asset.get("battery"),
            asset.get("battery_drain", 0.0),
            asset.get("has_battery", False),
            asset.get("battery_capacity_kwh"),
            asset.get("home_facility_id"),
            asset.get("current_driver_id"),
            asset.get("in_geofence", False),
            asset.get("last_alarm_tick", 0)
        )
    return asset


@router.put("/assets/{asset_id}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_asset(asset_id: str, payload: AssetIn, request: Request):
    """Update an existing asset in database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Check if asset exists
        existing = await conn.fetchrow("SELECT * FROM assets WHERE id = $1", asset_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Asset not found")

        # Update with new values
        updates = payload.dict(exclude_unset=True)

        await conn.execute("""
            UPDATE assets 
            SET type = COALESCE($2, type),
                registration_number = COALESCE($3, registration_number),
                vin = COALESCE($4, vin),
                make = COALESCE($5, make),
                model = COALESCE($6, model),
                year = COALESCE($7, year),
                lat = COALESCE($8, lat),
                lon = COALESCE($9, lon),
                route = COALESCE($10, route),
                route_index = COALESCE($11, route_index),
                speed = COALESCE($12, speed),
                heading = COALESCE($13, heading),
                status = COALESCE($14, status),
                cargo_capacity_kg = COALESCE($15, cargo_capacity_kg),
                cargo_volume_m3 = COALESCE($16, cargo_volume_m3),
                pallet_capacity = COALESCE($17, pallet_capacity),
                fuel_type = COALESCE($18, fuel_type),
                fuel_level = COALESCE($19, fuel_level),
                fuel_capacity = COALESCE($20, fuel_capacity),
                fuel_consumption_rate = COALESCE($21, fuel_consumption_rate),
                battery = COALESCE($22, battery),
                battery_drain = COALESCE($23, battery_drain),
                has_battery = COALESCE($24, has_battery),
                battery_capacity_kwh = COALESCE($25, battery_capacity_kwh),
                home_facility_id = COALESCE($26, home_facility_id),
                current_driver_id = COALESCE($27, current_driver_id),
                updated_at = NOW()
            WHERE id = $1
        """,
            asset_id,
            updates.get("type"),
            updates.get("registration_number"),
            updates.get("vin"),
            updates.get("make"),
            updates.get("model"),
            updates.get("year"),
            updates.get("lat"),
            updates.get("lon"),
            updates.get("route"),
            updates.get("route_index"),
            updates.get("speed"),
            updates.get("heading"),
            updates.get("status"),
            updates.get("cargo_capacity_kg"),
            updates.get("cargo_volume_m3"),
            updates.get("pallet_capacity"),
            updates.get("fuel_type"),
            updates.get("fuel_level"),
            updates.get("fuel_capacity"),
            updates.get("fuel_consumption_rate"),
            updates.get("battery"),
            updates.get("battery_drain"),
            updates.get("has_battery"),
            updates.get("battery_capacity_kwh"),
            updates.get("home_facility_id"),
            updates.get("current_driver_id")
        )

        # Fetch and return updated asset
        updated = await conn.fetchrow("SELECT * FROM assets WHERE id = $1", asset_id)
        return dict(updated)


@router.delete("/assets/{asset_id}", dependencies=[Depends(require_admin)])
async def delete_asset(asset_id: str, request: Request):
    """Delete an asset from database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM assets WHERE id = $1", asset_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Asset not found")
        return {"ok": True}
