"""
Base CRUD endpoints.
Uses the in-memory BASES list from constants for parity with the original.
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from uuid import uuid4

from ..models import BaseIn
from ..auth import require_admin
from ..constants import BASES

router = APIRouter(prefix="", tags=["bases"])


@router.get("/bases", response_model=List[dict])
async def get_bases():
    return BASES


@router.post("/bases", response_model=dict, dependencies=[Depends(require_admin)])
async def create_base(payload: BaseIn):
    bid = payload.id or str(uuid4())
    base = payload.dict()
    base["id"] = bid
    BASES.append(base)
    return base


@router.delete("/bases/{bid}", dependencies=[Depends(require_admin)])
async def delete_base(bid: str):
    for i, b in enumerate(BASES):
        if b.get("id") == bid:
            BASES.pop(i)
            return {"ok": True}
    raise HTTPException(status_code=404, detail="Base not found")
