"""
Enhanced simulation with fuel management, maintenance, and return-to-base
"""
import asyncio
import math
import random
import json
from typing import List, Dict
from datetime import datetime

from .database import get_pool
from .alarms import create_alarm

# Subscribers for Server-Sent Events (SSE)
ASSET_SUBS: List[asyncio.Queue] = []
ALERT_SUBS: List[asyncio.Queue] = []

# Fuel consumption rates by asset type (liters per km)
FUEL_CONSUMPTION_RATES = {
    'truck': 0.3,
    'armored_vehicle': 0.5,
    'supply_vehicle': 0.3,
    'fuel_truck': 0.4,
    'ambulance': 0.25,
    'command_vehicle': 0.35,
    'cargo_plane': 3.0,
    'fighter_jet': 5.0,
    'helicopter': 1.5,
    'transport_helicopter': 2.0,
    'reconnaissance_plane': 2.5,
    'uav': 0.1,
    'patrol_boat': 1.0,
    'corvette': 2.0,
    'submarine': 1.5,
    'supply_ship': 3.0,
    'landing_craft': 1.2,
    'plane': 3.0
}

# Maintenance intervals (hours)
MAINTENANCE_INTERVALS = {
    'truck': 200,
    'armored_vehicle': 150,
    'supply_vehicle': 200,
    'fuel_truck': 180,
    'ambulance': 200,
    'command_vehicle': 180,
    'cargo_plane': 100,
    'fighter_jet': 50,
    'helicopter': 80,
    'transport_helicopter': 100,
    'reconnaissance_plane': 90,
    'uav': 120,
    'patrol_boat': 150,
    'corvette': 120,
    'submarine': 100,
    'supply_ship': 180,
    'landing_craft': 150,
    'plane': 100
}

# Compatible base types for different asset categories
BASE_COMPATIBILITY = {
    'ground': ['military', 'logistics', 'storage'],
    'air': ['airfield', 'military'],
    'naval': ['military', 'logistics']
}

def get_asset_category(asset_type: str) -> str:
    """Determine asset category for base compatibility"""
    air_types = ['cargo_plane', 'fighter_jet', 'helicopter', 'transport_helicopter', 'reconnaissance_plane', 'uav', 'plane']
    naval_types = ['patrol_boat', 'corvette', 'submarine', 'supply_ship', 'landing_craft']

    if asset_type in air_types:
        return 'air'
    elif asset_type in naval_types:
        return 'naval'
    else:
        return 'ground'

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance in km using Haversine formula"""
    R = 6371  # Earth radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

def point_in_poly(lat: float, lon: float, polygon: list) -> bool:
    """Check if point is inside polygon using ray casting"""
    if not polygon or len(polygon) < 3:
        return False

    x, y = lat, lon
    n = len(polygon)
    inside = False

    p1x, p1y = polygon[0]
    for i in range(n + 1):
        p2x, p2y = polygon[i % n]
        if y > min(p1y, p2y):
            if y <= max(p1y, p2y):
                if x <= max(p1x, p2x):
                    if p1y != p2y:
                        xinters = (y - p1y) * (p2x - p1x) / (p2y - p1y) + p1x
                    if p1x == p2x or x <= xinters:
                        inside = not inside
        p1x, p1y = p2x, p2y

    return inside

async def find_nearest_compatible_base(pool, asset: Dict) -> Dict:
    """Find nearest base compatible with asset type"""
    category = get_asset_category(asset['type'])
    compatible_types = BASE_COMPATIBILITY[category]

    async with pool.acquire() as conn:
        # Use ANY for array comparison in PostgreSQL
        bases = await conn.fetch(
            "SELECT * FROM bases WHERE type = ANY($1::text[])",
            compatible_types
        )

    if not bases:
        return None

    nearest = None
    min_distance = float('inf')

    for base in bases:
        dist = calculate_distance(asset['lat'], asset['lon'], base['lat'], base['lon'])
        if dist < min_distance:
            min_distance = dist
            nearest = dict(base)

    return nearest

async def return_to_base(pool, asset: Dict, reason: str):
    """Initiate return to base sequence"""
    print(f"[RTB] {asset['id']} returning to base - Reason: {reason}")

    # Find nearest compatible base
    nearest_base = await find_nearest_compatible_base(pool, asset)

    if not nearest_base:
        print(f"[RTB] WARNING: No compatible base found for {asset['id']}")
        return

    # Create route to base
    route = f"{nearest_base['lat']},{nearest_base['lon']}"

    async with pool.acquire() as conn:
        await conn.execute("""
            UPDATE assets 
            SET status = 'returning',
                route = $1,
                route_index = 0,
                home_base_id = $2
            WHERE id = $3
        """, route, nearest_base['id'], asset['id'])

    # Create alert using existing alarm system
    async with pool.acquire() as conn:
        await create_alarm(
            conn,
            asset['id'],
            'return_to_base',
            None,
            f"Returning to base - {reason}",
            alert_subs=ALERT_SUBS
        )

async def simulation_loop():
    """Main simulation loop with fuel and maintenance"""
    await asyncio.sleep(2)
    print("[SIMULATION] Starting enhanced simulation loop...")

    tick = 0

    while True:
        try:
            pool = await get_pool()
            tick += 1

            async with pool.acquire() as conn:
                assets = await conn.fetch(
                    "SELECT * FROM assets WHERE status IN ('mobile', 'airborne', 'returning')"
                )

            for asset_row in assets:
                asset = dict(asset_row)

                # Skip if under maintenance
                if asset.get('maintenance_status') == 'under_maintenance':
                    continue

                route_str = asset.get('route', 'stationary')
                if route_str == 'stationary':
                    continue

                # Parse route
                try:
                    waypoints = []
                    for pair in route_str.split():
                        lat, lon = pair.split(',')
                        waypoints.append((float(lat), float(lon)))
                except:
                    continue

                if not waypoints:
                    continue

                # Get current position and target
                route_index = int(asset.get('route_index', 0))
                if route_index >= len(waypoints):
                    # Reached destination
                    if asset['status'] == 'returning':
                        # Arrived at base - refuel and check maintenance
                        async with pool.acquire() as conn:
                            await conn.execute("""
                                UPDATE assets 
                                SET fuel_level = 100.0,
                                    status = CASE 
                                        WHEN maintenance_status = 'needs_maintenance' THEN 'maintenance'
                                        ELSE 'parked'
                                    END,
                                    route = 'stationary',
                                    route_index = 0
                                WHERE id = $1
                            """, asset['id'])
                        print(f"[RTB] {asset['id']} arrived at base and refueled")
                    continue

                target_lat, target_lon = waypoints[route_index]
                current_lat, current_lon = asset['lat'], asset['lon']

                # Calculate movement
                distance = calculate_distance(current_lat, current_lon, target_lat, target_lon)
                speed_kmh = asset.get('speed', 50)
                speed_kps = speed_kmh / 3600  # km per second
                move_distance = speed_kps * 1  # 1 second tick

                # Check fuel consumption
                fuel_level = asset.get('fuel_level', 100.0)
                fuel_consumption = FUEL_CONSUMPTION_RATES.get(asset['type'], 1.0)
                fuel_used = move_distance * fuel_consumption
                new_fuel_level = max(0, fuel_level - fuel_used)

                # Update operating hours
                operating_hours = asset.get('operating_hours', 0.0)
                new_operating_hours = operating_hours + (1 / 3600)  # Add 1 second in hours

                maintenance_hours = asset.get('maintenance_hours', MAINTENANCE_INTERVALS.get(asset['type'], 100.0))
                maintenance_status = asset.get('maintenance_status', 'operational')

                # Check if maintenance needed
                if new_operating_hours >= maintenance_hours and maintenance_status == 'operational':
                    maintenance_status = 'needs_maintenance'
                    async with pool.acquire() as conn:
                        await create_alarm(
                            conn,
                            asset['id'],
                            'maintenance_required',
                            None,
                            f"Maintenance required after {new_operating_hours:.1f} hours",
                            alert_subs=ALERT_SUBS
                        )

                # Check fuel levels and trigger RTB if needed
                if new_fuel_level < 15 and asset['status'] != 'returning':
                    # Critical fuel - force return to base
                    await return_to_base(pool, asset, "Critical Fuel")
                    continue
                elif new_fuel_level < 20 and asset['status'] != 'returning' and tick % 300 == 0:
                    # Low fuel warning (every 5 minutes)
                    async with pool.acquire() as conn:
                        await create_alarm(
                            conn,
                            asset['id'],
                            'low_fuel',
                            None,
                            f"Low fuel: {new_fuel_level:.1f}%",
                            alert_subs=ALERT_SUBS
                        )

                # Move asset
                if distance <= move_distance:
                    # Reached waypoint
                    new_lat, new_lon = target_lat, target_lon
                    new_route_index = route_index + 1
                else:
                    # Move toward waypoint
                    ratio = move_distance / distance
                    new_lat = current_lat + (target_lat - current_lat) * ratio
                    new_lon = current_lon + (target_lon - current_lon) * ratio
                    new_route_index = route_index

                # Update asset in database
                async with pool.acquire() as conn:
                    await conn.execute("""
                        UPDATE assets 
                        SET lat = $1, 
                            lon = $2, 
                            route_index = $3,
                            fuel_level = $4,
                            operating_hours = $5,
                            maintenance_status = $6
                        WHERE id = $7
                    """, new_lat, new_lon, new_route_index, new_fuel_level,
                        new_operating_hours, maintenance_status, asset['id'])

            # Broadcast asset updates to SSE subscribers
            async with pool.acquire() as conn:
                all_assets = await conn.fetch("SELECT * FROM assets")

            snapshot = [{
                'id': a['id'],
                'lat': a['lat'],
                'lon': a['lon'],
                'type': a['type'],
                'status': a.get('status', 'parked'),
                'battery': a.get('battery'),
                'has_battery': a.get('has_battery', False),
                'fuel_type': a.get('fuel_type', 'diesel'),
                'fuel_level': a.get('fuel_level', 100.0),
                'maintenance_status': a.get('maintenance_status', 'operational'),
                'operating_hours': a.get('operating_hours', 0.0)
            } for a in all_assets]

            for q in list(ASSET_SUBS):
                try:
                    if not q.full():
                        q.put_nowait(snapshot)
                except Exception:
                    try:
                        ASSET_SUBS.remove(q)
                    except ValueError:
                        pass

            # Geofence checks every 10 seconds
            if tick % 10 == 0:
                try:
                    async with pool.acquire() as conn:
                        rows = await conn.fetch('SELECT id, polygon FROM geofences')
                        polys = []
                        for g in rows:
                            poly = g['polygon']
                            if isinstance(poly, str):
                                try:
                                    poly = json.loads(poly)
                                except Exception:
                                    poly = []
                            if not isinstance(poly, list):
                                poly = []
                            polys.append({'id': g['id'], 'polygon': poly})

                        all_assets_for_geofence = await conn.fetch("SELECT * FROM assets")

                        for asset in all_assets_for_geofence:
                            asset_dict = dict(asset)
                            currently_inside = False
                            current_geofence = None

                            for g in polys:
                                try:
                                    if point_in_poly(asset_dict['lat'], asset_dict['lon'], g['polygon']):
                                        currently_inside = True
                                        current_geofence = g['id']

                                        if not asset_dict.get('in_geofence', False):
                                            await create_alarm(conn, asset_dict['id'], 'geofence_entry', g['id'], g['id'], alert_subs=ALERT_SUBS)
                                        break
                                except Exception:
                                    continue

                            if not currently_inside and asset_dict.get('in_geofence', False):
                                await create_alarm(conn, asset_dict['id'], 'geofence_exit', None, "Left monitored area", alert_subs=ALERT_SUBS)

                            await conn.execute("UPDATE assets SET in_geofence = $1 WHERE id = $2", currently_inside, asset_dict['id'])
                except Exception as e:
                    print(f"[SIMULATION] Error during geofence checks: {e}")

            await asyncio.sleep(1)

        except Exception as e:
            print(f"[SIMULATION] Error: {e}")
            await asyncio.sleep(5)