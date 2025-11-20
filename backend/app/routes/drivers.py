"""
Drivers CRUD endpoints with database persistence.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List
from uuid import uuid4
from datetime import date

from ..shared.models import DriverIn, DriverOut
from ..shared.auth import require_admin
from ..shared.database import get_pool

router = APIRouter(prefix="/api/drivers", tags=["drivers"])


@router.get("", response_model=List[dict])
async def get_drivers(request: Request):
    """Get all drivers from database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM drivers ORDER BY last_name, first_name")
        return [dict(row) for row in rows]


@router.post("", response_model=dict, dependencies=[Depends(require_admin)])
async def create_driver(payload: DriverIn, request: Request):
    """Create a new driver in database"""
    driver_id = payload.id or str(uuid4())
    driver = payload.dict()
    driver["id"] = driver_id

    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        await conn.execute("""
            INSERT INTO drivers (
                id, first_name, last_name, employee_number, phone, email,
                emergency_contact_name, emergency_contact_phone,
                license_number, license_type, license_expiry,
                adr_certified, adr_expiry, forklift_certified,
                home_facility_id, role, employment_status,
                daily_driving_limit_minutes, weekly_driving_limit_minutes,
                assigned_vehicle_id, current_shift_start, notes,
                created_at, updated_at
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW()
            )
        """,
            driver_id,
            driver.get("first_name"),
            driver.get("last_name"),
            driver.get("employee_number"),
            driver.get("phone"),
            driver.get("email"),
            driver.get("emergency_contact_name"),
            driver.get("emergency_contact_phone"),
            driver.get("license_number"),
            driver.get("license_type"),
            driver.get("license_expiry"),
            driver.get("adr_certified", False),
            driver.get("adr_expiry"),
            driver.get("forklift_certified", False),
            driver.get("home_facility_id"),
            driver.get("role", "driver"),
            driver.get("employment_status", "active"),
            driver.get("daily_driving_limit_minutes", 540),
            driver.get("weekly_driving_limit_minutes", 3360),
            driver.get("assigned_vehicle_id"),
            driver.get("current_shift_start"),
            driver.get("notes")
        )
    return driver


@router.put("/{driver_id}", response_model=dict, dependencies=[Depends(require_admin)])
async def update_driver(driver_id: str, payload: DriverIn, request: Request):
    """Update an existing driver in database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Check if driver exists
        existing = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Driver not found")

        # Update with new values
        updates = payload.dict(exclude_unset=True)

        await conn.execute("""
            UPDATE drivers 
            SET first_name = COALESCE($2, first_name),
                last_name = COALESCE($3, last_name),
                employee_number = COALESCE($4, employee_number),
                phone = COALESCE($5, phone),
                email = COALESCE($6, email),
                emergency_contact_name = COALESCE($7, emergency_contact_name),
                emergency_contact_phone = COALESCE($8, emergency_contact_phone),
                license_number = COALESCE($9, license_number),
                license_type = COALESCE($10, license_type),
                license_expiry = COALESCE($11, license_expiry),
                adr_certified = COALESCE($12, adr_certified),
                adr_expiry = COALESCE($13, adr_expiry),
                forklift_certified = COALESCE($14, forklift_certified),
                home_facility_id = COALESCE($15, home_facility_id),
                role = COALESCE($16, role),
                employment_status = COALESCE($17, employment_status),
                daily_driving_limit_minutes = COALESCE($18, daily_driving_limit_minutes),
                weekly_driving_limit_minutes = COALESCE($19, weekly_driving_limit_minutes),
                assigned_vehicle_id = COALESCE($20, assigned_vehicle_id),
                current_shift_start = COALESCE($21, current_shift_start),
                notes = COALESCE($22, notes),
                updated_at = NOW()
            WHERE id = $1
        """,
            driver_id,
            updates.get("first_name"),
            updates.get("last_name"),
            updates.get("employee_number"),
            updates.get("phone"),
            updates.get("email"),
            updates.get("emergency_contact_name"),
            updates.get("emergency_contact_phone"),
            updates.get("license_number"),
            updates.get("license_type"),
            updates.get("license_expiry"),
            updates.get("adr_certified"),
            updates.get("adr_expiry"),
            updates.get("forklift_certified"),
            updates.get("home_facility_id"),
            updates.get("role"),
            updates.get("employment_status"),
            updates.get("daily_driving_limit_minutes"),
            updates.get("weekly_driving_limit_minutes"),
            updates.get("assigned_vehicle_id"),
            updates.get("current_shift_start"),
            updates.get("notes")
        )

        # Fetch and return updated driver
        updated = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        return dict(updated)


@router.delete("/{driver_id}", dependencies=[Depends(require_admin)])
async def delete_driver(driver_id: str, request: Request):
    """Delete a driver from database"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM drivers WHERE id = $1", driver_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Driver not found")
        return {"ok": True}
