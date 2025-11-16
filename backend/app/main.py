import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database functions
from .database import get_pool, init_database, populate_from_constants

# Import routers - Civilian terminology (primary)
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
from .routes.customers import router as customers_router
from .routes.drivers import router as drivers_router
from .routes.shipments import router as shipments_router
from .routes.weather import router as weather_router
from .routes.routing import router as routing_router
from .routes.incidents import router as incidents_router
# Legacy route aliases for backward compatibility (deprecated)
from .routes.bases import router as bases_router
from .routes.geofences import router as geofences_router
from .routes.missions import router as missions_router


# Lifespan context manager for startup/shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database pool and resources on startup, cleanup on shutdown"""
    # Startup
    print("[STARTUP] Initializing database connection pool...")
    pool = await get_pool(app)
    app.state.pool = pool

    try:
        print("[STARTUP] Initializing database schema...")
        await init_database(pool)

        print("[STARTUP] Populating database from constants...")
        await populate_from_constants(pool)

        print("[STARTUP] ✅ Database initialized successfully")
    except Exception as e:
        print(f"[STARTUP] ⚠️ Database initialization failed: {e}")
        print("[STARTUP] Tables will be created when database becomes available")

    yield

    # Shutdown
    print("[SHUTDOWN] Closing database connection pool...")
    if hasattr(app.state, 'pool') and app.state.pool:
        await app.state.pool.close()
    print("[SHUTDOWN] ✅ Cleanup complete")


# Create FastAPI app with lifespan
app = FastAPI(
    title="AEGIS Light API",
    description="Civil Logistics & Situational Awareness Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - Environment-based for production security
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)


# ============================================================================
# PRIMARY ROUTES - Civilian Terminology
# ============================================================================
app.include_router(auth_router, tags=["Authentication"])
app.include_router(health_router, tags=["Health"])
app.include_router(facilities_router, tags=["Facilities"])
app.include_router(tasks_router, tags=["Tasks"])
app.include_router(assets_router, tags=["Assets"])
app.include_router(inventory_router, tags=["Inventory"])
app.include_router(zones_router, tags=["Zones"])
app.include_router(alerts_router, tags=["Alerts"])
app.include_router(field_reports_router, tags=["Field Reports"])
app.include_router(exports_router, tags=["Exports"])
app.include_router(customers_router, tags=["Customers"])
app.include_router(drivers_router, tags=["Drivers"])
app.include_router(shipments_router, tags=["Shipments"])
app.include_router(weather_router, tags=["Weather"])
app.include_router(routing_router, tags=["Routing"])
app.include_router(incidents_router, tags=["Incidents"])
# ============================================================================
# DEPRECATED ROUTES - Backward Compatibility Only
# ============================================================================
app.include_router(bases_router, tags=["Bases (Deprecated)"])
app.include_router(geofences_router, tags=["Geofences (Deprecated)"])
app.include_router(missions_router, tags=["Missions (Deprecated)"])


@app.get("/", tags=["Root"])
async def root():
    """API root endpoint"""
    return {
        "name": "AEGIS Light API",
        "version": "1.0.0",
        "description": "Civil Logistics & Situational Awareness Platform",
        "documentation": "/docs",
        "status": "operational",
        "endpoints": {
            "primary": {
                "facilities": "/api/facilities",
                "tasks": "/api/tasks",
                "assets": "/api/assets",
                "inventory": "/api/inventory",
                "alerts": "/api/alerts"
            },
            "deprecated": {
                "bases": "/api/bases (use /api/facilities)",
                "geofences": "/api/geofences (use /api/zones)",
                "missions": "/api/missions (use /api/tasks)"
            }
        }
    }


@app.get("/api", tags=["Root"])
async def api_info():
    """API information endpoint"""
    return {
        "name": "AEGIS Light API",
        "version": "1.0.0",
        "description": "RESTful API for logistics and asset management",
        "features": [
            "Real-time asset tracking",
            "Task management and routing",
            "Inventory control",
            "Geofencing and alerts",
            "Field reporting"
        ]
    }


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint"""
    return {"ok": True, "status": "healthy"}