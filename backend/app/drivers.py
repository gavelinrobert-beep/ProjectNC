"""
Driver/Operator management routes for logistics operations.
Handles driver profiles, certifications, license tracking, and EU compliance.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
from datetime import datetime, date, timedelta
import json

from ..models import DriverIn, DriverOut, DriverHoursLog
from ..auth import require_admin
from ..database import get_pool

router = APIRouter(prefix="/api/drivers", tags=["Drivers"])


@router.get("", response_model=List[DriverOut])
async def get_drivers(
        request: Request,
        employment_status: Optional[str] = None,
        home_facility_id: Optional[str] = None,
        role: Optional[str] = None,
        certification_expiring_soon: bool = False
):
    """
    Get all drivers with optional filtering.

    - **employment_status**: Filter by status (active, on_leave, inactive)
    - **home_facility_id**: Filter by home facility
    - **role**: Filter by role (driver, operator, dispatcher, manager)
    - **certification_expiring_soon**: Show drivers with certifications expiring within 30 days
    """
    pool = await get_pool(request.app)

    query = "SELECT * FROM drivers WHERE 1=1"
    params = []

    if employment_status:
        query += f" AND employment_status = ${len(params) + 1}"
        params.append(employment_status)

    if home_facility_id:
        query += f" AND home_facility_id = ${len(params) + 1}"
        params.append(home_facility_id)

    if role:
        query += f" AND role = ${len(params) + 1}"
        params.append(role)

    if certification_expiring_soon:
        # Show licenses/certifications expiring within 30 days
        expiry_date = date.today() + timedelta(days=30)
        query += f" AND (license_expiry <= ${len(params) + 1} OR (adr_certified = true AND adr_expiry <= ${len(params) + 1}))"
        params.append(expiry_date)
        params.append(expiry_date)

    query += " ORDER BY last_name, first_name"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        drivers = [dict(row) for row in rows]
        return drivers


@router.get("/{driver_id}", response_model=DriverOut)
async def get_driver(driver_id: str, request: Request):
    """Get a specific driver by ID"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM drivers WHERE id = $1",
            driver_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Driver not found")
        return dict(row)


@router.post("", response_model=DriverOut, dependencies=[Depends(require_admin)])
async def create_driver(driver: DriverIn, request: Request):
    """
    Create a new driver.
    Requires admin role.
    """
    pool = await get_pool(request.app)
    driver_id = driver.id or str(uuid4())

    async with pool.acquire() as conn:
        try:
            row = await conn.fetchrow("""
                INSERT INTO drivers (
                    id, first_name, last_name, employee_number, phone, email,
                    emergency_contact_name, emergency_contact_phone,
                    license_number, license_type, license_expiry,
                    adr_certified, adr_expiry, forklift_certified,
                    home_facility_id, role, employment_status,
                    daily_driving_limit_minutes, weekly_driving_limit_minutes,
                    assigned_vehicle_id, current_shift_start, notes
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
                RETURNING *
            """,
                                      driver_id,
                                      driver.first_name,
                                      driver.last_name,
                                      driver.employee_number,
                                      driver.phone,
                                      driver.email,
                                      driver.emergency_contact_name,
                                      driver.emergency_contact_phone,
                                      driver.license_number,
                                      driver.license_type,
                                      driver.license_expiry,
                                      driver.adr_certified,
                                      driver.adr_expiry,
                                      driver.forklift_certified,
                                      driver.home_facility_id,
                                      driver.role,
                                      driver.employment_status,
                                      driver.daily_driving_limit_minutes,
                                      driver.weekly_driving_limit_minutes,
                                      driver.assigned_vehicle_id,
                                      driver.current_shift_start,
                                      driver.notes
                                      )
            return dict(row)
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to create driver: {str(e)}")


@router.put("/{driver_id}", response_model=DriverOut, dependencies=[Depends(require_admin)])
async def update_driver(driver_id: str, driver: DriverIn, request: Request):
    """
    Update an existing driver.
    Requires admin role.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE drivers SET
                first_name = $2,
                last_name = $3,
                employee_number = $4,
                phone = $5,
                email = $6,
                emergency_contact_name = $7,
                emergency_contact_phone = $8,
                license_number = $9,
                license_type = $10,
                license_expiry = $11,
                adr_certified = $12,
                adr_expiry = $13,
                forklift_certified = $14,
                home_facility_id = $15,
                role = $16,
                employment_status = $17,
                daily_driving_limit_minutes = $18,
                weekly_driving_limit_minutes = $19,
                assigned_vehicle_id = $20,
                current_shift_start = $21,
                notes = $22,
                updated_at = NOW()
            WHERE id = $1
            RETURNING *
        """,
                                  driver_id,
                                  driver.first_name,
                                  driver.last_name,
                                  driver.employee_number,
                                  driver.phone,
                                  driver.email,
                                  driver.emergency_contact_name,
                                  driver.emergency_contact_phone,
                                  driver.license_number,
                                  driver.license_type,
                                  driver.license_expiry,
                                  driver.adr_certified,
                                  driver.adr_expiry,
                                  driver.forklift_certified,
                                  driver.home_facility_id,
                                  driver.role,
                                  driver.employment_status,
                                  driver.daily_driving_limit_minutes,
                                  driver.weekly_driving_limit_minutes,
                                  driver.assigned_vehicle_id,
                                  driver.current_shift_start,
                                  driver.notes
                                  )
        if not row:
            raise HTTPException(status_code=404, detail="Driver not found")
        return dict(row)


@router.delete("/{driver_id}", dependencies=[Depends(require_admin)])
async def delete_driver(driver_id: str, request: Request):
    """
    Delete a driver (sets employment_status to inactive).
    Requires admin role.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        result = await conn.execute(
            "UPDATE drivers SET employment_status = 'inactive', updated_at = NOW() WHERE id = $1",
            driver_id
        )
        if result == "UPDATE 0":
            raise HTTPException(status_code=404, detail="Driver not found")
        return {"ok": True, "message": "Driver set to inactive"}


# ============================================================================
# SHIFT MANAGEMENT & WORKING HOURS (EU COMPLIANCE)
# ============================================================================

@router.post("/{driver_id}/shift/start")
async def start_shift(driver_id: str, request: Request):
    """
    Start a new shift for the driver.
    Records shift start time for EU compliance tracking.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if driver exists
        driver = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        # Check if driver already has an active shift
        if driver['current_shift_start']:
            raise HTTPException(
                status_code=400,
                detail=f"Driver already has an active shift started at {driver['current_shift_start']}"
            )

        # Update driver with shift start time
        await conn.execute(
            "UPDATE drivers SET current_shift_start = NOW(), updated_at = NOW() WHERE id = $1",
            driver_id
        )

        # Create entry in driver_hours_log
        today = date.today()
        await conn.execute("""
            INSERT INTO driver_hours_log (driver_id, shift_date, shift_start)
            VALUES ($1, $2, NOW())
            ON CONFLICT (driver_id, shift_date) DO UPDATE 
            SET shift_start = NOW()
        """, driver_id, today)

        return {
            "ok": True,
            "message": "Shift started",
            "driver_id": driver_id,
            "shift_start": datetime.utcnow().isoformat()
        }


@router.post("/{driver_id}/shift/end")
async def end_shift(
        driver_id: str,
        request: Request,
        driving_minutes: int = 0,
        break_minutes: int = 0,
        other_work_minutes: int = 0
):
    """
    End the current shift for the driver.
    Records total driving time, breaks, and other work for EU compliance.

    - **driving_minutes**: Total minutes spent driving
    - **break_minutes**: Total minutes on breaks
    - **other_work_minutes**: Total minutes doing other work (loading, paperwork, etc.)
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if driver has an active shift
        driver = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        if not driver['current_shift_start']:
            raise HTTPException(status_code=400, detail="No active shift to end")

        # Check EU driving time limits
        if driving_minutes > driver['daily_driving_limit_minutes']:
            return {
                "ok": False,
                "warning": f"Driving time ({driving_minutes} min) exceeds daily limit ({driver['daily_driving_limit_minutes']} min)",
                "compliance_violation": True
            }

        # Update driver
        await conn.execute(
            "UPDATE drivers SET current_shift_start = NULL, updated_at = NOW() WHERE id = $1",
            driver_id
        )

        # Update driver_hours_log
        today = date.today()
        await conn.execute("""
            UPDATE driver_hours_log 
            SET shift_end = NOW(),
                driving_minutes = $3,
                break_minutes = $4,
                other_work_minutes = $5
            WHERE driver_id = $1 AND shift_date = $2
        """, driver_id, today, driving_minutes, break_minutes, other_work_minutes)

        # Check weekly driving time
        weekly_driving = await conn.fetchval("""
            SELECT SUM(driving_minutes)
            FROM driver_hours_log
            WHERE driver_id = $1 
            AND shift_date >= $2
        """, driver_id, today - timedelta(days=7))

        weekly_limit = driver['weekly_driving_limit_minutes']
        weekly_compliance = weekly_driving <= weekly_limit if weekly_driving else True

        return {
            "ok": True,
            "message": "Shift ended",
            "driver_id": driver_id,
            "shift_end": datetime.utcnow().isoformat(),
            "compliance": {
                "daily_driving_minutes": driving_minutes,
                "daily_limit_minutes": driver['daily_driving_limit_minutes'],
                "daily_compliant": driving_minutes <= driver['daily_driving_limit_minutes'],
                "weekly_driving_minutes": int(weekly_driving) if weekly_driving else 0,
                "weekly_limit_minutes": weekly_limit,
                "weekly_compliant": weekly_compliance
            }
        }


@router.get("/{driver_id}/hours")
async def get_driver_hours(
        driver_id: str,
        request: Request,
        days: int = 7
):
    """
    Get driver's working hours for the last N days.
    Shows driving time, breaks, and compliance status.

    - **days**: Number of days to look back (default: 7)
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Get driver info
        driver = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        # Get hours log
        since_date = date.today() - timedelta(days=days)
        rows = await conn.fetch("""
            SELECT *
            FROM driver_hours_log
            WHERE driver_id = $1 AND shift_date >= $2
            ORDER BY shift_date DESC
        """, driver_id, since_date)

        hours_log = [dict(row) for row in rows]

        # Calculate totals
        total_driving = sum(row['driving_minutes'] or 0 for row in hours_log)
        total_breaks = sum(row['break_minutes'] or 0 for row in hours_log)
        total_other = sum(row['other_work_minutes'] or 0 for row in hours_log)

        return {
            "driver_id": driver_id,
            "driver_name": f"{driver['first_name']} {driver['last_name']}",
            "period_days": days,
            "hours_log": hours_log,
            "totals": {
                "driving_minutes": total_driving,
                "break_minutes": total_breaks,
                "other_work_minutes": total_other,
                "total_work_minutes": total_driving + total_other
            },
            "compliance": {
                "daily_limit_minutes": driver['daily_driving_limit_minutes'],
                "weekly_limit_minutes": driver['weekly_driving_limit_minutes'],
                "weekly_driving_minutes": total_driving,
                "weekly_compliant": total_driving <= driver['weekly_driving_limit_minutes']
            }
        }


@router.get("/{driver_id}/compliance")
async def check_driver_compliance(driver_id: str, request: Request):
    """
    Check driver's compliance status.
    Returns warnings for expired licenses, exceeded driving limits, etc.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        driver = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        warnings = []
        today = date.today()

        # Check license expiry
        if driver['license_expiry'] < today:
            warnings.append({
                "type": "license_expired",
                "severity": "critical",
                "message": f"Driver's license expired on {driver['license_expiry']}"
            })
        elif driver['license_expiry'] < today + timedelta(days=30):
            warnings.append({
                "type": "license_expiring_soon",
                "severity": "warning",
                "message": f"Driver's license expires on {driver['license_expiry']} (within 30 days)"
            })

        # Check ADR certification expiry
        if driver['adr_certified'] and driver['adr_expiry']:
            if driver['adr_expiry'] < today:
                warnings.append({
                    "type": "adr_expired",
                    "severity": "high",
                    "message": f"ADR certification expired on {driver['adr_expiry']}"
                })
            elif driver['adr_expiry'] < today + timedelta(days=30):
                warnings.append({
                    "type": "adr_expiring_soon",
                    "severity": "warning",
                    "message": f"ADR certification expires on {driver['adr_expiry']} (within 30 days)"
                })

        # Check weekly driving hours
        weekly_driving = await conn.fetchval("""
            SELECT SUM(driving_minutes)
            FROM driver_hours_log
            WHERE driver_id = $1 
            AND shift_date >= $2
        """, driver_id, today - timedelta(days=7))

        if weekly_driving and weekly_driving > driver['weekly_driving_limit_minutes']:
            warnings.append({
                "type": "weekly_driving_limit_exceeded",
                "severity": "critical",
                "message": f"Weekly driving limit exceeded: {weekly_driving} minutes (limit: {driver['weekly_driving_limit_minutes']} minutes)"
            })

        # Check if driver is assigned to a vehicle
        if not driver['assigned_vehicle_id']:
            warnings.append({
                "type": "no_vehicle_assigned",
                "severity": "info",
                "message": "Driver has no vehicle assigned"
            })

        return {
            "driver_id": driver_id,
            "driver_name": f"{driver['first_name']} {driver['last_name']}",
            "compliant": len([w for w in warnings if w['severity'] in ['critical', 'high']]) == 0,
            "warnings": warnings,
            "checked_at": datetime.utcnow().isoformat()
        }


# ============================================================================
# DRIVER ASSIGNMENTS
# ============================================================================

@router.post("/{driver_id}/assign/vehicle")
async def assign_vehicle_to_driver(
        driver_id: str,
        vehicle_id: str,
        request: Request
):
    """
    Assign a vehicle to a driver.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Check if driver exists
        driver = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        # Check if vehicle exists
        vehicle = await conn.fetchrow("SELECT * FROM assets WHERE id = $1", vehicle_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail="Vehicle not found")

        # Unassign vehicle from previous driver if any
        await conn.execute(
            "UPDATE drivers SET assigned_vehicle_id = NULL WHERE assigned_vehicle_id = $1",
            vehicle_id
        )

        # Assign vehicle to driver
        await conn.execute(
            "UPDATE drivers SET assigned_vehicle_id = $2, updated_at = NOW() WHERE id = $1",
            driver_id, vehicle_id
        )

        # Update vehicle's current_driver_id
        await conn.execute(
            "UPDATE assets SET current_driver_id = $2, updated_at = NOW() WHERE id = $1",
            vehicle_id, driver_id
        )

        return {
            "ok": True,
            "message": f"Vehicle {vehicle_id} assigned to driver {driver_id}",
            "driver": f"{driver['first_name']} {driver['last_name']}",
            "vehicle": vehicle['type']
        }


@router.post("/{driver_id}/unassign/vehicle")
async def unassign_vehicle_from_driver(driver_id: str, request: Request):
    """
    Unassign the vehicle from a driver.
    """
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        driver = await conn.fetchrow("SELECT * FROM drivers WHERE id = $1", driver_id)
        if not driver:
            raise HTTPException(status_code=404, detail="Driver not found")

        if not driver['assigned_vehicle_id']:
            raise HTTPException(status_code=400, detail="Driver has no vehicle assigned")

        vehicle_id = driver['assigned_vehicle_id']

        # Unassign
        await conn.execute(
            "UPDATE drivers SET assigned_vehicle_id = NULL, updated_at = NOW() WHERE id = $1",
            driver_id
        )
        await conn.execute(
            "UPDATE assets SET current_driver_id = NULL, updated_at = NOW() WHERE id = $1",
            vehicle_id
        )

        return {
            "ok": True,
            "message": f"Vehicle {vehicle_id} unassigned from driver {driver_id}"
        }


@router.get("/{driver_id}/tasks")
async def get_driver_tasks(
        driver_id: str,
        request: Request,
        status: Optional[str] = None
):
    """
    Get all tasks assigned to this driver.

    - **status**: Filter by task status (planne
