"""
Base CRUD endpoints with database persistence.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from uuid import uuid4
import json

from ..shared.models import BaseIn
from ..shared.auth import require_admin
from ..shared.database import get_pool

router = APIRouter(prefix="/api", tags=["facilities"])


@router.get("/facilities", response_model=List[dict])
async def get_facilities(request: Request):
    """Get all facilities from database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM facilities")
        facilities = []
        for row in rows:
            base = dict(row)
            # Parse assets_stored JSON if it exists
            if base.get("assets_stored"):
                base["assets_stored"] = json.loads(base["assets_stored"]) if isinstance(base["assets_stored"], str) else base["assets_stored"]
            facilities.append(base)
        return facilities


@router.post("/facilities", response_model=dict, dependencies=[Depends(require_admin)])
async def create_base(payload: BaseIn, request: Request):
    """Create a new base in database"""
    bid = payload.id or str(uuid4())
    base = payload.dict()
    base["id"] = bid

    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Convert assets_stored to JSON string if it's a list
        assets_stored = base.get("assets_stored", [])
        if isinstance(assets_stored, list):
            assets_stored = json.dumps(assets_stored)

        await conn.execute("""
            INSERT INTO facilities (id, name, type, lat, lon, capacity, assets_stored, description)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """,
            bid,
            base.get("name"),
            base.get("type"),
            base.get("lat"),
            base.get("lon"),
            base.get("capacity"),
            assets_stored,
            base.get("description")
        )

    # Parse back to list for response
    if isinstance(assets_stored, str):
        base["assets_stored"] = json.loads(assets_stored)

    return base


@router.delete("/facilities/{bid}", dependencies=[Depends(require_admin)])
async def delete_base(bid: str, request: Request):
    """Delete a base from database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM facilities WHERE id = $1", bid)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Base not found")
        return {"ok": True}
