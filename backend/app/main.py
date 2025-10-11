
# backend/app/main.py
import os
import asyncio
import json
import random
from datetime import datetime, timedelta
from typing import List, Optional, Dict
from fastapi import FastAPI, HTTPException, Depends, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncpg
import jwt
from passlib.context import CryptContext
from collections import deque
from fastapi.responses import StreamingResponse

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXP_MIN = int(os.getenv("JWT_EXP_MIN", "120"))

pwd = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

app = FastAPI(title="Aegis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
class GeofenceIn(BaseModel):
    id: Optional[str] = None
    name: str
    polygon: List[List[float]] = Field(..., description="[[lat,lon], ...]")

class Geofence(BaseModel):
    id: str
    name: str
    polygon: List[List[float]]

class LoginIn(BaseModel):
    email: str
    password: str

class LoginOut(BaseModel):
    access_token: str
    role: str

class Alert(BaseModel):
    id: int
    asset_id: str
    rule: str
    geofence_id: Optional[str] = None
    ts: datetime

class User(BaseModel):
    email: str
    role: str

class UserIn(User):
    password: str

# --- Database & Startup ---
async def get_pool():
    if not hasattr(app.state, "pool") or app.state.pool is None:
        app.state.pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=4)
    return app.state.pool

@app.on_event("startup")
async def on_startup():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS geofences(
              id TEXT PRIMARY KEY,
              name TEXT NOT NULL,
              polygon JSONB NOT NULL
            );
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                email TEXT PRIMARY KEY,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL
            );
        """)
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS alerts (
                id SERIAL PRIMARY KEY,
                asset_id TEXT NOT NULL,
                rule TEXT NOT NULL,
                geofence_id TEXT,
                ts TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );
        """)
        users_to_seed = [
            ("admin@aegis.local", pwd.hash("admin123"), "admin"),
            ("operator@aegis.local", pwd.hash("operator123"), "operator"),
            ("viewer@aegis.local", pwd.hash("viewer123"), "viewer"),
        ]
        for email, password_hash, role in users_to_seed:
            await conn.execute("""
                INSERT INTO users (email, password_hash, role)
                VALUES ($1, $2, $3)
                ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role;
            """, email, password_hash, role)

# --- Auth ---
def make_token(email: str, role: str) -> str:
    now = datetime.utcnow()
    payload = {"sub": email, "role": role, "iat": now, "exp": now + timedelta(minutes=JWT_EXP_MIN)}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

def bearer_role(authorization: Optional[str] = Header(None)) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        tok = authorization.split(" ", 1)[1].strip()
        try:
            payload = decode_token(tok)
            return payload.get("role", "user")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
    return "anonymous"

def require_admin(role: str = Depends(bearer_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin required")

@app.post("/auth/login", response_model=LoginOut)
async def login(body: LoginIn, pool: asyncpg.Pool = Depends(get_pool)):
    user = await pool.fetchrow("SELECT * FROM users WHERE email = $1", body.email.lower())
    if not user or not pwd.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Felaktiga inloggningsuppgifter")
    token = make_token(body.email.lower(), user["role"])
    return LoginOut(access_token=token, role=user["role"])

# --- User Management (Admin) ---
@app.get("/users", response_model=List[User], dependencies=[Depends(require_admin)])
async def list_users(pool: asyncpg.Pool = Depends(get_pool)):
    rows = await pool.fetch("SELECT email, role FROM users ORDER BY email")
    return [dict(r) for r in rows]

@app.get("/debug/users", response_model=List[User])
async def list_users_debug(pool: asyncpg.Pool = Depends(get_pool)):
    rows = await pool.fetch("SELECT email, role FROM users ORDER BY email")
    return [dict(r) for r in rows]

@app.post("/users", response_model=User, dependencies=[Depends(require_admin)])
async def create_user(body: UserIn, pool: asyncpg.Pool = Depends(get_pool)):
    try:
        await pool.execute(
            "INSERT INTO users(email, password_hash, role) VALUES($1, $2, $3)",
            body.email.lower(),
            pwd.hash(body.password),
            body.role
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=409, detail=f"User with email '{body.email}' already exists")
    return User(email=body.email.lower(), role=body.role)

# --- Real-time Stream ---

def is_inside_polygon(point: list, polygon: list) -> bool:
    """Checks if a point [lat, lon] is inside a polygon [[lat, lon], ...]."""
    lat, lon = point[0], point[1]
    n = len(polygon)
    inside = False
    p1_lat, p1_lon = polygon[0][0], polygon[0][1]
    for i in range(n + 1):
        p2_lat, p2_lon = polygon[i % n][0], polygon[i % n][1]
        if lat > min(p1_lat, p2_lat):
            if lat <= max(p1_lat, p2_lat):
                if lon <= max(p1_lon, p2_lon):
                    if p1_lat != p2_lat:
                        lon_intersection = (lat - p1_lat) * (p2_lon - p1_lon) / (p2_lat - p1_lat) + p1_lon
                    if p1_lon == p2_lon or lon <= lon_intersection:
                        inside = not inside
        p1_lat, p1_lon = p2_lat, p2_lon
    return inside

# In-memory state for the simulation
stream_state = {
    "assets": {
        "unit-01": {"id": "unit-01", "type": "vehicle", "lat": 62.3901, "lon": 17.3062, "geofence_id": None},
        "unit-02": {"id": "unit-02", "type": "uav", "lat": 62.395, "lon": 17.31, "geofence_id": None},
    },
    "alerts": deque(maxlen=20) # Holds the last 20 alerts
}

async def stream_generator(pool: asyncpg.Pool):
    """Yields real-time updates for assets and alerts."""
    while True:
        try:
            # 1. Fetch all geofences
            geofence_rows = await pool.fetch("SELECT id, name, polygon FROM geofences")
            geofences = [{"id": r["id"], "polygon": r["polygon"]} for r in geofence_rows]

            # 2. Update asset positions and check for geofence breaches
            for asset in stream_state["assets"].values():
                # Simulate movement
                asset["lat"] += (random.random() - 0.5) * 0.001
                asset["lon"] += (random.random() - 0.5) * 0.001
                
                # Check containment
                currently_inside = None
                for gf in geofences:
                    if is_inside_polygon([asset["lat"], asset["lon"]], gf["polygon"]):
                        currently_inside = gf["id"]
                        break
                
                prev_inside = asset.get("geofence_id")

                # 3. Detect state changes and create alerts
                if prev_inside != currently_inside:
                    alert_rule = None
                    if currently_inside:
                        alert_rule = "geofence-enter"
                    else:
                        alert_rule = "geofence-leave"
                    
                    new_alert = {
                        "asset_id": asset["id"],
                        "rule": alert_rule,
                        "geofence_id": currently_inside or prev_inside,
                    }

                    # Insert into DB and add to in-memory deque
                    alert_record = await pool.fetchrow(
                        "INSERT INTO alerts(asset_id, rule, geofence_id) VALUES($1, $2, $3) RETURNING id, ts",
                        new_alert["asset_id"], new_alert["rule"], new_alert["geofence_id"]
                    )
                    new_alert.update({"id": alert_record["id"], "ts": alert_record["ts"].isoformat()})
                    stream_state["alerts"].appendleft(new_alert)

                asset["geofence_id"] = currently_inside

            # 4. Yield the combined state
            payload = {
                "assets": list(stream_state["assets"].values()),
                "alerts": list(stream_state["alerts"])
            }
            yield f"data: {json.dumps(payload)}\n\n"
            await asyncio.sleep(1)

        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Error in stream generator: {e}")
            await asyncio.sleep(5)


@app.get("/stream")
async def stream(req: Request, pool: asyncpg.Pool = Depends(get_pool)):
    # Note: No auth implemented for the stream in this version for simplicity
    return StreamingResponse(stream_generator(pool), media_type="text/event-stream")

# --- Mock Fallback Endpoints ---
@app.get("/assets")
async def assets_fallback():
    # Provides a static list if the stream isn't used
    return list(stream_state["assets"].values())

@app.get("/alerts", response_model=List[Alert])
async def list_alerts(pool: asyncpg.Pool = Depends(get_pool)):
    rows = await pool.fetch("SELECT id, asset_id, rule, geofence_id, ts FROM alerts ORDER BY ts DESC LIMIT 20")
    return [dict(r) for r in rows]

# --- Geofence CRUD ---
@app.get("/geofences", response_model=List[Geofence])
async def list_geofences(pool: asyncpg.Pool = Depends(get_pool)):
    rows = await pool.fetch("SELECT id, name, polygon FROM geofences ORDER BY id")
    return [{"id": r["id"], "name": r["name"], "polygon": json.loads(r["polygon"])} for r in rows]

@app.post("/geofences", response_model=Geofence, dependencies=[Depends(require_admin)])
async def create_geofence(body: GeofenceIn, pool: asyncpg.Pool = Depends(get_pool)):
    gid = body.id or body.name.lower().replace(" ", "-")
    try:
        await pool.execute(
            "INSERT INTO geofences(id, name, polygon) VALUES($1, $2, $3::jsonb)",
            gid, body.name, json.dumps(body.polygon)
        )
    except asyncpg.UniqueViolationError:
        raise HTTPException(status_code=409, detail=f"Geofence med id '{gid}' finns redan")
    return Geofence(id=gid, name=body.name, polygon=body.polygon)

@app.put("/geofences/{gid}", response_model=Geofence, dependencies=[Depends(require_admin)])
async def update_geofence(gid: str, body: GeofenceIn, pool: asyncpg.Pool = Depends(get_pool)):
    res = await pool.execute(
        "UPDATE geofences SET name=$1, polygon=$2::jsonb WHERE id=$3",
        body.name or gid, json.dumps(body.polygon), gid
    )
    if not res.endswith("1"):
        raise HTTPException(status_code=404, detail="Not found")
    return Geofence(id=gid, name=body.name or gid, polygon=body.polygon)

@app.delete("/geofences/{gid}", status_code=204, dependencies=[Depends(require_admin)])
async def delete_geofence(gid: str, pool: asyncpg.Pool = Depends(get_pool)):
    res = await pool.execute("DELETE FROM geofences WHERE id=$1", gid)
    if not res.endswith("1"):
        raise HTTPException(status_code=404, detail="Not found")
    return {}
