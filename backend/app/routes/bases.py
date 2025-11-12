"""
DEPRECATED: This file is maintained for backward compatibility only.
Please use facilities.py instead.

Legacy "bases" terminology has been replaced with "facilities" for civilian use.
All endpoints proxy to facilities routes.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from uuid import uuid4
import json

from ..models import BaseIn
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="/api", tags=["bases-deprecated"])


@router.get("/bases", response_model=List[dict], deprecated=True)
async def get_bases(request: Request):
    """
    DEPRECATED: Use /api/facilities instead.
    Get all facilities from database (legacy endpoint)
    """
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Query facilities table (bases is now a view)
        rows = await conn.fetch("SELECT * FROM facilities")
        facilities = []
        for row in rows:
            facility = dict(row)
            if facility.get("assets_stored"):
                facility["assets_stored"] = json.loads(facility["assets_stored"]) if isinstance(facility["assets_stored"], str) else facility["assets_stored"]
            facilities.append(facility)
        return facilities


@router.post("/bases", response_model=dict, dependencies=[Depends(require_admin)], deprecated=True)
async def create_base(payload: BaseIn, request: Request):
    """
    DEPRECATED: Use /api/facilities instead.
    Create a new facility in database (legacy endpoint)
    """
    fid = payload.id or str(uuid4())
    facility = payload.dict()
    facility["id"] = fid

    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        assets_stored = facility.get("assets_stored", [])
        if isinstance(assets_stored, list):
            assets_stored = json.dumps(assets_stored)

        await conn.execute("""
            INSERT INTO facilities (id, name, type, lat, lon, capacity, assets_stored, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
            fid,
            facility.get("name"),
            facility.get("type"),
            facility.get("lat"),
            facility.get("lon"),
            facility.get("capacity"),
            assets_stored,
            facility.get("description")
        )

    if isinstance(assets_stored, str):
        facility["assets_stored"] = json.loads(assets_stored)

    return facility


@router.delete("/bases/{fid}", dependencies=[Depends(require_admin)], deprecated=True)
async def delete_base(fid: str, request: Request):
    """
    DEPRECATED: Use /api/facilities instead.
    Delete a facility from database (legacy endpoint)
    """
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM facilities WHERE id = $1", fid)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Facility not found")
        return {"ok": True}