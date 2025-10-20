"""
Entry point for the Aegis backend (refactor branch).

- Initializes FastAPI and CORS from config.
- On startup: create DB pool, run DB init, and start simulation_loop as a background task.
- Includes routers (weather + streams). Add other routers similarly.
"""
import asyncio

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS, _ALLOW_ALL_ORIGINS
from .database import get_pool, init_database
from .simulation import simulation_loop
from .routes.weather import router as weather_router
from .routes.streams import router as streams_router

app = FastAPI(title="Aegis API (refactor)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False if _ALLOW_ALL_ORIGINS else True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers. Add other route modules (auth, assets, bases, alerts, geofences) the same way.
app.include_router(weather_router)
app.include_router(streams_router)


@app.on_event("startup")
async def on_startup():
    # Create and store pool on app.state so other modules can reuse or access it.
    pool = await get_pool(app)
    await init_database(pool)
    # Start simulation in background
    asyncio.create_task(simulation_loop())


@app.get("/health")
async def health():
    return {"ok": True}
