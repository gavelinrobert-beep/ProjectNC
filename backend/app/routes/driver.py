"""
Driver mobile app endpoints for field operations.
Week 1 Commercial MVP - Sundsvall Transport Demo
"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

from ..database import get_pool
from .tracking import broadcast_location_update

router = APIRouter(prefix="/api/driver", tags=["driver"])


class DriverLoginRequest(BaseModel):
    """Driver PIN login request"""
    pin: str


class DriverLoginResponse(BaseModel):
    """Driver login response"""
    success: bool
    driver_id: Optional[str] = None
    driver_name: Optional[str] = None
    vehicle_id: Optional[str] = None
    vehicle_registration: Optional[str] = None
    message: Optional[str] = None


class LocationUpdate(BaseModel):
    """Driver GPS location update"""
    delivery_id: str
    lat: float
    lon: float
    speed: Optional[float] = None
    heading: Optional[float] = None
    accuracy: Optional[float] = None


class StatusUpdate(BaseModel):
    """Delivery status update from driver"""
    delivery_id: str
    status: str  # picked_up, in_transit, delivered
    signature_image: Optional[str] = None  # Base64 PNG
    delivered_to: Optional[str] = None
    photo_url: Optional[str] = None
    driver_notes: Optional[str] = None


@router.post("/login", response_model=DriverLoginResponse)
async def driver_login(payload: DriverLoginRequest, request: Request):
    """
    Simple PIN-based driver authentication for mobile app.
    For MVP: PIN = last 4 digits of vehicle registration (e.g., "0123" for ABC-123)
    
    Production: Should use proper JWT authentication with hashed PINs.
    """
    pool = await get_pool(request.app)
    
    # For demo: Match PIN to vehicle registration last 4 digits
    # Example: Vehicle "VEH-SND-01" -> PIN "0001"
    async with pool.acquire() as conn:
        # Try to find vehicle with registration ending in PIN
        vehicle = await conn.fetchrow(
            """
            SELECT a.id, a.registration, a.type, d.id as driver_id, d.first_name, d.last_name
            FROM assets a
            LEFT JOIN drivers d ON d.assigned_vehicle_id = a.id
            WHERE REPLACE(a.registration, ' ', '') LIKE '%' || REPLACE($1, ' ', '')
            AND d.employment_status = 'active'
            LIMIT 1
            """,
            payload.pin
        )
        
        if not vehicle:
            # Fallback: Try matching vehicle ID ending in PIN
            vehicle = await conn.fetchrow(
                """
                SELECT a.id, a.registration, a.type, d.id as driver_id, d.first_name, d.last_name
                FROM assets a
                LEFT JOIN drivers d ON d.assigned_vehicle_id = a.id
                WHERE REPLACE(a.id, ' ', '') LIKE '%' || REPLACE($1, ' ', '')
                AND d.employment_status = 'active'
                LIMIT 1
                """,
                payload.pin
            )
        
        if not vehicle or not vehicle['driver_id']:
            return DriverLoginResponse(
                success=False,
                message="Ogiltig PIN eller ingen förare tilldelad"  # Invalid PIN or no driver assigned
            )
        
        return DriverLoginResponse(
            success=True,
            driver_id=vehicle['driver_id'],
            driver_name=f"{vehicle['first_name']} {vehicle['last_name']}",
            vehicle_id=vehicle['id'],
            vehicle_registration=vehicle['registration'],
            message="Inloggning lyckades"  # Login successful
        )


@router.get("/deliveries/{vehicle_id}")
async def get_driver_deliveries(vehicle_id: str, request: Request):
    """
    Get today's deliveries for a specific vehicle/driver.
    Returns tasks assigned to this vehicle for today.
    """
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Get today's date range
        today = date.today()
        
        tasks = await conn.fetch(
            """
            SELECT 
                t.id,
                t.name,
                t.description,
                t.status,
                t.priority,
                t.waypoints,
                t.estimated_duration_minutes,
                t.estimated_distance_km,
                t.scheduled_start,
                t.scheduled_end,
                t.actual_start,
                t.actual_end,
                t.picked_up_at,
                t.delivered_at,
                t.signature_image,
                t.delivered_to,
                t.photo_url,
                t.driver_notes,
                t.created_at
            FROM tasks t
            WHERE t.assigned_vehicle_id = $1
            AND t.status IN ('planned', 'assigned', 'in_progress', 'picked_up', 'in_transit')
            AND (
                DATE(t.scheduled_start) = $2
                OR t.scheduled_start IS NULL
                OR t.status IN ('in_progress', 'picked_up', 'in_transit')
            )
            ORDER BY 
                CASE t.status
                    WHEN 'in_progress' THEN 1
                    WHEN 'in_transit' THEN 2
                    WHEN 'picked_up' THEN 3
                    WHEN 'assigned' THEN 4
                    WHEN 'planned' THEN 5
                    ELSE 6
                END,
                t.scheduled_start ASC NULLS LAST
            """,
            vehicle_id,
            today
        )
        
        import json
        deliveries = []
        for task in tasks:
            task_dict = dict(task)
            # Parse waypoints JSON
            if task_dict.get('waypoints'):
                task_dict['waypoints'] = json.loads(task_dict['waypoints']) if isinstance(task_dict['waypoints'], str) else task_dict['waypoints']
            deliveries.append(task_dict)
        
        return {
            "vehicle_id": vehicle_id,
            "date": today.isoformat(),
            "deliveries": deliveries,
            "total_count": len(deliveries)
        }


@router.post("/update-status")
async def update_delivery_status(payload: StatusUpdate, request: Request):
    """
    Update delivery status from driver app.
    Handles: picked_up, in_transit, delivered
    """
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Verify task exists
        task = await conn.fetchrow("SELECT id, status FROM tasks WHERE id = $1", payload.delivery_id)
        if not task:
            raise HTTPException(status_code=404, detail="Delivery not found")
        
        current_time = datetime.now()
        
        # Update based on status
        if payload.status == "picked_up":
            await conn.execute(
                """
                UPDATE tasks 
                SET status = 'picked_up',
                    picked_up_at = $2,
                    actual_start = COALESCE(actual_start, $2),
                    driver_notes = COALESCE($3, driver_notes),
                    updated_at = $2
                WHERE id = $1
                """,
                payload.delivery_id,
                current_time,
                payload.driver_notes
            )
            
        elif payload.status == "in_transit":
            await conn.execute(
                """
                UPDATE tasks 
                SET status = 'in_transit',
                    driver_notes = COALESCE($3, driver_notes),
                    updated_at = $2
                WHERE id = $1
                """,
                payload.delivery_id,
                current_time,
                payload.driver_notes
            )
            
        elif payload.status == "delivered":
            await conn.execute(
                """
                UPDATE tasks 
                SET status = 'completed',
                    delivered_at = $2,
                    actual_end = $2,
                    signature_image = $3,
                    delivered_to = $4,
                    photo_url = $5,
                    driver_notes = COALESCE($6, driver_notes),
                    updated_at = $2
                WHERE id = $1
                """,
                payload.delivery_id,
                current_time,
                payload.signature_image,
                payload.delivered_to,
                payload.photo_url,
                payload.driver_notes
            )
        else:
            raise HTTPException(status_code=400, detail=f"Invalid status: {payload.status}")
        
        # Broadcast status update to tracking subscribers
        await broadcast_location_update(payload.delivery_id, {
            'type': 'status_update',
            'status': payload.status,
            'timestamp': current_time.isoformat()
        })
        
        return {
            "success": True,
            "delivery_id": payload.delivery_id,
            "status": payload.status,
            "updated_at": current_time.isoformat(),
            "message": "Status uppdaterad"  # Status updated
        }


@router.post("/update-location")
async def update_driver_location(payload: LocationUpdate, request: Request):
    """
    Update driver GPS location.
    Called automatically every 30 seconds from driver app.
    Updates vehicle position and broadcasts to tracking subscribers.
    """
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Get task and vehicle info
        task = await conn.fetchrow(
            """
            SELECT t.id, t.assigned_vehicle_id, a.id as vehicle_id
            FROM tasks t
            LEFT JOIN assets a ON t.assigned_vehicle_id = a.id
            WHERE t.id = $1
            """,
            payload.delivery_id
        )
        
        if not task or not task['assigned_vehicle_id']:
            raise HTTPException(status_code=404, detail="Delivery or vehicle not found")
        
        # Update vehicle location
        await conn.execute(
            """
            UPDATE assets
            SET current_lat = $2,
                current_lon = $3,
                speed = $4,
                heading = $5,
                last_update = NOW()
            WHERE id = $1
            """,
            task['assigned_vehicle_id'],
            payload.lat,
            payload.lon,
            payload.speed,
            payload.heading
        )
        
        # Broadcast location update to tracking subscribers
        await broadcast_location_update(payload.delivery_id, {
            'type': 'location',
            'lat': payload.lat,
            'lon': payload.lon,
            'speed': payload.speed,
            'heading': payload.heading,
            'accuracy': payload.accuracy,
            'timestamp': datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "delivery_id": payload.delivery_id,
            "vehicle_id": task['assigned_vehicle_id'],
            "lat": payload.lat,
            "lon": payload.lon
        }
