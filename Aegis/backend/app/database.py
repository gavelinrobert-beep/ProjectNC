"""
Database connection management and table initialization for Aegis backend.
"""
import asyncpg
from .config import DATABASE_URL

async def get_pool(app=None):
    if app and hasattr(app.state, "pool") and app.state.pool is not None:
        return app.state.pool
    pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=4)
    if app:
        app.state.pool = pool
    return pool

async def init_database(pool):
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
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS bases (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          lat FLOAT NOT NULL,
          lon FLOAT NOT NULL,
          capacity INT,
          assets_stored JSONB,
          description TEXT
        );
        """)
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS assets (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          lat FLOAT NOT NULL,
          lon FLOAT NOT NULL,
          route TEXT DEFAULT 'stationary',
          route_index FLOAT DEFAULT 0.0,
          speed FLOAT DEFAULT 0.0,
          status TEXT DEFAULT 'parked',
          battery FLOAT,
          battery_drain FLOAT DEFAULT 0.0,
          has_battery BOOLEAN DEFAULT FALSE,
          fuel_type TEXT DEFAULT 'diesel',
          in_geofence BOOLEAN DEFAULT FALSE,
          last_alarm_tick INT DEFAULT 0
        );
        """)
