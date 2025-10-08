
import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")
origins_env = os.getenv("CORS_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]

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

@app.get("/assets")
async def assets():
    return [
        {"id":"unit-01","type":"vehicle"},
        {"id":"unit-02","type":"uav"}
    ]

@app.get("/alerts")
async def alerts():
    return []

@app.get("/geofences", response_model=List[Geofence])
async def list_geofences():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, polygon FROM geofences ORDER BY id")
    return [{"id":r["id"], "name":r["name"], "polygon":r["polygon"]} for r in rows]

@app.post("/geofences", response_model=Geofence)
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

@app.put("/geofences/{gid}", response_model=Geofence)
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

@app.delete("/geofences/{gid}")
async def delete_geofence(gid: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("DELETE FROM geofences WHERE id=$1", gid)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}
