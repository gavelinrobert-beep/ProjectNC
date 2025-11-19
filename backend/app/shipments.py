"""
Shipment/Package tracking routes for logistics operations.
Core functionality for DHL-style package management with tracking, status updates, and delivery confirmation.
"""
from fastapi import APIRouter, HTTPException, Depends, Request, UploadFile, File
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, date
import json
import random
import string

from ..models import ShipmentIn, ShipmentOut, ShipmentEvent, ProofOfDelivery, ShipmentItem
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])


def generate_tracking_number() -> str:
    """Generate a unique tracking number"""
    # Format: SYL + 10 random alphanumeric characters
    # Example: SYL-A7B9C2D4E6
    chars = string.ascii_uppercase + string.digits
    random_part = ''.join(random.choices(chars, k=10))
    return f"SYL-{random_part}"


@router.get("", response_model=List[ShipmentOut])
async def get_shipments(
        request: Request,
        status: Optional[str] = None,
        customer_id: Optional[str] = None,
        origin_facility_id: Optional[str] = None,
        destination_facility_id: Optional[str] = None,
        assigned_vehicle_id: Optional[str] = None,
        assigned_driver_id: Optional[str] = None,
        service_level: Optional[str] = None,
        priority: Optional[str] = None,
        tracking_number: Optional[str] = None,
        limit: int = 100
):
    """
    Get all shipments with extensive filtering options.

    - **status**: Filter by status (created, picked_up, in_transit, out_for_delivery, delivered, failed, cancelled)
    - **customer_id**: Filter by customer
    - **origin_facility_id**: Filter by origin facility
    - **destination_facility_id**: Filter by destination facility
    - **assigned_vehicle_id**: Filter by assigned vehicle
    - **assigned_driver_id**: Filter by assigned driver
    - **service_level**: Filter by service level (standard, express, same_day, economy)
    - **priority**: Filter by priority (low, normal, high, urgent)
    - **tracking_number**: Search by tracking number
    - **limit**: Maximum number of results (default: 100)
    """
    pool = await get_pool(request.app)

    query = "SELECT * FROM shipments WHERE 1=1"
    params = []

    if status:
        query += f" AND status = ${len(params) + 1}"
        params.append(status)

    if customer_id:
        query += f" AND customer_id = ${len(params) + 1}"
        params.append(customer_id)

    if origin_facility_id:
        query += f" AND origin_facility_id = ${len(params) + 1}"
        params.append(origin_facility_id)

    if destination_facility_id:
        query += f" AND destination_facility_id = ${len(params) + 1}"
        params.append(destination_facility_id)

    if assigned_vehicle_id:
        query += f" AND assigned_vehicle_id = ${len(params) + 1}"
        params.append(assigned_vehicle_id)

    if assigned_driver_id:
        query += f" AND assigned_driver_id = ${len(params) + 1}"
        params.append(assigned_driver_id)

    if service_level:
        query += f" AND service_level = ${len(params) + 1}"
        params.append(service_level)

    if priority:
        query += f" AND priority = ${len(params) + 1}"
        params.append(priority)

    if tracking_number:
        query += f" AND tracking_number = ${len(params) + 1}"
        params.append(tracking_number)

    query += f" ORDER BY created_at DESC LIMIT ${len(params) + 1}"
    params.append(limit)

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        shipments = []
        for row in rows:
            shipment = dict(row)
            # Parse JSON fields
            if shipment.get('items'):
                shipment['items'] = json.loads(shipment['items']) if isinstance(shipment['items'], str) else shipment[
                    'items']
            shipments.append(shipment)
        return shipments


@router.get("/tracking/{tracking_number}", response_model=ShipmentOut)
async def track_shipment(tracking_number: str, request: Request):
    """
    Track a shipment by tracking number (public endpoint).
    This is what customers use to track their packages.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM shipments WHERE tracking_number = $1",
            tracking_number
        )
        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")

        shipment = dict(row)
        if shipment.get('items'):
            shipment['items'] = json.loads(shipment['items']) if isinstance(shipment['items'], str) else shipment[
                'items']

        return shipment


@router.get("/{shipment_id}", response_model=ShipmentOut)
async def get_shipment(shipment_id: str, request: Request):
    """Get a specific shipment by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM shipments WHERE id = $1",
            shipment_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")

        shipment = dict(row)
        if shipment.get('items'):
            shipment['items'] = json.loads(shipment['items']) if isinstance(shipment['items'], str) else shipment[
                'items']

        return shipment


@router.post("", response_model=ShipmentOut, dependencies=[Depends(require_admin)])
async def create_shipment(shipment: ShipmentIn, request: Request):
    """
    Create a new shipment.
    Automatically generates tracking number if not provided.
    Requires admin role.
    """
    pool = await get_pool(request.app)
    shipment_id = shipment.id or str(uuid4())
    tracking_number = shipment.tracking_number or generate_tracking_number()

    async with pool.acquire() as conn:
        # Verify customer exists
        customer = await conn.fetchrow("SELECT id FROM customers WHERE id = $1", shipment.customer_id)
        if not customer:
            raise HTTPException(status_code=404, detail=f"Customer {shipment.customer_id} not found")

        # Verify origin facility exists
        origin = await conn.fetchrow("SELECT id FROM facilities WHERE id = $1", shipment.origin_facility_id)
        if not origin:
            raise HTTPException(status_code=404, detail=f"Origin facility {shipment.origin_facility_id} not found")

        try:
            # Convert items to JSON
            items_json = json.dumps([item.dict() for item in shipment.items])

            row = await conn.fetchrow("""
                INSERT INTO shipments (
                    id, tracking_number, customer_id, customer_reference,
                    origin_facility_id, destination_facility_id, destination_customer_id,
                    delivery_address, delivery_lat, delivery_lon,
                    items, total_weight_kg, total_volume_m3,
                    service_level, requested_pickup_date, requested_delivery_date, delivery_time_window,
                    status, priority,
                    assigned_vehicle_id, assigned_driver_id, assigned_task_id,
                    requires_signature, requires_photo_proof, special_instructions,
                    estimated_cost, currency, notes
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28)
                RETURNING *
            """,
                                      shipment_id, tracking_number, shipment.customer_id, shipment.customer_reference,
                                      shipment.origin_facility_id, shipment.destination_facility_id,
                                      shipment.destination_customer_id,
                                      shipment.delivery_address, shipment.delivery_lat, shipment.delivery_lon,
                                      items_json, shipment.total_weight_kg, shipment.total_volume_m3,
                                      shipment.service_level, shipment.requested_pickup_date,
                                      shipment.requested_delivery_date, shipment.delivery_time_window,
                                      shipment.status, shipment.priority,
                                      shipment.assigned_vehicle_id, shipment.assigned_driver_id,
                                      shipment.assigned_task_id,
                                      shipment.requires_signature, shipment.requires_photo_proof,
                                      shipment.special_instructions,
                                      shipment.estimated_cost, shipment.currency, shipment.notes
                                      )

            # Create initial shipment event
            await conn.execute("""
                INSERT INTO shipment_events (shipment_id, event_type, status, location_facility_id, notes)
                VALUES ($1, 'created', 'created', $2, 'Shipment created')
            """, shipment_id, shipment.origin_facility_id)

            result = dict(row)
            result['items'] = json.loads(items_json)
            return result

        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create shipment: {str(e)}")


@router.put("/{shipment_id}", response_model=ShipmentOut, dependencies=[Depends(require_admin)])
async def update_shipment(shipment_id: str, shipment: ShipmentIn, request: Request):
    """
    Update an existing shipment.
    Requires admin role.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        items_json = json.dumps([item.dict() for item in shipment.items])

        row = await conn.fetchrow("""
            UPDATE shipments SET
                customer_id = $2,
                customer_reference = $3,
                origin_facility_id = $4,
                destination_facility_id = $5,
                destination_customer_id = $6,
                delivery_address = $7,
                delivery_lat = $8,
                delivery_lon = $9,
                items = $10,
                total_weight_kg = $11,
                total_volume_m3 = $12,
                service_level = $13,
                requested_pickup_date = $14,
                requested_delivery_date = $15,
                delivery_time_window = $16,
                status = $17,
                priority = $18,
                assigned_vehicle_id = $19,
                assigned_driver_id = $20,
                assigned_task_id = $21,
                requires_signature = $22,
                requires_photo_proof = $23,
                special_instructions = $24,
                estimated_cost = $25,
                currency = $26,
                notes = $27,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """,
                                  shipment_id,
                                  shipment.customer_id, shipment.customer_reference,
                                  shipment.origin_facility_id, shipment.destination_facility_id,
                                  shipment.destination_customer_id,
                                  shipment.delivery_address, shipment.delivery_lat, shipment.delivery_lon,
                                  items_json, shipment.total_weight_kg, shipment.total_volume_m3,
                                  shipment.service_level, shipment.requested_pickup_date,
                                  shipment.requested_delivery_date, shipment.delivery_time_window,
                                  shipment.status, shipment.priority,
                                  shipment.assigned_vehicle_id, shipment.assigned_driver_id, shipment.assigned_task_id,
                                  shipment.requires_signature, shipment.requires_photo_proof,
                                  shipment.special_instructions,
                                  shipment.estimated_cost, shipment.currency, shipment.notes
                                  )
        if not row:
            raise HTTPException(status_code=404, detail="Shipment not found")

        result = dict(row)
        result['items'] = json.loads(items_json)
        return result


@router.delete("/{shipment_id}", dependencies=[Depends(require_admin)])
async def cancel_shipment(shipment_id: str, request: Request):
    """
    Cancel a shipment (sets status to cancelled).
    Requires admin role.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if shipment can be cancelled
        shipment = await conn.fetchrow("SELECT status FROM shipments WHERE id = $1", shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        if shipment['status'] in ['delivered', 'cancelled']:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot cancel shipment with status '{shipment['status']}'"
            )

        # Cancel shipment
        await conn.execute(
            "UPDATE shipments SET status = 'cancelled', updated_at = NOW() WHERE id = $1",
            shipment_id
        )

        # Create cancellation event
        await conn.execute("""
            INSERT INTO shipment_events (shipment_id, event_type, status, notes)
            VALUES ($1, 'exception', 'cancelled', 'Shipment cancelled')
        """, shipment_id)

        return {"ok": True, "message": "Shipment cancelled"}


# ============================================================================
# STATUS UPDATES & TRACKING EVENTS
# ============================================================================

@router.post("/{shipment_id}/status")
async def update_shipment_status(
        shipment_id: str,
        request: Request,
        new_status: str,
        notes: Optional[str] = None,
        location_facility_id: Optional[str] = None,
        location_lat: Optional[float] = None,
        location_lon: Optional[float] = None
):
    """
    Update shipment status and create tracking event.

    Valid statuses: created, picked_up, in_transit, out_for_delivery, delivered, failed, cancelled, returned
    """
    valid_statuses = ['created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled',
                      'returned']
    if new_status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {', '.join(valid_statuses)}")

    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Get current shipment info
        shipment = await conn.fetchrow("SELECT * FROM shipments WHERE id = $1", shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        # Update timestamps based on status
        timestamp_updates = {}
        if new_status == 'picked_up' and not shipment['actual_pickup_time']:
            timestamp_updates['actual_pickup_time'] = datetime.utcnow()
        elif new_status == 'delivered' and not shipment['actual_delivery_time']:
            timestamp_updates['actual_delivery_time'] = datetime.utcnow()
        elif new_status == 'out_for_delivery':
            # Increment delivery attempts
            timestamp_updates['delivery_attempts'] = (shipment['delivery_attempts'] or 0) + 1

        # Build update query
        update_parts = ["status = $2", "updated_at = NOW()"]
        params = [shipment_id, new_status]

        if 'actual_pickup_time' in timestamp_updates:
            update_parts.append(f"actual_pickup_time = ${len(params) + 1}")
            params.append(timestamp_updates['actual_pickup_time'])

        if 'actual_delivery_time' in timestamp_updates:
            update_parts.append(f"actual_delivery_time = ${len(params) + 1}")
            params.append(timestamp_updates['actual_delivery_time'])

        if 'delivery_attempts' in timestamp_updates:
            update_parts.append(f"delivery_attempts = ${len(params) + 1}")
            params.append(timestamp_updates['delivery_attempts'])

        update_query = f"UPDATE shipments SET {', '.join(update_parts)} WHERE id = $1"
        await conn.execute(update_query, *params)

        # Determine event type
        event_type_map = {
            'picked_up': 'picked_up',
            'in_transit': 'in_transit',
            'out_for_delivery': 'out_for_delivery',
            'delivered': 'delivered',
            'failed': 'exception',
            'cancelled': 'exception',
            'returned': 'exception'
        }
        event_type = event_type_map.get(new_status, 'in_transit')

        # Create tracking event
        await conn.execute("""
            INSERT INTO shipment_events (
                shipment_id, event_type, status,
                location_facility_id, location_lat, location_lon,
                vehicle_id, driver_id, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """,
                           shipment_id, event_type, new_status,
                           location_facility_id, location_lat, location_lon,
                           shipment['assigned_vehicle_id'], shipment['assigned_driver_id'],
                           notes or f"Status updated to {new_status}"
                           )

        return {
            "ok": True,
            "shipment_id": shipment_id,
            "tracking_number": shipment['tracking_number'],
            "old_status": shipment['status'],
            "new_status": new_status,
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/{shipment_id}/events", response_model=List[dict])
async def get_shipment_events(shipment_id: str, request: Request):
    """
    Get complete tracking history for a shipment.
    Shows all status changes, location updates, and events.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Verify shipment exists
        shipment = await conn.fetchrow("SELECT tracking_number FROM shipments WHERE id = $1", shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        # Get all events
        rows = await conn.fetch("""
            SELECT * FROM shipment_events
            WHERE shipment_id = $1
            ORDER BY timestamp ASC
        """, shipment_id)

        events = [dict(row) for row in rows]

        return {
            "shipment_id": shipment_id,
            "tracking_number": shipment['tracking_number'],
            "events": events
        }


@router.get("/tracking/{tracking_number}/events", response_model=List[dict])
async def get_shipment_events_by_tracking(tracking_number: str, request: Request):
    """
    Get tracking history by tracking number (public endpoint).
    This is what customers use to see their shipment's journey.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Get shipment ID from tracking number
        shipment = await conn.fetchrow(
            "SELECT id FROM shipments WHERE tracking_number = $1",
            tracking_number
        )
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        # Get all events
        rows = await conn.fetch("""
            SELECT 
                event_type, status, timestamp, notes,
                location_lat, location_lon
            FROM shipment_events
            WHERE shipment_id = $1
            ORDER BY timestamp ASC
        """, shipment['id'])

        events = [dict(row) for row in rows]

        return {
            "tracking_number": tracking_number,
            "events": events
        }


# ============================================================================
# ASSIGNMENT & ROUTING
# ============================================================================

@router.post("/{shipment_id}/assign/vehicle")
async def assign_vehicle_to_shipment(
        shipment_id: str,
        vehicle_id: str,
        request: Request
):
    """
    Assign a vehicle to a shipment for delivery.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        shipment = await conn.fetchrow("SELECT * FROM shipments WHERE id = $1", shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        vehicle = await conn.fetchrow("SELECT * FROM assets WHERE id = $1", vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Update shipment
        await conn.execute(
            "UPDATE shipments SET assigned_vehicle_id = $2, updated_at = NOW() WHERE id = $1",
            shipment_id, vehicle_id
        )

        # If vehicle has a driver, assign driver too
        if vehicle['current_driver_id']:
            await conn.execute(
                "UPDATE shipments SET assigned_driver_id = $2, updated_at = NOW() WHERE id = $1",
                shipment_id, vehicle['current_driver_id']
            )

        return {
            "ok": True,
            "message": f"Vehicle {vehicle_id} assigned to shipment {shipment_id}",
            "driver_also_assigned": bool(vehicle['current_driver_id'])
        }


@router.post("/{shipment_id}/assign/driver")
async def assign_driver_to_shipment(
        shipment_id: str,
        driver_id: str,
        request: Request
):
    """
    Assign a driver to a shipment for delivery.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        shipment = await conn.fetchrow("SELECT * FROM shipments WHERE id = $1", shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        driver = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        await conn.execute(
            "UPDATE shipments SET assigned_driver_id = $2, updated_at = NOW() WHERE id = $1",
            shipment_id, driver_id
        )

        return {
            "ok": True,
            "message": f"Driver {driver['first_name']} {driver['last_name']} assigned to shipment {shipment_id}"
        }


# ============================================================================
# PROOF OF DELIVERY
# ============================================================================

@router.post("/{shipment_id}/deliver")
async def mark_shipment_delivered(
        shipment_id: str,
        request: Request,
        recipient_name: Optional[str] = None,
        delivery_lat: float = None,
        delivery_lon: float = None,
        notes: Optional[str] = None
):
    """
    Mark a shipment as delivered.
    Records delivery time, location, and recipient information.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        shipment = await conn.fetchrow("SELECT * FROM shipments WHERE id = $1", shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        if shipment['status'] == 'delivered':
            raise HTTPException(status_code=400, detail="Shipment already delivered")

        if not shipment['assigned_driver_id']:
            raise HTTPException(status_code=400, detail="Cannot mark as delivered: No driver assigned")

        # Use provided coordinates or shipment's delivery address coordinates
        final_lat = delivery_lat or shipment['delivery_lat']
        final_lon = delivery_lon or shipment['delivery_lon']

        if not final_lat or not final_lon:
            raise HTTPException(
                status_code=400,
                detail="Delivery coordinates required (either in shipment or provided)"
            )

        delivery_time = datetime.utcnow()

        # Update shipment status
        await conn.execute("""
            UPDATE shipments SET
                status = 'delivered',
                actual_delivery_time = $2,
                updated_at = NOW()
            WHERE id = $1
        """, shipment_id, delivery_time)

        # Create delivery event
        await conn.execute("""
            INSERT INTO shipment_events (
                shipment_id, event_type, status,
                location_lat, location_lon,
                vehicle_id, driver_id, notes
            )
            VALUES ($1, 'delivered', 'delivered', $2, $3, $4, $5, $6)
        """,
                           shipment_id, final_lat, final_lon,
                           shipment['assigned_vehicle_id'], shipment['assigned_driver_id'],
                           notes or f"Delivered to {recipient_name}" if recipient_name else "Delivered"
                           )

        # Create proof of delivery record
        await conn.execute("""
            INSERT INTO proof_of_delivery (
                shipment_id, delivered_at, delivered_by_driver_id,
                delivery_lat, delivery_lon, recipient_name, notes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
        """,
                           shipment_id, delivery_time, shipment['assigned_driver_id'],
                           final_lat, final_lon, recipient_name, notes
                           )

        return {
            "ok": True,
            "message": "Shipment marked as delivered",
            "shipment_id": shipment_id,
            "tracking_number": shipment['tracking_number'],
            "delivered_at": delivery_time.isoformat(),
            "recipient": recipient_name
        }


@router.get("/{shipment_id}/proof-of-delivery")
async def get_proof_of_delivery(shipment_id: str, request: Request):
    """
    Get proof of delivery for a shipment.
    Includes delivery time, location, recipient, signature, and photos.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        pod = await conn.fetchrow(
            "SELECT * FROM proof_of_delivery WHERE shipment_id = $1",
            shipment_id
        )
        if not pod:
            raise HTTPException(status_code=404, detail="Proof of delivery not found")

        result = dict(pod)

        # Parse photo URLs if JSON
        if result.get('photo_urls'):
            result['photo_urls'] = json.loads(result['photo_urls']) if isinstance(result['photo_urls'], str) else \
            result['photo_urls']

        return result


@router.post("/{shipment_id}/proof-of-delivery/signature")
async def upload_delivery_signature(
        shipment_id: str,
        request: Request,
        signature_data: str  # Base64 encoded image
):
    """
    Upload delivery signature (base64 encoded image).
    In production, you'd upload to S3/Azure Blob Storage and store the URL.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if POD exists
        pod = await conn.fetchrow(
            "SELECT id FROM proof_of_delivery WHERE shipment_id = $1",
            shipment_id
        )
        if not pod:
            raise HTTPException(
                status_code=404,
                detail="Proof of delivery not found. Mark shipment as delivered first."
            )

        # In production: Upload signature_data to cloud storage and get URL
        # For now, we'll store a placeholder
        signature_url = f"data:image/png;base64,{signature_data[:50]}..."  # Placeholder

        await conn.execute(
            "UPDATE proof_of_delivery SET signature_image_url = $2 WHERE shipment_id = $1",
            shipment_id, signature_url
        )

        return {
            "ok": True,
            "message": "Signature uploaded",
            "signature_url": signature_url
        }


@router.post("/{shipment_id}/proof-of-delivery/photos")
async def upload_delivery_photos(
        shipment_id: str,
        request: Request,
        photo_urls: List[str]  # List of base64 or URLs
):
    """
    Upload delivery photos.
    In production, you'd upload to S3/Azure Blob Storage and store URLs.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if POD exists
        pod = await conn.fetchrow(
            "SELECT id, photo_urls FROM proof_of_delivery WHERE shipment_id = $1",
            shipment_id
        )
        if not pod:
            raise HTTPException(
                status_code=404,
                detail="Proof of delivery not found. Mark shipment as delivered first."
            )

        # Merge with existing photos
        existing_photos = json.loads(pod['photo_urls']) if pod['photo_urls'] else []
        all_photos = existing_photos + photo_urls

        await conn.execute(
            "UPDATE proof_of_delivery SET photo_urls = $2 WHERE shipment_id = $1",
            shipment_id, json.dumps(all_photos)
        )

        return {
            "ok": True,
            "message": f"{len(photo_urls)} photo(s) uploaded",
            "total_photos": len(all_photos)
        }


# ============================================================================
# DELIVERY FAILURES & EXCEPTIONS
# ============================================================================

@router.post("/{shipment_id}/delivery-failed")
async def mark_delivery_failed(
        shipment_id: str,
        request: Request,
        reason: str,
        retry: bool = True,
        notes: Optional[str] = None
):
    """
    Mark a delivery attempt as failed.

    - **reason**: Reason for failure (customer_not_home, address_incorrect, access_denied, etc.)
    - **retry**: Whether to retry delivery (default: true)
    - **notes**: Additional notes about the failure
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        shipment = await conn.fetchrow("SELECT * FROM shipments WHERE id = $1", shipment_id)
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")

        # Increment delivery attempts
        new_attempts = (shipment['delivery_attempts'] or 0) + 1

        # Determine new status
        new_status = 'out_for_delivery' if retry else 'failed'

        await conn.execute("""
            UPDATE shipments SET
                status = $2,
                delivery_attempts = $3,
                updated_at = NOW()
            WHERE id = $1
        """, shipment_id, new_status, new_attempts)

        # Create exception event
        await conn.execute("""
            INSERT INTO shipment_events (
                shipment_id, event_type, status,
                vehicle_id, driver_id, notes
            )
            VALUES ($1, 'delivery_attempted', $2, $3, $4, $5)
        """,
                           shipment_id, new_status,
                           shipment['assigned_vehicle_id'], shipment['assigned_driver_id'],
                           f"Delivery failed: {reason}. {notes or ''}"
                           )

        return {
            "ok": True,
            "message": "Delivery failure recorded",
            "shipment_id": shipment_id,
            "tracking_number": shipment['tracking_number'],
            "reason": reason,
            "delivery_attempts": new_attempts,
            "will_retry": retry
        }


# ============================================================================
# ANALYTICS & REPORTING
# ============================================================================

@router.get("/stats/overview")
async def get_shipments_overview(request: Request):
    """
    Get overall shipment statistics.
    Shows counts by status, service level, etc.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        stats = {}

        # Total shipments
        stats['total'] = await conn.fetchval("SELECT COUNT(*) FROM shipments") or 0

        # By status
        status_rows = await conn.fetch("""
            SELECT status, COUNT(*) as count
            FROM shipments
            GROUP BY status
        """)
        stats['by_status'] = {row['status']: row['count'] for row in status_rows}

        # By service level
        service_rows = await conn.fetch("""
            SELECT service_level, COUNT(*) as count
            FROM shipments
            GROUP BY service_level
        """)
        stats['by_service_level'] = {row['service_level']: row['count'] for row in service_rows}

        # By priority
        priority_rows = await conn.fetch("""
            SELECT priority, COUNT(*) as count
            FROM shipments
            GROUP BY priority
        """)
        stats['by_priority'] = {row['priority']: row['count'] for row in priority_rows}

        # In transit
        stats['in_transit'] = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments 
            WHERE status IN ('picked_up', 'in_transit', 'out_for_delivery')
        """) or 0

        # Delivered today
        stats['delivered_today'] = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments 
            WHERE status = 'delivered' 
            AND DATE(actual_delivery_time) = CURRENT_DATE
        """) or 0

        # Failed deliveries
        stats['failed'] = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments WHERE status = 'failed'
        """) or 0

        return stats


@router.get("/stats/performance")
async def get_shipment_performance(request: Request, days: int = 30):
    """
    Get shipment performance metrics.
    Shows delivery success rate, average delivery time, etc.

    - **days**: Number of days to analyze (default: 30)
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        since_date = date.today() - timedelta(days=days)

        # Total shipments in period
        total = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments WHERE created_at >= $1
        """, since_date) or 0

        # Delivered shipments
        delivered = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments 
            WHERE status = 'delivered' AND created_at >= $1
        """, since_date) or 0

        # Failed deliveries
        failed = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments 
            WHERE status = 'failed' AND created_at >= $1
        """, since_date) or 0

        # Average delivery time (hours)
        avg_delivery_hours = await conn.fetchval("""
            SELECT AVG(EXTRACT(EPOCH FROM (actual_delivery_time - created_at)) / 3600)
            FROM shipments
            WHERE status = 'delivered' 
            AND actual_delivery_time IS NOT NULL
            AND created_at >= $1
        """, since_date)

        # On-time delivery rate (delivered within requested date)
        on_time = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments
            WHERE status = 'delivered'
            AND requested_delivery_date IS NOT NULL
            AND DATE(actual_delivery_time) <= requested_delivery_date
            AND created_at >= $1
        """, since_date) or 0

        # First attempt success rate
        first_attempt_success = await conn.fetchval("""
            SELECT COUNT(*) FROM shipments
            WHERE status = 'delivered'
            AND delivery_attempts <= 1
            AND created_at >= $1
        """, since_date) or 0

        return {
            "period_days": days,
            "total_shipments": total,
            "delivered": delivered,
            "failed": failed,
            "in_progress": total - delivered - failed,
            "delivery_success_rate": round((delivered / total * 100) if total > 0 else 0, 2),
            "average_delivery_hours": round(float(avg_delivery_hours), 2) if avg_delivery_hours else None,
            "on_time_deliveries": on_time,
            "on_time_rate": round((on_time / delivered * 100) if delivered > 0 else 0, 2),
            "first_attempt_success": first_attempt_success,
            "first_attempt_success_rate": round((first_attempt_success / delivered * 100) if delivered > 0 else 0, 2)
        }