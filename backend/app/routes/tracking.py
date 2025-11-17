"""
Public tracking endpoints for customer delivery tracking (no auth required).
Week 1 Commercial MVP - Sundsvall Transport Demo
"""
import asyncio
import json
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime

from ..database import get_pool

router = APIRouter(prefix="/track", tags=["tracking"])

# Store for location updates (delivery_id -> Queue)
LOCATION_SUBS = {}


@router.get("/{delivery_id}")
async def get_delivery_tracking(delivery_id: str, request: Request):
    """
    Public tracking endpoint - returns delivery details without authentication.
    Used by customers to track their deliveries.
    """
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Get task/delivery details
        task = await conn.fetchrow(
            """
            SELECT 
                t.*,
                a.type as vehicle_type,
                a.registration as vehicle_registration,
                a.current_lat as vehicle_lat,
                a.current_lon as vehicle_lon,
                d.first_name as driver_first_name,
                d.last_name as driver_last_name
            FROM tasks t
            LEFT JOIN assets a ON t.assigned_vehicle_id = a.id
            LEFT JOIN drivers d ON t.assigned_driver_id = d.id
            WHERE t.id = $1
            """,
            delivery_id
        )
        
        if not task:
            raise HTTPException(status_code=404, detail="Delivery not found")
        
        task_dict = dict(task)
        
        # Parse JSON fields
        if task_dict.get('waypoints'):
            task_dict['waypoints'] = json.loads(task_dict['waypoints']) if isinstance(task_dict['waypoints'], str) else task_dict['waypoints']
        if task_dict.get('shipment_ids'):
            task_dict['shipment_ids'] = json.loads(task_dict['shipment_ids']) if isinstance(task_dict['shipment_ids'], str) else task_dict['shipment_ids']
        
        # Format response for customer tracking
        return {
            "id": task_dict['id'],
            "status": task_dict['status'],
            "name": task_dict['name'],
            "description": task_dict.get('description'),
            "waypoints": task_dict.get('waypoints', []),
            "estimated_duration_minutes": task_dict.get('estimated_duration_minutes'),
            "scheduled_start": task_dict.get('scheduled_start'),
            "scheduled_end": task_dict.get('scheduled_end'),
            "actual_start": task_dict.get('actual_start'),
            "actual_end": task_dict.get('actual_end'),
            "picked_up_at": task_dict.get('picked_up_at'),
            "delivered_at": task_dict.get('delivered_at'),
            "signature_image": task_dict.get('signature_image'),
            "delivered_to": task_dict.get('delivered_to'),
            "photo_url": task_dict.get('photo_url'),
            "driver_notes": task_dict.get('driver_notes'),
            "vehicle": {
                "type": task_dict.get('vehicle_type'),
                "registration": task_dict.get('vehicle_registration'),
                "current_lat": task_dict.get('vehicle_lat'),
                "current_lon": task_dict.get('vehicle_lon')
            } if task_dict.get('vehicle_registration') else None,
            "driver": {
                "first_name": task_dict.get('driver_first_name'),
                "last_name": task_dict.get('driver_last_name')
            } if task_dict.get('driver_first_name') else None,
            "created_at": task_dict.get('created_at'),
            "updated_at": task_dict.get('updated_at')
        }


@router.get("/{delivery_id}/live")
async def stream_delivery_location(delivery_id: str, request: Request):
    """
    Server-Sent Events endpoint for real-time driver location updates.
    Used by customer tracking page to show live driver position.
    """
    pool = await get_pool(request.app)
    
    # Verify delivery exists
    async with pool.acquire() as conn:
        task = await conn.fetchrow("SELECT id FROM tasks WHERE id = $1", delivery_id)
        if not task:
            raise HTTPException(status_code=404, detail="Delivery not found")
    
    async def generate():
        # Create a queue for this delivery
        q = asyncio.Queue(maxsize=10)
        if delivery_id not in LOCATION_SUBS:
            LOCATION_SUBS[delivery_id] = []
        LOCATION_SUBS[delivery_id].append(q)
        
        try:
            # Send initial connection confirmation
            yield f"data: {json.dumps({'type': 'connected', 'delivery_id': delivery_id})}\n\n"
            
            # Send periodic updates
            while True:
                # Poll for location updates every 5 seconds if no data
                try:
                    data = await asyncio.wait_for(q.get(), timeout=5.0)
                    yield f"data: {json.dumps(data)}\n\n"
                except asyncio.TimeoutError:
                    # Send heartbeat to keep connection alive
                    async with pool.acquire() as conn:
                        vehicle = await conn.fetchrow(
                            """
                            SELECT a.current_lat, a.current_lon, a.speed, a.heading, t.status
                            FROM tasks t
                            LEFT JOIN assets a ON t.assigned_vehicle_id = a.id
                            WHERE t.id = $1
                            """,
                            delivery_id
                        )
                        if vehicle:
                            yield f"data: {json.dumps({
                                'type': 'location',
                                'lat': vehicle['current_lat'],
                                'lon': vehicle['current_lon'],
                                'speed': vehicle.get('speed'),
                                'heading': vehicle.get('heading'),
                                'status': vehicle['status'],
                                'timestamp': datetime.now().isoformat()
                            })}\n\n"
        except Exception as e:
            print(f"[TRACKING] Stream error for {delivery_id}: {e}")
        finally:
            try:
                if delivery_id in LOCATION_SUBS:
                    LOCATION_SUBS[delivery_id].remove(q)
                    if not LOCATION_SUBS[delivery_id]:
                        del LOCATION_SUBS[delivery_id]
            except (ValueError, KeyError):
                pass
    
    return StreamingResponse(generate(), media_type="text/event-stream")


async def broadcast_location_update(delivery_id: str, location_data: dict):
    """
    Helper function to broadcast location updates to all subscribers.
    Called by driver location update endpoint.
    """
    if delivery_id in LOCATION_SUBS:
        for q in LOCATION_SUBS[delivery_id]:
            try:
                q.put_nowait(location_data)
            except asyncio.QueueFull:
                pass  # Skip if queue is full
