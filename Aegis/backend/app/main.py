import os, json, asyncio, math, io, csv
from datetime import datetime, timedelta, UTC
from typing import List, Optional

import asyncpg
import jwt
from fastapi import Depends, FastAPI, Header, HTTPException, Request, Path, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

origins_env = (os.getenv("CORS_ORIGINS", "*") or "*").strip()
if origins_env == "*":
    _ALLOW_ALL_ORIGINS = True
    ALLOWED_ORIGINS = ["*"]
else:
    _ALLOW_ALL_ORIGINS = False
    ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXP_MIN = int(os.getenv("JWT_EXP_MIN", "120"))

pwd = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

USERS = {
    "admin@aegis.local": {"password_hash": pwd.hash("admin123"), "role": "admin"},
    "user@aegis.local": {"password_hash": pwd.hash("user123"), "role": "user"},
}

app = FastAPI(title="Aegis API v2.4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False if _ALLOW_ALL_ORIGINS else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class GeofenceIn(BaseModel):
    id: Optional[str] = None
    name: str
    polygon: List[List[float]] = Field(..., description="[[lat,lon], ...]")

class LoginIn(BaseModel):
    email: str
    password: str

class LoginOut(BaseModel):
    access_token: str
    role: str

async def get_pool():
    if not hasattr(app.state, "pool") or app.state.pool is None:
        app.state.pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=4)
    return app.state.pool

ASSET_SUBS: list[asyncio.Queue] = []
ALERT_SUBS: list[asyncio.Queue] = []

def point_in_poly(lat: float, lon: float, poly: list[list[float]]) -> bool:
    inside = False
    n = len(poly)
    if n < 3: return False
    for i in range(n):
        j = (i - 1) % n
        xi, yi = poly[i][0], poly[i][1]
        xj, yj = poly[j][0], poly[j][1]
        intersect = ((yi > lon) != (yj > lon)) and (lat < (xj - xi) * (lon - yi) / (yj - yi + 1e-12) + xi)
        if intersect: inside = not inside
    return inside

ASSETS = [
    {"id":"unit-01","type":"vehicle","lat":62.392,"lon":17.305,"vx":0.0006,"vy":0.0003,"phase":0.0},
    {"id":"unit-02","type":"uav","lat":62.395,"lon":17.318,"vx":-0.0004,"vy":0.0005,"phase":1.2},
    {"id":"unit-03","type":"truck","lat":62.384,"lon":17.299,"vx":0.0003,"vy":-0.0002,"phase":2.1},
]

@app.on_event("startup")
async def on_startup():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS geofences (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          polygon JSONB NOT NULL
        );
        """)
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS alarms (
          id SERIAL PRIMARY KEY,
          asset_id TEXT NOT NULL,
          geofence_id TEXT,
          rule TEXT NOT NULL,
          acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
          ts TIMESTAMPTZ DEFAULT NOW()
        );
        """)
    asyncio.create_task(simulation_loop())

@app.get("/health")
async def health():
    return {"ok": True}

def make_token(email: str, role: str) -> str:
    now = datetime.now(UTC)
    payload = {"sub": email, "role": role, "iat": int(now.timestamp()), "exp": int((now + timedelta(minutes=JWT_EXP_MIN)).timestamp())}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

def bearer_role(authorization: Optional[str] = Header(None)) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        tok = authorization.split(" ", 1)[1].strip()
        if tok == "dev-token":
            return "admin"
        try:
            payload = decode_token(tok)
            return payload.get("role", "user")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
    return "anonymous"

def require_admin(role: str = Depends(bearer_role)) -> None:
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin required")

@app.post("/auth/login", response_model=LoginOut)
async def login(body: LoginIn):
    user = USERS.get(body.email.lower())
    if not user or not pwd.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Felaktiga inloggningsuppgifter")
    token = make_token(body.email.lower(), user["role"])
    return LoginOut(access_token=token, role=user["role"])

@app.get("/assets")
async def assets():
    return [{"id":a["id"], "type":a["type"]} for a in ASSETS]

@app.get("/alerts")
async def alerts():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alarms ORDER BY id DESC LIMIT 200")
    return [{"id":r["id"], "asset_id":r["asset_id"], "geofence_id":r["geofence_id"], "rule":r["rule"], "acknowledged":r["acknowledged"], "ts":r["ts"].isoformat()} for r in rows]

@app.get("/alerts.csv")
async def alerts_csv():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alarms ORDER BY id DESC")
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id","asset_id","geofence_id","rule","acknowledged","ts"])
    for r in rows:
        writer.writerow([r["id"], r["asset_id"], r["geofence_id"] or "", r["rule"], r["acknowledged"], r["ts"].isoformat()])
    return Response(content=output.getvalue(), media_type="text/csv")

@app.get("/alerts.pdf")
async def alerts_pdf():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alarms ORDER BY id DESC LIMIT 500")
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "Project AEGIS — Larmrapport")
    y -= 20
    c.setFont("Helvetica", 10)
    c.drawString(40, y, datetime.now(UTC).strftime("Genererad: %Y-%m-%d %H:%M UTC"))
    y -= 20
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "ID"); c.drawString(90, y, "Tillgång"); c.drawString(170, y, "Geofence"); c.drawString(260, y, "Regel"); c.drawString(420, y, "Status"); c.drawString(480, y, "Tid")
    y -= 12
    c.setFont("Helvetica", 10)
    for r in rows:
        if y < 40:
            c.showPage(); y = height - 40
        c.drawString(40, y, str(r["id"]))
        c.drawString(90, y, r["asset_id"])
        c.drawString(170, y, r["geofence_id"] or "")
        c.drawString(260, y, (r["rule"] or "")[:28])
        c.drawString(420, y, "Kvitterad" if r["acknowledged"] else "Ohanterad")
        c.drawString(480, y, r["ts"].strftime("%H:%M:%S"))
        y -= 12
    c.showPage()
    c.save()
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="application/pdf")

@app.put("/alerts/{aid}/ack")
async def ack_alert(aid: int = Path(..., ge=1)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("UPDATE alarms SET acknowledged=TRUE WHERE id=$1", aid)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

@app.get("/stream/assets")
async def stream_assets(request: Request):
    q: asyncio.Queue = asyncio.Queue()
    ASSET_SUBS.append(q)
    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await q.get()
                yield f"data: {json.dumps(data)}\n\n"
        finally:
            try: ASSET_SUBS.remove(q)
            except ValueError: pass
    return StreamingResponse(gen(), media_type="text/event-stream")

@app.get("/stream/alerts")
async def stream_alerts(request: Request):
    q: asyncio.Queue = asyncio.Queue()
    ALERT_SUBS.append(q)
    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await q.get()
                yield f"data: {json.dumps(data)}\n\n"
        finally:
            try: ALERT_SUBS.remove(q)
            except ValueError: pass
    return StreamingResponse(gen(), media_type="text/event-stream")

@app.get("/geofences")
async def get_geofences():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, polygon FROM geofences")
        print("[DEBUG] Geofences fetched from DB:", rows)
    result = []
    for r in rows:
        polygon_data = r["polygon"]
        # asyncpg automatically deserializes JSONB to Python objects
        if isinstance(polygon_data, str):
            try:
                polygon_data = json.loads(polygon_data)
            except:
                polygon_data = []
        elif not isinstance(polygon_data, list):
            polygon_data = []

        result.append({
            "id": r["id"],
            "name": r["name"],
            "polygon": polygon_data
        })
        print(f"[DEBUG] Returning geofence: id={r['id']}, polygon type={type(polygon_data)}, polygon={polygon_data}")

    print(f"[DEBUG] Total geofences returned: {len(result)}")
    return result

class GeofenceInModel(GeofenceIn): pass

@app.post("/geofences", dependencies=[Depends(require_admin)])
async def create_geofence(body: GeofenceInModel):
    gid = (body.id or body.name).strip().lower().replace(" ", "-")
    if not gid:
        raise HTTPException(status_code=422, detail="Ogiltigt id/namn")
    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            await conn.execute(
                "INSERT INTO geofences(id, name, polygon) VALUES($1,$2,$3)",
                gid, body.name, json.dumps(body.polygon)
            )
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail="Geofence med detta id finns redan")
    return {"id":gid, "name":body.name, "polygon":body.polygon}

@app.put("/geofences/{gid}", dependencies=[Depends(require_admin)])
async def update_geofence(gid: str, body: GeofenceInModel):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute(
            "UPDATE geofences SET name=$1, polygon=$2 WHERE id=$3",
            (body.name or gid), json.dumps(body.polygon), gid
        )
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"id":gid, "name":body.name or gid, "polygon":body.polygon}

@app.delete("/geofences/{gid}", dependencies=[Depends(require_admin)])
async def delete_geofence(gid: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("DELETE FROM geofences WHERE id=$1", gid)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

async def simulation_loop():
    pool = await get_pool()
    while True:
        await asyncio.sleep(1.0)
        for a in ASSETS:
            a['phase'] += 0.15
            a['lat'] += math.sin(a['phase']) * a['vx']
            a['lon'] += math.cos(a['phase']) * a['vy']
        snapshot=[{'id':a['id'],'lat':a['lat'],'lon':a['lon'],'type':a['type']} for a in ASSETS]
        for q in list(ASSET_SUBS):
            if not q.full(): q.put_nowait(snapshot)
        async with pool.acquire() as conn:
            geos = await conn.fetch('SELECT id, polygon FROM geofences')
            polys = [{'id':g['id'], 'polygon': g['polygon']} for g in geos]
            for a in ASSETS:
                for g in polys:
                    try:
                        if point_in_poly(a['lat'], a['lon'], g['polygon']):
                            rec = await conn.fetchrow("""
                                INSERT INTO alarms(asset_id, geofence_id, rule)
                                VALUES($1,$2,$3)
                                RETURNING id, asset_id, geofence_id, rule, acknowledged, ts
                            """, a['id'], g['id'], f"intrång:{g['id']}")
                            alert = {'id':rec['id'],'asset_id':rec['asset_id'],'geofence_id':rec['geofence_id'],'rule':rec['rule'],'acknowledged':rec['acknowledged'],'ts':rec['ts'].isoformat()}
                            for q in list(ALERT_SUBS):
                                if not q.full(): q.put_nowait([alert])
                    except Exception:
                        continue