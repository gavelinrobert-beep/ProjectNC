"""
Customer/Client management routes for logistics operations.
Handles business customers, municipalities, and individual clients.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
import json
from datetime import datetime

from ..models import CustomerIn, CustomerOut
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="/api/customers", tags=["Customers"])


@router.get("", response_model=List[CustomerOut])
async def get_customers(
        request: Request,
        active_only: bool = True,
        customer_type: Optional[str] = None,
        search: Optional[str] = None
):
    """
    Get all customers with optional filtering.

    - **active_only**: Only return active customers (default: true)
    - **customer_type**: Filter by type (business, individual, government, municipality)
    - **search**: Search by name, organization number, or postal code
    """
    pool = await get_pool(request.app)

    query = "SELECT * FROM customers WHERE 1=1"
    params = []

    if active_only:
        query += f" AND active = ${len(params) + 1}"
        params.append(True)

    if customer_type:
        query += f" AND customer_type = ${len(params) + 1}"
        params.append(customer_type)

    if search:
        query += f" AND (name ILIKE ${len(params) + 1} OR organization_number ILIKE ${len(params) + 1} OR address_postal_code ILIKE ${len(params) + 1})"
        params.append(f"%{search}%")

    query += " ORDER BY name"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        customers = [dict(row) for row in rows]
        return customers


@router.get("/{customer_id}", response_model=CustomerOut)
async def get_customer(customer_id: str, request: Request):
    """Get a specific customer by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM customers WHERE id = $1",
            customer_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        return dict(row)


@router.post("", response_model=CustomerOut, dependencies=[Depends(require_admin)])
async def create_customer(customer: CustomerIn, request: Request):
    """
    Create a new customer.
    Requires admin role.
    """
    pool = await get_pool(request.app)
    customer_id = customer.id or str(uuid4())

    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow("""
                INSERT INTO customers (
                    id, name, customer_type, contact_name, contact_phone, contact_email,
                    address_street, address_city, address_postal_code, address_country,
                    delivery_lat, delivery_lon, organization_number, billing_account,
                    service_level, access_instructions, preferred_delivery_window,
                    notes, active
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
                RETURNING *
            """,
                                      customer_id,
                                      customer.name,
                                      customer.customer_type,
                                      customer.contact_name,
                                      customer.contact_phone,
                                      customer.contact_email,
                                      customer.address_street,
                                      customer.address_city,
                                      customer.address_postal_code,
                                      customer.address_country,
                                      customer.delivery_lat,
                                      customer.delivery_lon,
                                      customer.organization_number,
                                      customer.billing_account,
                                      customer.service_level,
                                      customer.access_instructions,
                                      customer.preferred_delivery_window,
                                      customer.notes,
                                      customer.active
                                      )
            return dict(row)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create customer: {str(e)}")


@router.put("/{customer_id}", response_model=CustomerOut, dependencies=[Depends(require_admin)])
async def update_customer(customer_id: str, customer: CustomerIn, request: Request):
    """
    Update an existing customer.
    Requires admin role.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE customers SET
                name = $2,
                customer_type = $3,
                contact_name = $4,
                contact_phone = $5,
                contact_email = $6,
                address_street = $7,
                address_city = $8,
                address_postal_code = $9,
                address_country = $10,
                delivery_lat = $11,
                delivery_lon = $12,
                organization_number = $13,
                billing_account = $14,
                service_level = $15,
                access_instructions = $16,
                preferred_delivery_window = $17,
                notes = $18,
                active = $19,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """,
                                  customer_id,
                                  customer.name,
                                  customer.customer_type,
                                  customer.contact_name,
                                  customer.contact_phone,
                                  customer.contact_email,
                                  customer.address_street,
                                  customer.address_city,
                                  customer.address_postal_code,
                                  customer.address_country,
                                  customer.delivery_lat,
                                  customer.delivery_lon,
                                  customer.organization_number,
                                  customer.billing_account,
                                  customer.service_level,
                                  customer.access_instructions,
                                  customer.preferred_delivery_window,
                                  customer.notes,
                                  customer.active
                                  )
        if not row:
            raise HTTPException(status_code=404, detail="Customer not found")
        return dict(row)


@router.delete("/{customer_id}", dependencies=[Depends(require_admin)])
async def delete_customer(customer_id: str, request: Request):
    """
    Delete a customer (soft delete - sets active=false).
    Requires admin role.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Soft delete by setting active=false
        result = await conn.execute(
            "UPDATE customers SET active = false, updated_at = NOW() WHERE id = $1",
            customer_id
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Customer not found")
        return {"ok": True, "message": "Customer deactivated"}


@router.get("/{customer_id}/shipments", response_model=List[dict])
async def get_customer_shipments(
        customer_id: str,
        request: Request,
        status: Optional[str] = None
):
    """
    Get all shipments for a specific customer.

    - **status**: Filter by shipment status
    """
    pool = await get_pool(request.app)

    query = "SELECT * FROM shipments WHERE customer_id = $1"
    params = [customer_id]

    if status:
        query += f" AND status = ${len(params) + 1}"
        params.append(status)

    query += " ORDER BY created_at DESC"

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


@router.get("/{customer_id}/stats")
async def get_customer_stats(customer_id: str, request: Request):
    """
    Get statistics for a specific customer.
    Returns shipment counts, delivery success rate, etc.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        stats = {}

        # Total shipments
        stats['total_shipments'] = await conn.fetchval(
            "SELECT COUNT(*) FROM shipments WHERE customer_id = $1",
            customer_id
        )

        # Shipments by status
        status_rows = await conn.fetch("""
            SELECT status, COUNT(*) as count
            FROM shipments
            WHERE customer_id = $1
            GROUP BY status
        """, customer_id)
        stats['by_status'] = {row['status']: row['count'] for row in status_rows}

        # Delivery success rate
        delivered = await conn.fetchval(
            "SELECT COUNT(*) FROM shipments WHERE customer_id = $1 AND status = 'delivered'",
            customer_id
        ) or 0
        total = stats['total_shipments']
        stats['delivery_success_rate'] = (delivered / total * 100) if total > 0 else 0

        # Average delivery time (for completed shipments)
        avg_time = await conn.fetchval("""
            SELECT AVG(EXTRACT(EPOCH FROM (actual_delivery_time - created_at)) / 3600)
            FROM shipments
            WHERE customer_id = $1 AND status = 'delivered' AND actual_delivery_time IS NOT NULL
        """, customer_id)
        stats['avg_delivery_hours'] = round(float(avg_time), 2) if avg_time else None

        return stats


@router.post("/{customer_id}/geocode", dependencies=[Depends(require_admin)])
async def geocode_customer_address(customer_id: str, request: Request):
    """
    Geocode customer's address to get lat/lon coordinates.
    This would integrate with a geocoding service (Google Maps, HERE, etc.)
    For now, returns a placeholder.
    """
    # TODO: Integrate with actual geocoding service
    # Example: Google Maps Geocoding API, Mapbox Geocoding, HERE Geocoding

    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        customer = await conn.fetchrow(
            "SELECT address_street, address_city, address_postal_code, address_country FROM customers WHERE id = $1",
            customer_id
        )
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")

        # Placeholder response
        return {
            "message": "Geocoding not yet implemented",
            "address": f"{customer['address_street']}, {customer['address_city']}, {customer['address_postal_code']}, {customer['address_country']}",
            "suggestion": "Integrate with Google Maps Geocoding API or similar service"
        }