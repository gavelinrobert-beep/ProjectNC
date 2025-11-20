"""
Mission planning and routing endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
import json
import math
from datetime import datetime

from ..shared.models import MissionIn, MissionOut
from ..shared.auth import require_admin
from ..shared.database import get_pool

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula (in km)"""
    R = 6371  # Earth's radius in km

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def calculate_mission_metrics(waypoints: List[dict], asset_speed: float = 50.0) -> dict:
    """Calculate total distance, duration, and fuel consumption for a mission"""
    total_distance = 0.0

    for i in range(len(waypoints) - 1):
        wp1 = waypoints[i]
        wp2 = waypoints[i + 1]
        distance = calculate_distance(wp1['lat'], wp1['lon'], wp2['lat'], wp2['lon'])
        total_distance += distance

    # Calculate duration (assuming constant speed)
    duration_hours = total_distance / asset_speed if asset_speed > 0 else 0
    duration_minutes = int(duration_hours * 60)

    # Estimate fuel consumption (rough estimate: 0.3 liters per km for ground vehicles)
    fuel_consumption = total_distance * 0.3

    return {
        'total_distance_km': round(total_distance, 2),
        'estimated_duration_minutes': duration_minutes,
        'estimated_fuel_consumption': round(fuel_consumption, 2)
    }


@router.get("", response_model=List[MissionOut])
async def get_tasks(request: Request, status: str = None):
    """Get all tasks, optionally filter by status"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        if status:
            rows = await conn.fetch("SELECT * FROM tasks WHERE status = $1 ORDER BY created_at DESC", status)
        else:
            rows = await conn.fetch("SELECT * FROM tasks ORDER BY created_at DESC")

        tasks = []
        for row in rows:
            mission = dict(row)
            # Parse JSON fields
            if mission.get('waypoints'):
                mission['waypoints'] = json.loads(mission['waypoints']) if isinstance(mission['waypoints'], str) else mission['waypoints']
            if mission.get('transfer_items'):
                mission['transfer_items'] = json.loads(mission['transfer_items']) if isinstance(mission['transfer_items'], str) else mission['transfer_items']
            tasks.append(mission)

        return tasks


@router.get("/{mission_id}", response_model=MissionOut)
async def get_mission(mission_id: str, request: Request):
    """Get a specific mission by ID"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        if not row:
            raise HTTPException(status_code=404, detail="Mission not found")

        mission = dict(row)
        if mission.get('waypoints'):
            mission['waypoints'] = json.loads(mission['waypoints']) if isinstance(mission['waypoints'], str) else mission['waypoints']
        if mission.get('transfer_items'):
            mission['transfer_items'] = json.loads(mission['transfer_items']) if isinstance(mission['transfer_items'], str) else mission['transfer_items']

        return mission


@router.post("", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def create_mission(payload: MissionIn, request: Request):
    """Create a new mission"""
    mission_id = payload.id or str(uuid4())

    # Convert waypoints to dict list
    waypoints_data = [wp.dict() for wp in payload.waypoints]

    # Get asset speed if asset is assigned
    asset_speed = 50.0  # default speed
    asset = None
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        if payload.asset_id:
            asset = await conn.fetchrow("SELECT speed, type FROM assets WHERE id = $1", payload.asset_id)
            if not asset:
                raise HTTPException(status_code=404, detail="Asset not found")
            asset_speed = asset['speed'] if asset['speed'] > 0 else 50.0

        # Calculate mission metrics
        metrics = calculate_mission_metrics(waypoints_data, asset_speed)

        # Get mission type and transfer data
        mission_type = getattr(payload, 'mission_type', 'patrol')
        source_base_id = getattr(payload, 'source_base_id', None)
        destination_base_id = getattr(payload, 'destination_base_id', None)
        transfer_items = getattr(payload, 'transfer_items', None)

        # Validate transfer mission
        if mission_type == 'transfer':
            if not source_base_id or not destination_base_id:
                raise HTTPException(status_code=400, detail="Transfer tasks require source and destination bases")
            if not transfer_items or len(transfer_items) == 0:
                raise HTTPException(status_code=400, detail="Transfer tasks require items to transfer")

        # Insert mission
        await conn.execute("""
            INSERT INTO tasks (
                id, name, description, asset_id, waypoints, status, priority,
                estimated_duration_minutes, estimated_fuel_consumption, total_distance_km,
                mission_type, source_base_id, destination_base_id, transfer_items
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        """,
            mission_id,
            payload.name,
            payload.description,
            payload.asset_id,
            json.dumps(waypoints_data),
            payload.status,
            payload.priority,
            metrics['estimated_duration_minutes'],
            metrics['estimated_fuel_consumption'],
            metrics['total_distance_km'],
            mission_type,
            source_base_id,
            destination_base_id,
            json.dumps(transfer_items) if transfer_items else None
        )

        # UPDATE ASSET STATUS AND ROUTE
        if payload.asset_id and payload.status == 'active':
            # Build route string from waypoints
            route_str = ' '.join([f"{wp['lat']},{wp['lon']}" for wp in waypoints_data])

            # Determine asset status based on asset type
            asset_type = asset['type'] if asset else 'truck'
            air_types = ['plane', 'helicopter', 'cargo_plane', 'fighter_jet', 'transport_helicopter', 'reconnaissance_plane', 'uav']
            new_status = 'airborne' if asset_type in air_types else 'mobile'

            await conn.execute("""
                UPDATE assets 
                SET status = $1, route = $2, route_index = 0
                WHERE id = $3
            """, new_status, route_str, payload.asset_id)

            print(f"[MISSION] Started mission {mission_id}: Asset {payload.asset_id} set to {new_status} with route: {route_str}")

        # Fetch and return the created mission
        row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        mission = dict(row)
        mission['waypoints'] = waypoints_data
        if mission.get('transfer_items'):
            mission['transfer_items'] = json.loads(mission['transfer_items']) if isinstance(mission['transfer_items'], str) else mission['transfer_items']

        return mission


@router.put("/{mission_id}", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def update_mission(mission_id: str, payload: MissionIn, request: Request):
    """Update an existing mission"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if mission exists
        existing = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Mission not found")

        # Convert waypoints
        waypoints_data = [wp.dict() for wp in payload.waypoints]

        # Get asset speed
        asset_speed = 50.0
        if payload.asset_id:
            asset = await conn.fetchrow("SELECT speed FROM assets WHERE id = $1", payload.asset_id)
            if asset:
                asset_speed = asset['speed'] if asset['speed'] > 0 else 50.0

        # Recalculate metrics
        metrics = calculate_mission_metrics(waypoints_data, asset_speed)

        # Update timestamps based on status changes
        started_at = existing['started_at']
        completed_at = existing['completed_at']

        if payload.status == 'active' and not started_at:
            started_at = datetime.utcnow()
        elif payload.status == 'completed' and not completed_at:
            completed_at = datetime.utcnow()

        # Get mission type and transfer data
        mission_type = getattr(payload, 'mission_type', existing['mission_type'] or 'patrol')
        source_base_id = getattr(payload, 'source_base_id', existing['source_base_id'])
        destination_base_id = getattr(payload, 'destination_base_id', existing['destination_base_id'])
        transfer_items = getattr(payload, 'transfer_items', existing['transfer_items'])

        # Update mission
        await conn.execute("""
            UPDATE tasks SET
                name = $2,
                description = $3,
                asset_id = $4,
                waypoints = $5,
                status = $6,
                priority = $7,
                estimated_duration_minutes = $8,
                estimated_fuel_consumption = $9,
                total_distance_km = $10,
                started_at = $11,
                completed_at = $12,
                mission_type = $13,
                source_base_id = $14,
                destination_base_id = $15,
                transfer_items = $16
            WHERE id = $1
        """,
            mission_id,
            payload.name,
            payload.description,
            payload.asset_id,
            json.dumps(waypoints_data),
            payload.status,
            payload.priority,
            metrics['estimated_duration_minutes'],
            metrics['estimated_fuel_consumption'],
            metrics['total_distance_km'],
            started_at,
            completed_at,
            mission_type,
            source_base_id,
            destination_base_id,
            json.dumps(transfer_items) if transfer_items else None
        )

        # Fetch and return updated mission
        row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        mission = dict(row)
        mission['waypoints'] = waypoints_data
        if mission.get('transfer_items'):
            mission['transfer_items'] = json.loads(mission['transfer_items']) if isinstance(mission['transfer_items'], str) else mission['transfer_items']

        return mission


@router.delete("/{mission_id}", dependencies=[Depends(require_admin)])
async def delete_mission(mission_id: str, request: Request):
    """Delete a mission"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM tasks WHERE id = $1", mission_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Mission not found")
        return {"ok": True}


@router.post("/{mission_id}/start", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def start_mission(mission_id: str, request: Request):
    """Start a mission (change status to active)"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        mission = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found")

        await conn.execute("""
            UPDATE tasks SET status = 'active', started_at = NOW()
            WHERE id = $1
        """, mission_id)

        # Update asset status if mission has an assigned asset
        if mission['asset_id']:
            # Get asset type
            asset = await conn.fetchrow("SELECT type FROM assets WHERE id = $1", mission['asset_id'])
            if asset:
                asset_type = asset['type']
                air_types = ['plane', 'helicopter', 'cargo_plane', 'fighter_jet', 'transport_helicopter', 'reconnaissance_plane', 'uav']
                new_status = 'airborne' if asset_type in air_types else 'mobile'

                # Get waypoints and build route
                waypoints = json.loads(mission['waypoints']) if isinstance(mission['waypoints'], str) else mission['waypoints']
                route_str = ' '.join([f"{wp['lat']},{wp['lon']}" for wp in waypoints])

                await conn.execute("""
                    UPDATE assets 
                    SET status = $1, route = $2, route_index = 0
                    WHERE id = $3
                """, new_status, route_str, mission['asset_id'])

                print(f"[MISSION] Started mission {mission_id}: Asset {mission['asset_id']} set to {new_status}")

        row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        result = dict(row)
        result['waypoints'] = json.loads(result['waypoints']) if isinstance(result['waypoints'], str) else result['waypoints']
        if result.get('transfer_items'):
            result['transfer_items'] = json.loads(result['transfer_items']) if isinstance(result['transfer_items'], str) else result['transfer_items']

        return result


@router.post("/{mission_id}/complete", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def complete_mission(mission_id: str, request: Request):
    """Complete a mission and process inventory transfers if applicable"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        mission = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found")

        if mission['status'] != 'active':
            raise HTTPException(status_code=400, detail="Mission is not active")

        # Update mission status
        await conn.execute("""
            UPDATE tasks SET status = 'completed', completed_at = NOW()
            WHERE id = $1
        """, mission_id)

        # Set asset to parked
        if mission['asset_id']:
            await conn.execute("""
                UPDATE assets 
                SET status = 'parked', route = 'stationary', route_index = 0
                WHERE id = $1
            """, mission['asset_id'])

        # If this is a transfer mission, process inventory transfers
        if mission['mission_type'] == 'transfer' and mission['transfer_items']:
            transfer_items = json.loads(mission['transfer_items']) if isinstance(mission['transfer_items'], str) else mission['transfer_items']
            transfer_results = []

            for item_data in transfer_items:
                try:
                    # Get source item
                    source_item = await conn.fetchrow(
                        'SELECT * FROM inventory_items WHERE id = $1 AND location_id = $2',
                        item_data['item_id'], mission['source_base_id']
                    )

                    if not source_item:
                        raise Exception(f"Item not found at source base")

                    if source_item['quantity'] < item_data['quantity']:
                        raise Exception(f"Insufficient quantity at source")

                    # Reduce quantity at source
                    await conn.execute(
                        'UPDATE inventory_items SET quantity = quantity - $1 WHERE id = $2',
                        item_data['quantity'], item_data['item_id']
                    )

                    # Create transaction for removal
                    await conn.execute(
                        '''INSERT INTO inventory_transactions 
                           (item_id, transaction_type, quantity, location_id, performed_by, notes)
                           VALUES ($1, 'transfer_out', $2, $3, 'system', $4)''',
                        item_data['item_id'], -item_data['quantity'],
                        mission['source_base_id'],
                        f"Transfer to {mission['destination_base_id']} (Mission: {mission['name']})"
                    )

                    # Check if item exists at destination
                    dest_item = await conn.fetchrow(
                        'SELECT * FROM inventory_items WHERE name = $1 AND location_id = $2',
                        source_item['name'], mission['destination_base_id']
                    )

                    if dest_item:
                        # Update existing item
                        await conn.execute(
                            'UPDATE inventory_items SET quantity = quantity + $1 WHERE id = $2',
                            item_data['quantity'], dest_item['id']
                        )
                        dest_item_id = dest_item['id']
                    else:
                        # Create new item at destination
                        dest_item_id = await conn.fetchval(
                            '''INSERT INTO inventory_items 
                               (name, category, quantity, unit, location_id, min_stock_level, weight_per_unit, description)
                               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                               RETURNING id''',
                            source_item['name'], source_item['category'],
                            item_data['quantity'], source_item['unit'],
                            mission['destination_base_id'], source_item['min_stock_level'],
                            source_item['weight_per_unit'],
                            f"Transferred from {mission['source_base_id']}"
                        )

                    # Create transaction for addition
                    await conn.execute(
                        '''INSERT INTO inventory_transactions 
                           (item_id, transaction_type, quantity, location_id, performed_by, notes)
                           VALUES ($1, 'transfer_in', $2, $3, 'system', $4)''',
                        dest_item_id, item_data['quantity'],
                        mission['destination_base_id'],
                        f"Transfer from {mission['source_base_id']} (Mission: {mission['name']})"
                    )

                    transfer_results.append({
                        "item_id": item_data['item_id'],
                        "item_name": source_item['name'],
                        "quantity": item_data['quantity'],
                        "success": True
                    })

                except Exception as e:
                    transfer_results.append({
                        "item_id": item_data['item_id'],
                        "success": False,
                        "error": str(e)
                    })

            # Update mission description with transfer results
            success_count = len([r for r in transfer_results if r['success']])
            await conn.execute(
                '''UPDATE tasks 
                   SET description = description || $1
                   WHERE id = $2''',
                f"\n\n✅ Transfer completed: {success_count} of {len(transfer_results)} items transferred successfully.",
                mission_id
            )

        # Fetch and return updated mission
        row = await conn.fetchrow("SELECT * FROM tasks WHERE id = $1", mission_id)
        result = dict(row)
        result['waypoints'] = json.loads(result['waypoints']) if isinstance(result['waypoints'], str) else result['waypoints']
        if result.get('transfer_items'):
            result['transfer_items'] = json.loads(result['transfer_items']) if isinstance(result['transfer_items'], str) else result['transfer_items']

        return result