"""
Asset CRUD endpoints with database persistence.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from uuid import uuid4

from ..models import AssetIn
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="", tags=["assets"])


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
            INSERT INTO assets (id, type, lat, lon, route, route_index, speed, status, 
                                battery, battery_drain, has_battery, fuel_type, in_geofence, last_alarm_tick)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        """,
            aid,
            asset.get("type"),
            asset.get("lat"),
            asset.get("lon"),
            asset.get("route", "stationary"),
            asset.get("route_index", 0.0),
            asset.get("speed", 0.0),
            asset.get("status", "parked"),
            asset.get("battery"),
            asset.get("battery_drain", 0.0),
            asset.get("has_battery", False),
            asset.get("fuel_type", "diesel"),
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
                lat = COALESCE($3, lat),
                lon = COALESCE($4, lon),
                route = COALESCE($5, route),
                route_index = COALESCE($6, route_index),
                speed = COALESCE($7, speed),
                status = COALESCE($8, status),
                battery = COALESCE($9, battery),
                battery_drain = COALESCE($10, battery_drain),
                has_battery = COALESCE($11, has_battery),
                fuel_type = COALESCE($12, fuel_type)
            WHERE id = $1
        """,
            asset_id,
            updates.get("type"),
            updates.get("lat"),
            updates.get("lon"),
            updates.get("route"),
            updates.get("route_index"),
            updates.get("speed"),
            updates.get("status"),
            updates.get("battery"),
            updates.get("battery_drain"),
            updates.get("has_battery"),
            updates.get("fuel_type")
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
