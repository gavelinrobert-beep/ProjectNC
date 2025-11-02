"""
Alert endpoints: list alarms, export CSV, export PDF (simple), acknowledge alerts.
Alerts are stored in the alarms DB table.
"""
import io
import csv
from fastapi import APIRouter, HTTPException, Response, Depends
from fastapi.responses import StreamingResponse
from typing import List
from ..database import get_pool
from ..auth import require_admin

router = APIRouter(prefix="", tags=["alerts"])


@router.get("/alerts", response_model=List[dict])
async def list_alerts(limit: int = 100):
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alerts ORDER BY ts DESC LIMIT $1", limit)
        out = []
        for r in rows:
            out.append({
                "id": r["id"],
                "asset_id": r["asset_id"],
                "geofence_id": r["geofence_id"],
                "rule": r["rule"],
                "acknowledged": r["acknowledged"],
                "ts": r["ts"].isoformat() if r["ts"] is not None else None
            })
        return out


@router.get("/alerts.csv")
async def alerts_csv():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alerts ORDER BY ts DESC LIMIT 1000")
        stream = io.StringIO()
        writer = csv.writer(stream)
        writer.writerow(["id", "asset_id", "geofence_id", "rule", "acknowledged", "ts"])
        for r in rows:
            writer.writerow([r["id"], r["asset_id"], r["geofence_id"], r["rule"], r["acknowledged"], r["ts"].isoformat() if r["ts"] is not None else ""])
        stream.seek(0)
        return StreamingResponse(iter([stream.read()]), media_type="text/csv", headers={"Content-Disposition": "attachment; filename=alerts.csv"})


@router.get("/alerts.pdf")
async def alerts_pdf():
    # Minimal PDF-like response: if you want a real PDF, install reportlab and generate properly.
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alerts ORDER BY ts DESC LIMIT 200")
        text_lines = ["Alerts report", "=================", ""]
        for r in rows:
            ts = r["ts"].isoformat() if r["ts"] is not None else ""
            text_lines.append(f"{r['id']} | {r['asset_id']} | {r['geofence_id']} | {r['rule']} | ack={r['acknowledged']} | {ts}")
        content = "\n".join(text_lines).encode("utf-8")
        # Return as application/pdf for compatibility; this is plain text inside PDF MIME.
        return Response(content, media_type="application/pdf", headers={"Content-Disposition": "attachment; filename=alerts.pdf"})


@router.put("/alerts/{aid}/ack", dependencies=[Depends(require_admin)])
async def ack_alert(aid: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("UPDATE alerts SET acknowledged = TRUE WHERE id = $1", aid)
        if not res or "0" in res:
            raise HTTPException(status_code=404, detail="Alert not found")
    return {"ok": True}
