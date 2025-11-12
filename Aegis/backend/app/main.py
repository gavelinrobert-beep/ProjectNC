import asyncio
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import get_pool, init_database, populate_from_constants
from .routes.auth import router as auth_router
from .routes.assets import router as assets_router
from .routes.facilities import router as facilities_router
from .routes.zones import router as zones_router
from .routes.alerts import router as alerts_router
from .routes.health import router as health_router
from .routes.tasks import router as tasks_router
from .routes.inventory import router as inventory_router
from .routes.exports import router as exports_router
from .routes.field_reports import router as field_reports_router

# Legacy route aliases for backward compatibility
from .routes.bases import router as bases_router
from .routes.geofences import router as geofences_router
from .routes.missions import router as missions_router

app = FastAPI(
    title="AEGIS Light API",
    description="Civil Logistics & Situational Awareness Platform",
    version="1.0.0"
)

# CORS Configuration - Environment-based for production security
allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)

# Include routers (new civilian terminology)
app.include_router(auth_router)
app.include_router(assets_router)
app.include_router(facilities_router)
app.include_router(zones_router)
app.include_router(alerts_router)
app.include_router(health_router)
app.include_router(tasks_router)
app.include_router(inventory_router)
app.include_router(exports_router)
app.include_router(field_reports_router)

# Legacy route aliases for backward compatibility
app.include_router(bases_router)
app.include_router(geofences_router)
app.include_router(missions_router)

@app.on_event("startup")
async def on_startup():
    # Create and store pool on app.state so other modules can reuse or access it.
    pool = await get_pool(app)
    try:
        await init_database(pool)
        # Populate database from constants.py if empty
        await populate_from_constants(pool)
    except Exception as e:
        # Log DB init error but continue; tables will be created if DB becomes available
        print(f"[STARTUP] Database initialization failed: {e}")

@app.get("/health")
async def health():
    return {"ok": True}