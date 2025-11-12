"""
Server-Sent Events (SSE) endpoints for real-time updates.
"""
import asyncio
import json
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from ..simulation import ASSET_SUBS, ALERT_SUBS

router = APIRouter(prefix="/api", tags=["streams"])


@router.get("/stream/assets")
async def stream_assets():
    """Stream asset position updates via SSE."""

    async def generate():
        q = asyncio.Queue(maxsize=10)
        ASSET_SUBS.append(q)
        try:
            while True:
                data = await q.get()
                yield f"data: {json.dumps(data)}\n\n"
        except Exception:
            pass
        finally:
            try:
                ASSET_SUBS.remove(q)
            except ValueError:
                pass

    return StreamingResponse(generate(), media_type="text/event-stream")


@router.get("/stream/alerts")
async def stream_alerts():
    """Stream alert updates via SSE."""

    async def generate():
        q = asyncio.Queue(maxsize=10)
        ALERT_SUBS.append(q)
        try:
            while True:
                data = await q.get()
                yield f"data: {json.dumps(data)}\n\n"
        except Exception:
            pass
        finally:
            try:
                ALERT_SUBS.remove(q)
            except ValueError:
                pass

    return StreamingResponse(generate(), media_type="text/event-stream")
