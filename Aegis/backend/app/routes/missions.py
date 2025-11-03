"""
Mission planning and routing endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from uuid import uuid4
import json
import math
from datetime import datetime

from ..models import MissionIn, MissionOut
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="/api/missions", tags=["missions"])


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
async def get_missions(request: Request, status: str = None):
    """Get all missions, optionally filter by status"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        if status:
            rows = await conn.fetch("SELECT * FROM missions WHERE status = $1 ORDER BY created_at DESC", status)
        else:
            rows = await conn.fetch("SELECT * FROM missions ORDER BY created_at DESC")

        missions = []
        for row in rows:
            mission = dict(row)
            # Parse waypoints JSON
            if mission.get('waypoints'):
                mission['waypoints'] = json.loads(mission['waypoints']) if isinstance(mission['waypoints'], str) else mission['waypoints']
            missions.append(mission)

        return missions


@router.get("/{mission_id}", response_model=MissionOut)
async def get_mission(mission_id: str, request: Request):
    """Get a specific mission by ID"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
        if not row:
            raise HTTPException(status_code=404, detail="Mission not found")

        mission = dict(row)
        if mission.get('waypoints'):
            mission['waypoints'] = json.loads(mission['waypoints']) if isinstance(mission['waypoints'], str) else mission['waypoints']

        return mission


@router.post("", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def create_mission(payload: MissionIn, request: Request):
    """Create a new mission"""
    mission_id = payload.id or str(uuid4())

    # Convert waypoints to dict list
    waypoints_data = [wp.dict() for wp in payload.waypoints]

    # Get asset speed if asset is assigned
    asset_speed = 50.0  # default speed
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        if payload.asset_id:
            asset = await conn.fetchrow("SELECT speed, type FROM assets WHERE id = $1", payload.asset_id)
            if not asset:
                raise HTTPException(status_code=404, detail="Asset not found")
            asset_speed = asset['speed'] if asset['speed'] > 0 else 50.0

        # Calculate mission metrics
        metrics = calculate_mission_metrics(waypoints_data, asset_speed)

        # Insert mission
        await conn.execute("""
            INSERT INTO missions (
                id, name, description, asset_id, waypoints, status, priority,
                estimated_duration_minutes, estimated_fuel_consumption, total_distance_km
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
            metrics['total_distance_km']
        )

        # Fetch and return the created mission
        row = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
        mission = dict(row)
        mission['waypoints'] = waypoints_data

        return mission


@router.put("/{mission_id}", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def update_mission(mission_id: str, payload: MissionIn, request: Request):
    """Update an existing mission"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if mission exists
        existing = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
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

        # Update mission
        await conn.execute("""
            UPDATE missions SET
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
                completed_at = $12
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
            completed_at
        )

        # Fetch and return updated mission
        row = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
        mission = dict(row)
        mission['waypoints'] = waypoints_data

        return mission


@router.delete("/{mission_id}", dependencies=[Depends(require_admin)])
async def delete_mission(mission_id: str, request: Request):
    """Delete a mission"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM missions WHERE id = $1", mission_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Mission not found")
        return {"ok": True}


@router.post("/{mission_id}/start", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def start_mission(mission_id: str, request: Request):
    """Start a mission (change status to active)"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        mission = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found")

        await conn.execute("""
            UPDATE missions SET status = 'active', started_at = NOW()
            WHERE id = $1
        """, mission_id)

        row = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
        result = dict(row)
        result['waypoints'] = json.loads(result['waypoints']) if isinstance(result['waypoints'], str) else result['waypoints']

        return result


@router.post("/{mission_id}/complete", response_model=MissionOut, dependencies=[Depends(require_admin)])
async def complete_mission(mission_id: str, request: Request):
    """Complete a mission (change status to completed)"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        mission = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found")

        await conn.execute("""
            UPDATE missions SET status = 'completed', completed_at = NOW()
            WHERE id = $1
        """, mission_id)

        row = await conn.fetchrow("SELECT * FROM missions WHERE id = $1", mission_id)
        result = dict(row)
        result['waypoints'] = json.loads(result['waypoints']) if isinstance(result['waypoints'], str) else result['waypoints']

        return result