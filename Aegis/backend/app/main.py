import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes import communications
from .database import get_pool, init_database, populate_from_constants
from .simulation import simulation_loop, ASSET_SUBS, ALERT_SUBS
from .routes.weather import router as weather_router
from .routes.streams import router as streams_router
from .routes.auth import router as auth_router
from .routes.assets import router as assets_router
from .routes.bases import router as bases_router
from .routes.geofences import router as geofences_router
from .routes.alerts import router as alerts_router
from .routes.health import router as health_router
from .routes.missions import router as missions_router
from .routes.inventory import router as inventory_router
from .routes import intelligence
from .routes import simulation

app = FastAPI(title="Aegis API (refactor)")

# CORS Configuration - Single middleware only
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "*"  # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(weather_router)
app.include_router(streams_router)
app.include_router(auth_router)
app.include_router(assets_router)
app.include_router(bases_router)
app.include_router(geofences_router)
app.include_router(alerts_router)
app.include_router(health_router)
app.include_router(missions_router)
app.include_router(inventory_router)
app.include_router(communications.router, prefix="/api/communications", tags=["communications"])
app.include_router(intelligence.router, prefix="/api/intelligence", tags=["intelligence"])
app.include_router(simulation.router, prefix="/api/simulation", tags=["simulation"])

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
    # Start simulation in background
    asyncio.create_task(simulation_loop())

@app.get("/health")
async def health():
    return {"ok": True}