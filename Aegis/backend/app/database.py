"""
Database connection management and table initialization for Aegis backend.
"""
import asyncpg
from .config import DATABASE_URL

# Global pool instance
_pool = None


async def get_pool(app=None):
    """Get or create the database connection pool"""
    global _pool

    # If app.state.pool exists, use it
    if app and hasattr(app.state, "pool") and app.state.pool is not None:
        return app.state.pool

    # If global pool exists and is not closed, use it
    if _pool is not None:
        return _pool

    # Create new pool
    print("[DATABASE] Creating new connection pool...")
    _pool = await asyncpg.create_pool(
        DATABASE_URL,
        min_size=2,
        max_size=10,
        command_timeout=60
    )

    if app:
        app.state.pool = _pool

    return _pool


async def close_pool():
    """Close the database connection pool"""
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def init_database(pool):
    """Create all tables if they don't exist"""
    async with pool.acquire() as conn:
        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS geofences
                           (
                               id
                               TEXT
                               PRIMARY
                               KEY,
                               name
                               TEXT
                               NOT
                               NULL,
                               polygon
                               JSONB
                               NOT
                               NULL
                           );
                           """)

        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS alerts
                           (
                               id
                               SERIAL
                               PRIMARY
                               KEY,
                               asset_id
                               TEXT
                               NOT
                               NULL,
                               geofence_id
                               TEXT,
                               rule
                               TEXT
                               NOT
                               NULL,
                               acknowledged
                               BOOLEAN
                               NOT
                               NULL
                               DEFAULT
                               FALSE,
                               ts
                               TIMESTAMPTZ
                               DEFAULT
                               NOW
                           (
                           ),
                               severity TEXT DEFAULT 'warning',
                               color TEXT DEFAULT '#ff9800'
                               );
                           """)

        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS bases
                           (
                               id
                               TEXT
                               PRIMARY
                               KEY,
                               name
                               TEXT
                               NOT
                               NULL,
                               type
                               TEXT
                               NOT
                               NULL,
                               lat
                               FLOAT
                               NOT
                               NULL,
                               lon
                               FLOAT
                               NOT
                               NULL,
                               capacity
                               INT,
                               assets_stored
                               JSONB,
                               description
                               TEXT
                           );
                           """)

        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS assets
                           (
                               id
                               TEXT
                               PRIMARY
                               KEY,
                               type
                               TEXT
                               NOT
                               NULL,
                               lat
                               FLOAT
                               NOT
                               NULL,
                               lon
                               FLOAT
                               NOT
                               NULL,
                               route
                               TEXT
                               DEFAULT
                               'stationary',
                               route_index
                               FLOAT
                               DEFAULT
                               0.0,
                               speed
                               FLOAT
                               DEFAULT
                               0.0,
                               status
                               TEXT
                               DEFAULT
                               'parked',
                               battery
                               FLOAT,
                               battery_drain
                               FLOAT
                               DEFAULT
                               0.0,
                               has_battery
                               BOOLEAN
                               DEFAULT
                               FALSE,
                               fuel_type
                               TEXT
                               DEFAULT
                               'diesel',
                               in_geofence
                               BOOLEAN
                               DEFAULT
                               FALSE,
                               last_alarm_tick
                               INT
                               DEFAULT
                               0,

                               fuel_level
                               FLOAT
                               DEFAULT
                               100.0,
                               fuel_capacity
                               FLOAT
                               DEFAULT
                               1000.0,
                               fuel_consumption_rate
                               FLOAT
                               DEFAULT
                               1.0,

                               operating_hours
                               FLOAT
                               DEFAULT
                               0.0,
                               maintenance_hours
                               FLOAT
                               DEFAULT
                               100.0,
                               last_maintenance
                               TIMESTAMPTZ,
                               maintenance_status
                               TEXT
                               DEFAULT
                               'operational',

                               home_base_id
                               TEXT
                           );
                           """)

        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS missions
                           (
                               id
                               TEXT
                               PRIMARY
                               KEY,
                               name
                               TEXT
                               NOT
                               NULL,
                               description
                               TEXT,
                               asset_id
                               TEXT,
                               waypoints
                               JSONB
                               NOT
                               NULL,
                               status
                               TEXT
                               DEFAULT
                               'planned',
                               priority
                               TEXT
                               DEFAULT
                               'medium',
                               estimated_duration_minutes
                               INT,
                               estimated_fuel_consumption
                               FLOAT,
                               total_distance_km
                               FLOAT,
                               created_at
                               TIMESTAMPTZ
                               DEFAULT
                               NOW
                           (
                           ),
                               started_at TIMESTAMPTZ,
                               completed_at TIMESTAMPTZ
                               );
                           """)
        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS inventory_items
                           (
                               id
                               TEXT
                               PRIMARY
                               KEY,
                               name
                               TEXT
                               NOT
                               NULL,
                               type
                               TEXT
                               NOT
                               NULL,
                               category
                               TEXT
                               NOT
                               NULL,
                               quantity
                               FLOAT
                               NOT
                               NULL
                               DEFAULT
                               0,
                               unit
                               TEXT
                               NOT
                               NULL,
                               weight_per_unit
                               FLOAT,
                               volume_per_unit
                               FLOAT,
                               location_type
                               TEXT
                               NOT
                               NULL,
                               location_id
                               TEXT
                               NOT
                               NULL,
                               min_stock_level
                               FLOAT
                               DEFAULT
                               0,
                               max_stock_level
                               FLOAT,
                               expiration_date
                               TIMESTAMPTZ,
                               description
                               TEXT,
                               created_at
                               TIMESTAMPTZ
                               DEFAULT
                               NOW
                           (
                           ),
                               updated_at TIMESTAMPTZ DEFAULT NOW
                           (
                           )
                               );
                           """)

        await conn.execute("""
                           CREATE TABLE IF NOT EXISTS inventory_transactions
                           (
                               id
                               SERIAL
                               PRIMARY
                               KEY,
                               item_id
                               TEXT
                               NOT
                               NULL,
                               transaction_type
                               TEXT
                               NOT
                               NULL,
                               quantity
                               FLOAT
                               NOT
                               NULL,
                               from_location_type
                               TEXT,
                               from_location_id
                               TEXT,
                               to_location_type
                               TEXT,
                               to_location_id
                               TEXT,
                               asset_id
                               TEXT,
                               user_email
                               TEXT,
                               notes
                               TEXT,
                               timestamp
                               TIMESTAMPTZ
                               DEFAULT
                               NOW
                           (
                           )
                               );
                           """)

        print("[DATABASE] All tables initialized successfully")


async def populate_from_constants(pool):
    """Populate database from constants.py if tables are empty"""
    try:
        # Import ASSETS and BASES (required)
        from .constants import ASSETS, BASES
    except ImportError as e:
        print(f"[DATABASE] Could not import ASSETS/BASES from constants.py: {e}")
        return

    # Import GEOFENCES (optional)
    try:
        from .constants import GEOFENCES
    except ImportError:
        GEOFENCES = []
        print("[DATABASE] GEOFENCES not found in constants.py, skipping...")

    try:
        import json

        async with pool.acquire() as conn:
            # Populate BASES
            base_count = await conn.fetchval("SELECT COUNT(*) FROM bases")
            if base_count == 0:
                print("[DATABASE] Populating bases from constants.py...")
                for base in BASES:
                    try:
                        assets_stored = base.get('assets_stored', [])
                        if isinstance(assets_stored, list):
                            assets_stored_json = json.dumps(assets_stored)
                        else:
                            assets_stored_json = assets_stored

                        await conn.execute("""
                                           INSERT INTO bases (id, name, type, lat, lon, capacity, assets_stored, description)
                                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (id) DO NOTHING
                                           """,
                                           base['id'], base['name'], base['type'], base['lat'], base['lon'],
                                           base.get('capacity'), assets_stored_json, base.get('description')
                                           )
                    except Exception as e:
                        print(f"[DATABASE] Error adding base {base.get('id')}: {e}")

                final_base_count = await conn.fetchval("SELECT COUNT(*) FROM bases")
                print(f"[DATABASE] ✓ Populated {final_base_count} bases")
            else:
                print(f"[DATABASE] Bases already exist ({base_count} found), skipping...")

            # Populate ASSETS
            asset_count = await conn.fetchval("SELECT COUNT(*) FROM assets")
            if asset_count == 0:
                print("[DATABASE] Populating assets from constants.py...")
                for asset in ASSETS:
                    try:
                        await conn.execute("""
                                           INSERT INTO assets (id, type, lat, lon, route, route_index, speed, status,
                                                               battery, battery_drain, has_battery, fuel_type,
                                                               in_geofence, last_alarm_tick, fuel_level, fuel_capacity,
                                                               fuel_consumption_rate, operating_hours,
                                                               maintenance_hours,
                                                               maintenance_status, home_base_id)
                                           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                                                   $16, $17, $18, $19, $20, $21) ON CONFLICT (id) DO NOTHING
                                           """,
                                           asset['id'], asset['type'], asset['lat'], asset['lon'],
                                           asset.get('route', 'stationary'), asset.get('route_index', 0.0),
                                           asset.get('speed', 0.0), asset.get('status', 'parked'),
                                           asset.get('battery'), asset.get('battery_drain', 0.0),
                                           asset.get('has_battery', False), asset.get('fuel_type', 'diesel'),
                                           asset.get('in_geofence', False), asset.get('last_alarm_tick', 0),
                                           asset.get('fuel_level', 100.0), asset.get('fuel_capacity', 1000.0),
                                           asset.get('fuel_consumption_rate', 1.0), asset.get('operating_hours', 0.0),
                                           asset.get('maintenance_hours', 100.0),
                                           asset.get('maintenance_status', 'operational'),
                                           asset.get('home_base_id')
                                           )
                    except Exception as e:
                        print(f"[DATABASE] Error adding asset {asset.get('id')}: {e}")

                final_asset_count = await conn.fetchval("SELECT COUNT(*) FROM assets")
                print(f"[DATABASE] ✓ Populated {final_asset_count} assets")
            else:
                print(f"[DATABASE] Assets already exist ({asset_count} found), skipping...")

            # Populate GEOFENCES (if they exist)
            if GEOFENCES:
                geofence_count = await conn.fetchval("SELECT COUNT(*) FROM geofences")
                if geofence_count == 0:
                    print("[DATABASE] Populating geofences from constants.py...")
                    for geofence in GEOFENCES:
                        try:
                            polygon_json = json.dumps(geofence['polygon'])
                            await conn.execute("""
                                               INSERT INTO geofences (id, name, polygon)
                                               VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING
                                               """, geofence['id'], geofence['name'], polygon_json)
                        except Exception as e:
                            print(f"[DATABASE] Error adding geofence {geofence.get('id')}: {e}")

                    final_geofence_count = await conn.fetchval("SELECT COUNT(*) FROM geofences")
                    print(f"[DATABASE] ✓ Populated {final_geofence_count} geofences")

    except Exception as e:
        print(f"[DATABASE] Error populating from constants: {e}")