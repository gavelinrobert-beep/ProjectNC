# ============================================
# ADD THIS TO main.py - PART 1: Model (after other BaseModel classes, around line 800)
# ============================================

class AssetIn(BaseModel):
    id: Optional[str] = None
    type: str = Field(..., description="vehicle, uav, truck, helicopter, plane")
    lat: float
    lon: float
    route: str = "stationary"
    route_index: float = 0.0
    speed: float = 0.0
    status: str = Field(..., description="mobile, parked, airborne")
    battery: Optional[float] = None
    battery_drain: float = 0.0
    has_battery: bool = False
    fuel_type: str = Field(..., description="electric, diesel, aviation, jet, gasoline")


# ============================================
# ADD THIS TO main.py - PART 2: Table Creation (in on_startup function, after bases table, around line 770)
# ============================================

    # Create assets table
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

    # Migrate hardcoded assets to database if table is empty
    asset_count = await conn.fetchval("SELECT COUNT(*) FROM assets")
    if asset_count == 0:
        print("[STARTUP] Migrating hardcoded assets to database...")
        for asset in ASSETS:
            await conn.execute("""
                INSERT INTO assets(id, type, lat, lon, route, route_index, speed, status, 
                                 battery, battery_drain, has_battery, fuel_type, in_geofence, last_alarm_tick)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """, asset['id'], asset['type'], asset['lat'], asset['lon'], asset['route'],
                 asset['route_index'], asset['speed'], asset['status'], asset.get('battery'),
                 asset['battery_drain'], asset['has_battery'], asset['fuel_type'],
                 asset['in_geofence'], asset['last_alarm_tick'])
        print(f"[STARTUP] Migrated {len(ASSETS)} assets to database")
    else:
        print(f"[STARTUP] Assets table already has {asset_count} entries")


# ============================================
# ADD THIS TO main.py - PART 3: API Endpoints (after bases endpoints, around line 900)
# ============================================

# ============================================
# ASSETS ENDPOINTS
# ============================================

@app.post("/assets", dependencies=[Depends(require_admin)])
async def create_asset(body: AssetIn):
    pool = await get_pool()
    asset_id = body.id or f"asset-{body.type}-{int(datetime.now(UTC).timestamp())}"
    
    # Create in-memory asset
    new_asset = {
        "id": asset_id,
        "type": body.type,
        "lat": body.lat,
        "lon": body.lon,
        "route": body.route,
        "route_index": body.route_index,
        "speed": body.speed,
        "status": body.status,
        "battery": body.battery,
        "battery_drain": body.battery_drain,
        "has_battery": body.has_battery,
        "fuel_type": body.fuel_type,
        "in_geofence": False,
        "last_alarm_tick": 0
    }
    
    ASSETS.append(new_asset)
    
    # Also save to database for persistence
    async with pool.acquire() as conn:
        try:
            await conn.execute("""
                INSERT INTO assets(id, type, lat, lon, route, route_index, speed, status, 
                                 battery, battery_drain, has_battery, fuel_type, in_geofence, last_alarm_tick)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """, asset_id, body.type, body.lat, body.lon, body.route, body.route_index,
                 body.speed, body.status, body.battery, body.battery_drain, body.has_battery,
                 body.fuel_type, False, 0)
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail="Asset with this ID already exists")
    
    return {"id": asset_id, "type": body.type, "status": body.status}


@app.put("/assets/{asset_id}", dependencies=[Depends(require_admin)])
async def update_asset(asset_id: str, body: AssetIn):
    pool = await get_pool()
    
    # Find and update in-memory asset
    asset_found = False
    for asset in ASSETS:
        if asset["id"] == asset_id:
            asset["type"] = body.type
            asset["lat"] = body.lat
            asset["lon"] = body.lon
            asset["route"] = body.route
            asset["route_index"] = body.route_index
            asset["speed"] = body.speed
            asset["status"] = body.status
            asset["battery"] = body.battery
            asset["battery_drain"] = body.battery_drain
            asset["has_battery"] = body.has_battery
            asset["fuel_type"] = body.fuel_type
            asset_found = True
            break
    
    if not asset_found:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Update in database
    async with pool.acquire() as conn:
        res = await conn.execute("""
            UPDATE assets 
            SET type=$1, lat=$2, lon=$3, route=$4, route_index=$5, speed=$6, status=$7,
                battery=$8, battery_drain=$9, has_battery=$10, fuel_type=$11
            WHERE id=$12
        """, body.type, body.lat, body.lon, body.route, body.route_index, body.speed,
             body.status, body.battery, body.battery_drain, body.has_battery, body.fuel_type, asset_id)
        
        if res.endswith("0"):
            # Not in DB, insert it
            await conn.execute("""
                INSERT INTO assets(id, type, lat, lon, route, route_index, speed, status, 
                                 battery, battery_drain, has_battery, fuel_type, in_geofence, last_alarm_tick)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            """, asset_id, body.type, body.lat, body.lon, body.route, body.route_index,
                 body.speed, body.status, body.battery, body.battery_drain, body.has_battery,
                 body.fuel_type, False, 0)
    
    return {"id": asset_id, "status": "updated"}


@app.delete("/assets/{asset_id}", dependencies=[Depends(require_admin)])
async def delete_asset(asset_id: str):
    pool = await get_pool()
    
    # Remove from in-memory list
    global ASSETS
    original_length = len(ASSETS)
    ASSETS = [a for a in ASSETS if a["id"] != asset_id]
    
    if len(ASSETS) == original_length:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    # Remove from database
    async with pool.acquire() as conn:
        await conn.execute("DELETE FROM assets WHERE id=$1", asset_id)
    
    return {"ok": True}