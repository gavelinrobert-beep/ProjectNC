
# backend/app/main.py
import os
from datetime import datetime, timedelta
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncpg
import jwt
from passlib.context import CryptContext

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXP_MIN = int(os.getenv("JWT_EXP_MIN", "120"))

# För demo: undvik bcrypt-trubbel i container -> använd sha256_crypt
pwd = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

USERS = {
    "admin@aegis.local": {"password_hash": pwd.hash("admin123"), "role": "admin"},
    "user@aegis.local": {"password_hash": pwd.hash("user123"), "role": "user"},
}

app = FastAPI(title="Aegis API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/health")
async def health():
    return {"ok": True}

# ---------- AUTH ----------
def make_token(email: str, role: str) -> str:
    now = datetime.utcnow()
    payload = {
        "sub": email,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXP_MIN)).timestamp()),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

def bearer_role(authorization: Optional[str] = Header(None)) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        tok = authorization.split(" ", 1)[1].strip()
        if tok == "dev-token":  # dev-läge
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

# ---------- Mock ----------
@app.get("/assets")
async def assets():
    return [
        {"id":"unit-01","type":"vehicle"},
        {"id":"unit-02","type":"uav"}
    ]

@app.get("/alerts")
async def alerts():
    return []

# ---------- Geofence CRUD ----------
@app.get("/geofences", response_model=List[Geofence])
async def list_geofences():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, polygon FROM geofences ORDER BY id")
    return [{"id":r["id"], "name":r["name"], "polygon":r["polygon"]} for r in rows]

@app.post("/geofences", response_model=Geofence, dependencies=[Depends(require_admin)])
async def create_geofence(body: GeofenceIn):
    gid = body.id or body.name.lower().replace(" ", "-")
    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            await conn.execute(
                "INSERT INTO geofences(id, name, polygon) VALUES($1,$2,$3::jsonb)",
                gid, body.name, body.polygon
            )
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail="Geofence med detta id finns redan")
    return Geofence(id=gid, name=body.name, polygon=body.polygon)

@app.put("/geofences/{gid}", response_model=Geofence, dependencies=[Depends(require_admin)])
async def update_geofence(gid: str, body: GeofenceIn):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute(
            "UPDATE geofences SET name=$1, polygon=$2::jsonb WHERE id=$3",
            body.name or gid, body.polygon, gid
        )
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return Geofence(id=gid, name=body.name or gid, polygon=body.polygon)

@app.delete("/geofences/{gid}", dependencies=[Depends(require_admin)])
async def delete_geofence(gid: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("DELETE FROM geofences WHERE id=$1", gid)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}

