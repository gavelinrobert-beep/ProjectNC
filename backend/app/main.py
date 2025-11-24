import asyncio
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import database functions from shared
from .shared.database import get_pool, init_database, populate_from_constants

# Import modular routers
from .logistics.routes import router as logistics_router
from .fleet.routes import router as fleet_router
from .works.routes import router as works_router
from .field.routes import router as field_router
from .sites.routes import router as sites_router

# Import existing route modules that haven't been migrated yet
from .routes.auth import router as auth_router
from .routes.alerts import router as alerts_router
from .routes.health import router as health_router
from .routes.tasks import router as tasks_router
from .routes.exports import router as exports_router
from .routes.field_reports import router as field_reports_router
from .routes.weather import router as weather_router
from .routes.routing import router as routing_router
from .routes.incidents import router as incidents_router
from .routes.metrics import router as metrics_router
from .routes.tracking import router as tracking_router
from .routes.driver import router as driver_router
from app.routers import logistics, fleet, sites, works, metrics
# Legacy route aliases for backward compatibility (deprecated)
from .routes.bases import router as bases_router
from .routes.geofences import router as geofences_router
from .routes.missions import router as missions_router
from .routes.zones import router as zones_router


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
    title="SYLON Systems API",
    description="Modular Logistics & Operations Management Platform",
    version="2.0.0",
    lifespan=lifespan
)

# CORS Configuration - Environment-based for production security
allowed_origins = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://127.0.0.1:5173,http://localhost:3000,http://localhost:8080,http://127.0.0.1:8080"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)


# ============================================================================
# MODULAR ROUTES - New Architecture
# ============================================================================
app.include_router(logistics_router, tags=["Logistics"])
app.include_router(fleet_router, tags=["Fleet"])
app.include_router(works_router, tags=["Works"])
app.include_router(field_router, tags=["Field"])
app.include_router(sites_router, tags=["Sites"])
app.include_router(logistics.router)
app.include_router(fleet.router)
app.include_router(sites.router)
app.include_router(works.router)
app.include_router(metrics.router)
# ============================================================================
# SHARED & CROSS-MODULE ROUTES
# ============================================================================
app.include_router(auth_router, tags=["Authentication"])
app.include_router(health_router, tags=["Health"])
app.include_router(tasks_router, tags=["Tasks"])
app.include_router(alerts_router, tags=["Alerts"])
app.include_router(field_reports_router, tags=["Field Reports"])
app.include_router(exports_router, tags=["Exports"])
app.include_router(weather_router, tags=["Weather"])
app.include_router(routing_router, tags=["Routing"])
app.include_router(incidents_router, tags=["Incidents"])
app.include_router(metrics_router, tags=["Metrics"])
app.include_router(zones_router, tags=["Zones"])

# ============================================================================
# PUBLIC & DRIVER APP ROUTES
# ============================================================================
app.include_router(tracking_router, tags=["Public Tracking"])
app.include_router(driver_router, tags=["Driver App"])

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
        "name": "SYLON Systems API",
        "version": "2.0.0",
        "description": "Modular Logistics & Operations Management Platform",
        "documentation": "/docs",
        "status": "operational",
        "modules": {
            "logistics": {
                "shipments": "/api/shipments",
                "customers": "/api/customers"
            },
            "fleet": {
                "drivers": "/api/drivers",
                "assets": "/api/assets"
            },
            "works": {
                "projects": "/api/v1/works/projects",
                "work_orders": "/api/v1/works/work-orders"
            },
            "field": {
                "sync": "/api/field/sync",
                "sessions": "/api/field/sessions"
            },
            "sites": {
                "facilities": "/api/facilities",
                "inventory": "/api/inventory"
            }
        }
    }


@app.get("/api", tags=["Root"])
async def api_info():
    """API information endpoint"""
    return {
        "name": "SYLON Systems API",
        "version": "2.0.0",
        "description": "Modular RESTful API for logistics and asset management",
        "architecture": "5-Module Design: Logistics, Fleet, Works, Field, Sites",
        "features": [
            "Real-time asset tracking",
            "Task management and routing",
            "Inventory control",
            "Shipment tracking",
            "Driver management",
            "Field operations support"
        ]
    }


@app.get("/api/search", tags=["Search"])
async def global_search(q: str):
    """
    Global search across all entities: vehicles, drivers, packages, facilities.
    Returns categorized results based on the query string.
    """
    from .shared.database import get_pool
    from fastapi import Request
    
    if not q or len(q) < 2:
        return {
            "query": q,
            "vehicles": [],
            "drivers": [],
            "packages": [],
            "facilities": [],
            "inventory": []
        }
    
    pool = await get_pool(app)
    search_term = f"%{q.lower()}%"
    
    async with pool.acquire() as conn:
        # Search vehicles/assets
        vehicles = await conn.fetch("""
            SELECT id, name, license_plate, asset_type, status, manufacturer, model
            FROM assets
            WHERE LOWER(name) LIKE $1 
            OR LOWER(license_plate) LIKE $1
            OR LOWER(id) LIKE $1
            LIMIT 10
        """, search_term)
        
        # Search drivers
        drivers = await conn.fetch("""
            SELECT id, name, email, phone, status, license_number
            FROM drivers
            WHERE LOWER(name) LIKE $1
            OR LOWER(email) LIKE $1
            OR LOWER(phone) LIKE $1
            OR LOWER(license_number) LIKE $1
            LIMIT 10
        """, search_term)
        
        # Search shipments/packages
        packages = await conn.fetch("""
            SELECT id, tracking_number, status, sender_name, recipient_name, 
                   pickup_address, delivery_address
            FROM shipments
            WHERE LOWER(tracking_number) LIKE $1
            OR LOWER(sender_name) LIKE $1
            OR LOWER(recipient_name) LIKE $1
            OR LOWER(id) LIKE $1
            LIMIT 10
        """, search_term)
        
        # Search facilities
        facilities = await conn.fetch("""
            SELECT id, name, type, lat, lon, description
            FROM facilities
            WHERE LOWER(name) LIKE $1
            OR LOWER(type) LIKE $1
            OR LOWER(description) LIKE $1
            OR LOWER(id) LIKE $1
            LIMIT 10
        """, search_term)
        
        # Search inventory items
        inventory_items = await conn.fetch("""
            SELECT id, name, category, quantity, unit, location_id
            FROM inventory
            WHERE LOWER(name) LIKE $1
            OR LOWER(category) LIKE $1
            LIMIT 10
        """, search_term)
        
        return {
            "query": q,
            "vehicles": [dict(row) for row in vehicles],
            "drivers": [dict(row) for row in drivers],
            "packages": [dict(row) for row in packages],
            "facilities": [dict(row) for row in facilities],
            "inventory": [dict(row) for row in inventory_items]
        }


@app.get("/health", tags=["Health"])
async def health():
    """Health check endpoint"""
    return {"ok": True, "status": "healthy"}
