"""
Asset CRUD endpoints.
Uses the in-memory ASSETS (constants) to keep behavior similar to the original structure.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import uuid4

from ..models import AssetIn
from ..auth import require_admin
from ..constants import ASSETS

router = APIRouter(prefix="", tags=["assets"])


@router.get("/assets", response_model=List[dict])
async def get_assets():
    # Return the in-memory assets snapshot
    return ASSETS


@router.post("/assets", response_model=dict, dependencies=[Depends(require_admin)])
async def create_asset(payload: AssetIn):
    aid = payload.id or str(uuid4())
    asset = payload.dict()
    asset["id"] = aid
    ASSETS.append(asset)
    return asset


@router.put("/assets/{asset_id}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_asset(asset_id: str, payload: AssetIn):
    for i, a in enumerate(ASSETS):
        if a.get("id") == asset_id:
            updated = a.copy()
            updated.update(payload.dict(exclude_unset=True))
            ASSETS[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Asset not found")


@router.delete("/assets/{asset_id}", dependencies=[Depends(require_admin)])
async def delete_asset(asset_id: str):
    for i, a in enumerate(ASSETS):
        if a.get("id") == asset_id:
            ASSETS.pop(i)
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Asset not found")
