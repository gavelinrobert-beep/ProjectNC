import asyncpg
import os

# Global pool variable
_pool = None

async def get_pool(app=None):
    """Get or create database connection pool"""
    global _pool
    if _pool is None:
        database_url = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")
        _pool = await asyncpg.create_pool(database_url, min_size=2, max_size=10)

    # Store pool on app.state if app is provided
    if app is not None and not hasattr(app.state, 'pool'):
        app.state.pool = _pool

    return _pool


async def init_database(pool):
    """Initialize database schema from init.sql"""
    # This function should read your init.sql and execute it
    # Or check if tables exist
    async with pool.acquire() as conn:
        # Check if facilities table exists
        exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'facilities'
            )
        """)

        if not exists:
            print("[DATABASE] Tables don't exist yet, they will be created by init.sql")
        else:
            print("[DATABASE] Tables already exist")


async def populate_from_constants(pool):
    """Populate database with initial data from constants.py"""
    # This function should check if you have constants to populate
    # If your constants.py has BASES, ASSETS, etc., insert them here
    async with pool.acquire() as conn:
        # Example: Check if we have any facilities
        count = await conn.fetchval("SELECT COUNT(*) FROM facilities")
        if count == 0:
            print("[DATABASE] No facilities found, database is empty (this is OK for first run)")
        else:
            print(f"[DATABASE] Found {count} facilities in database")