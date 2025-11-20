"""
Field Module Routes
Handles mobile sync endpoints, offline data queue, and field sessions.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

from .models import OfflineTask, SyncQueue, FieldSession
from ..shared.auth import require_admin
from ..shared.database import get_pool

# Create main router for field module
router = APIRouter(prefix="/api/field", tags=["Field Operations"])


@router.get("/sync-status")
async def get_sync_status(request: Request, device_id: str):
    """Get sync status for a mobile device"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        pending = await conn.fetchval("""
            SELECT COUNT(*) FROM sync_queue 
            WHERE device_id = $1 AND synced = false
        """, device_id)

        return {
            "device_id": device_id,
            "pending_sync_items": pending,
            "last_check": datetime.utcnow().isoformat()
        }


@router.post("/sync")
async def sync_data(request: Request, payload: SyncQueue):
    """Queue data for synchronization from mobile device"""
    pool = await get_pool(request.app)

    sync_id = payload.id or str(uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO sync_queue(
                id, device_id, user_id, operation_type, entity_type, entity_id,
                payload, timestamp, synced, sync_attempts
            ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """,
                           sync_id, payload.device_id, payload.user_id, payload.operation_type,
                           payload.entity_type, payload.entity_id, payload.payload,
                           payload.timestamp, False, 0
                           )

        return {"status": "queued", "sync_id": sync_id}


@router.get("/sessions")
async def get_field_sessions(request: Request, user_id: Optional[str] = None):
    """Get active field sessions"""
    pool = await get_pool(request.app)

    query = "SELECT * FROM field_sessions WHERE session_end IS NULL"
    params = []

    if user_id:
        query += f" AND user_id = ${len(params) + 1}"
        params.append(user_id)

    query += " ORDER BY session_start DESC"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.post("/sessions/start")
async def start_field_session(request: Request, payload: FieldSession):
    """Start a new field session"""
    pool = await get_pool(request.app)

    session_id = payload.id or str(uuid4())

    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO field_sessions(
                id, user_id, device_id, app_version, platform, session_start
            ) VALUES($1, $2, $3, $4, $5, $6)
        """,
                           session_id, payload.user_id, payload.device_id,
                           payload.app_version, payload.platform, payload.session_start
                           )

        return {"status": "started", "session_id": session_id}


@router.post("/sessions/{session_id}/end")
async def end_field_session(request: Request, session_id: str):
    """End an active field session"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        await conn.execute("""
            UPDATE field_sessions SET session_end = $2 WHERE id = $1
        """, session_id, datetime.utcnow())

        return {"status": "ended", "session_id": session_id}
