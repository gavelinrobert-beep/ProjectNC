"""
Geofence CRUD endpoints backed by the geofences DB table.
Polygon is expected as a list of [lat, lon] pairs.
"""
import json
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from ..models import GeofenceIn
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="", tags=["geofences"])


@router.get("/geofences", response_model=List[dict])
async def list_geofences():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, polygon FROM geofences ORDER BY id")
        out = []
        for r in rows:
            poly = r["polygon"]
            if isinstance(poly, str):
                try:
                    poly = json.loads(poly)
                except Exception:
                    poly = []
            out.append({"id": r["id"], "name": r["name"], "polygon": poly})
        return out


@router.post("/geofences", response_model=dict, dependencies=[Depends(require_admin)])
async def create_geofence(g: GeofenceIn):
    pool = await get_pool()
    gid = g.id or g.name
    poly = g.polygon
    async with pool.acquire() as conn:
        await conn.execute(
            "INSERT INTO geofences(id, name, polygon) VALUES($1,$2,$3) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, polygon = EXCLUDED.polygon",
            gid, g.name, json.dumps(poly)
        )
    return {"id": gid, "name": g.name, "polygon": poly}


@router.put("/geofences/{gid}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_geofence(gid: str, g: GeofenceIn):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("UPDATE geofences SET name=$1, polygon=$2 WHERE id=$3", g.name, json.dumps(g.polygon), gid)
        # asyncpg returns a string like 'UPDATE 1' or 'UPDATE 0'
        if not res or "0" in res:
            raise HTTPException(status_code=404, detail="Geofence not found")
    return {"id": gid, "name": g.name, "polygon": g.polygon}


@router.delete("/geofences/{gid}", dependencies=[Depends(require_admin)])
async def delete_geofence(gid: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("DELETE FROM geofences WHERE id = $1", gid)
        if not res or "0" in res:
            raise HTTPException(status_code=404, detail="Geofence not found")
    return {"ok": True}
