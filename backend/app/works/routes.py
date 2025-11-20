"""
API routes for SYLON Works module.
Handles construction/contracting operations endpoints.
"""
from fastapi import APIRouter, HTTPException, Depends, Request, Query
from typing import Optional, List
from datetime import datetime
import uuid

from ..shared.database import get_pool
from ..shared.auth import require_auth
from .models import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectStatistics,
    WorkOrderCreate, WorkOrderUpdate, WorkOrderResponse,
    MachineHoursCreate, MachineHoursUpdate, MachineHoursResponse,
    ChangeOrderCreate, ChangeOrderUpdate, ChangeOrderResponse,
    WinterMaintenanceCreate, WinterMaintenanceUpdate, WinterMaintenanceResponse,
    DocumentationCreate, DocumentationResponse
)

router = APIRouter(prefix='/api/v1/works', tags=['Works'])


# ============================================================================
# PROJECT ENDPOINTS
# ============================================================================

@router.get('/projects', response_model=List[ProjectResponse])
async def list_projects(
    request: Request,
    status: Optional[str] = None,
    customer_id: Optional[str] = None,
    project_manager_id: Optional[str] = None,
    _user: dict = Depends(require_auth)
):
    """List all projects with optional filters"""
    pool = await get_pool(request.app)
    
    query = "SELECT * FROM works_projects WHERE 1=1"
    params = []
    param_count = 0
    
    if status:
        param_count += 1
        query += f" AND status = ${param_count}"
        params.append(status)
    
    if customer_id:
        param_count += 1
        query += f" AND customer_id = ${param_count}"
        params.append(customer_id)
    
    if project_manager_id:
        param_count += 1
        query += f" AND project_manager_id = ${param_count}"
        params.append(project_manager_id)
    
    query += " ORDER BY created_at DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.post('/projects', response_model=ProjectResponse, status_code=201)
async def create_project(
    project: ProjectCreate,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Create a new project"""
    pool = await get_pool(request.app)
    project_id = str(uuid.uuid4())
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        # Check if project_number is unique
        existing = await conn.fetchrow(
            "SELECT id FROM works_projects WHERE project_number = $1",
            project.project_number
        )
        if existing:
            raise HTTPException(status_code=400, detail="Project number already exists")
        
        row = await conn.fetchrow("""
            INSERT INTO works_projects (
                id, project_number, name, description, customer_id, site_id,
                status, start_date, end_date, budget, project_manager_id, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING *
        """, project_id, project.project_number, project.name, project.description,
            project.customer_id, project.site_id, project.status, project.start_date,
            project.end_date, project.budget, project.project_manager_id, user_id)
        
        return dict(row)


@router.get('/projects/{project_id}', response_model=ProjectResponse)
async def get_project(
    project_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get project details by ID"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM works_projects WHERE id = $1",
            project_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return dict(row)


@router.put('/projects/{project_id}', response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project: ProjectUpdate,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Update an existing project"""
    pool = await get_pool(request.app)
    
    # Build dynamic update query
    updates = []
    params = []
    param_count = 0
    
    for field, value in project.dict(exclude_unset=True).items():
        if value is not None:
            param_count += 1
            updates.append(f"{field} = ${param_count}")
            params.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    param_count += 1
    params.append(project_id)
    
    query = f"""
        UPDATE works_projects 
        SET {', '.join(updates)}
        WHERE id = ${param_count}
        RETURNING *
    """
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        if not row:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return dict(row)


@router.delete('/projects/{project_id}', status_code=204)
async def delete_project(
    project_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Delete a project"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM works_projects WHERE id = $1",
            project_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Project not found")


@router.get('/projects/{project_id}/statistics', response_model=ProjectStatistics)
async def get_project_statistics(
    project_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get project statistics"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        # Verify project exists
        project = await conn.fetchrow(
            "SELECT id FROM works_projects WHERE id = $1",
            project_id
        )
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Get work order statistics
        wo_stats = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COUNT(*) FILTER (WHERE status = 'in_progress') as active
            FROM works_work_orders
            WHERE project_id = $1
        """, project_id)
        
        # Get machine hours statistics
        mh_stats = await conn.fetchrow("""
            SELECT 
                COALESCE(SUM(hours), 0) as total_hours,
                COALESCE(SUM(total_cost), 0) as total_cost
            FROM works_machine_hours
            WHERE project_id = $1
        """, project_id)
        
        # Get change order statistics
        co_stats = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'approved') as approved,
                COALESCE(SUM(actual_cost), SUM(estimated_cost), 0) as total_cost
            FROM works_change_orders
            WHERE project_id = $1
        """, project_id)
        
        return {
            "total_work_orders": wo_stats['total'],
            "completed_work_orders": wo_stats['completed'],
            "active_work_orders": wo_stats['active'],
            "total_machine_hours": mh_stats['total_hours'],
            "total_machine_costs": mh_stats['total_cost'],
            "total_change_orders": co_stats['total'],
            "approved_change_orders": co_stats['approved'],
            "change_order_costs": co_stats['total_cost']
        }


# ============================================================================
# WORK ORDER ENDPOINTS
# ============================================================================

@router.get('/work-orders', response_model=List[WorkOrderResponse])
async def list_work_orders(
    request: Request,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    assigned_to: Optional[str] = None,
    type: Optional[str] = None,
    _user: dict = Depends(require_auth)
):
    """List all work orders with optional filters"""
    pool = await get_pool(request.app)
    
    query = "SELECT * FROM works_work_orders WHERE 1=1"
    params = []
    param_count = 0
    
    if project_id:
        param_count += 1
        query += f" AND project_id = ${param_count}"
        params.append(project_id)
    
    if status:
        param_count += 1
        query += f" AND status = ${param_count}"
        params.append(status)
    
    if assigned_to:
        param_count += 1
        query += f" AND assigned_to = ${param_count}"
        params.append(assigned_to)
    
    if type:
        param_count += 1
        query += f" AND type = ${param_count}"
        params.append(type)
    
    query += " ORDER BY created_at DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.post('/work-orders', response_model=WorkOrderResponse, status_code=201)
async def create_work_order(
    work_order: WorkOrderCreate,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Create a new work order"""
    pool = await get_pool(request.app)
    work_order_id = str(uuid.uuid4())
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        # Check if order_number is unique
        existing = await conn.fetchrow(
            "SELECT id FROM works_work_orders WHERE order_number = $1",
            work_order.order_number
        )
        if existing:
            raise HTTPException(status_code=400, detail="Work order number already exists")
        
        row = await conn.fetchrow("""
            INSERT INTO works_work_orders (
                id, order_number, project_id, title, description, type, priority,
                status, assigned_to, scheduled_start, scheduled_end,
                location_lat, location_lng, location_address, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
            RETURNING *
        """, work_order_id, work_order.order_number, work_order.project_id,
            work_order.title, work_order.description, work_order.type,
            work_order.priority, work_order.status, work_order.assigned_to,
            work_order.scheduled_start, work_order.scheduled_end,
            work_order.location_lat, work_order.location_lng,
            work_order.location_address, user_id)
        
        return dict(row)


@router.get('/work-orders/{work_order_id}', response_model=WorkOrderResponse)
async def get_work_order(
    work_order_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get work order details by ID"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM works_work_orders WHERE id = $1",
            work_order_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Work order not found")
        
        return dict(row)


@router.put('/work-orders/{work_order_id}', response_model=WorkOrderResponse)
async def update_work_order(
    work_order_id: str,
    work_order: WorkOrderUpdate,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Update an existing work order"""
    pool = await get_pool(request.app)
    
    updates = []
    params = []
    param_count = 0
    
    for field, value in work_order.dict(exclude_unset=True).items():
        if value is not None:
            param_count += 1
            updates.append(f"{field} = ${param_count}")
            params.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    param_count += 1
    params.append(work_order_id)
    
    query = f"""
        UPDATE works_work_orders 
        SET {', '.join(updates)}
        WHERE id = ${param_count}
        RETURNING *
    """
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        if not row:
            raise HTTPException(status_code=404, detail="Work order not found")
        
        return dict(row)


@router.delete('/work-orders/{work_order_id}', status_code=204)
async def delete_work_order(
    work_order_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Delete a work order"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM works_work_orders WHERE id = $1",
            work_order_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Work order not found")


@router.post('/work-orders/{work_order_id}/start', response_model=WorkOrderResponse)
async def start_work_order(
    work_order_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Start a work order (set status to in_progress and record actual_start)"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE works_work_orders
            SET status = 'in_progress', actual_start = NOW()
            WHERE id = $1
            RETURNING *
        """, work_order_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Work order not found")
        
        return dict(row)


@router.post('/work-orders/{work_order_id}/complete', response_model=WorkOrderResponse)
async def complete_work_order(
    work_order_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Complete a work order (set status to completed and record actual_end)"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE works_work_orders
            SET status = 'completed', actual_end = NOW()
            WHERE id = $1
            RETURNING *
        """, work_order_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Work order not found")
        
        return dict(row)


# ============================================================================
# MACHINE HOURS ENDPOINTS
# ============================================================================

@router.get('/machine-hours', response_model=List[MachineHoursResponse])
async def list_machine_hours(
    request: Request,
    project_id: Optional[str] = None,
    work_order_id: Optional[str] = None,
    asset_id: Optional[str] = None,
    operator_id: Optional[str] = None,
    _user: dict = Depends(require_auth)
):
    """List all machine hours entries with optional filters"""
    pool = await get_pool(request.app)
    
    query = "SELECT * FROM works_machine_hours WHERE 1=1"
    params = []
    param_count = 0
    
    if project_id:
        param_count += 1
        query += f" AND project_id = ${param_count}"
        params.append(project_id)
    
    if work_order_id:
        param_count += 1
        query += f" AND work_order_id = ${param_count}"
        params.append(work_order_id)
    
    if asset_id:
        param_count += 1
        query += f" AND asset_id = ${param_count}"
        params.append(asset_id)
    
    if operator_id:
        param_count += 1
        query += f" AND operator_id = ${param_count}"
        params.append(operator_id)
    
    query += " ORDER BY start_time DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.post('/machine-hours', response_model=MachineHoursResponse, status_code=201)
async def create_machine_hours(
    machine_hours: MachineHoursCreate,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Log machine hours"""
    pool = await get_pool(request.app)
    machine_hours_id = str(uuid.uuid4())
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO works_machine_hours (
                id, work_order_id, project_id, asset_id, operator_id,
                start_time, end_time, hourly_rate, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        """, machine_hours_id, machine_hours.work_order_id, machine_hours.project_id,
            machine_hours.asset_id, machine_hours.operator_id, machine_hours.start_time,
            machine_hours.end_time, machine_hours.hourly_rate, machine_hours.notes, user_id)
        
        return dict(row)


@router.get('/machine-hours/{machine_hours_id}', response_model=MachineHoursResponse)
async def get_machine_hours(
    machine_hours_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get machine hours entry details by ID"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM works_machine_hours WHERE id = $1",
            machine_hours_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Machine hours entry not found")
        
        return dict(row)


@router.put('/machine-hours/{machine_hours_id}', response_model=MachineHoursResponse)
async def update_machine_hours(
    machine_hours_id: str,
    machine_hours: MachineHoursUpdate,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Update a machine hours entry"""
    pool = await get_pool(request.app)
    
    updates = []
    params = []
    param_count = 0
    
    for field, value in machine_hours.dict(exclude_unset=True).items():
        if value is not None:
            param_count += 1
            updates.append(f"{field} = ${param_count}")
            params.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    param_count += 1
    params.append(machine_hours_id)
    
    query = f"""
        UPDATE works_machine_hours 
        SET {', '.join(updates)}
        WHERE id = ${param_count}
        RETURNING *
    """
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        if not row:
            raise HTTPException(status_code=404, detail="Machine hours entry not found")
        
        return dict(row)


@router.get('/projects/{project_id}/machine-hours', response_model=List[MachineHoursResponse])
async def get_project_machine_hours(
    project_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all machine hours for a specific project"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT * FROM works_machine_hours
            WHERE project_id = $1
            ORDER BY start_time DESC
        """, project_id)
        
        return [dict(row) for row in rows]


# ============================================================================
# CHANGE ORDER ENDPOINTS (ÄTA)
# ============================================================================

@router.get('/change-orders', response_model=List[ChangeOrderResponse])
async def list_change_orders(
    request: Request,
    project_id: Optional[str] = None,
    status: Optional[str] = None,
    _user: dict = Depends(require_auth)
):
    """List all change orders with optional filters"""
    pool = await get_pool(request.app)
    
    query = "SELECT * FROM works_change_orders WHERE 1=1"
    params = []
    param_count = 0
    
    if project_id:
        param_count += 1
        query += f" AND project_id = ${param_count}"
        params.append(project_id)
    
    if status:
        param_count += 1
        query += f" AND status = ${param_count}"
        params.append(status)
    
    query += " ORDER BY created_at DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.post('/change-orders', response_model=ChangeOrderResponse, status_code=201)
async def create_change_order(
    change_order: ChangeOrderCreate,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Create a new change order (ÄTA)"""
    pool = await get_pool(request.app)
    change_order_id = str(uuid.uuid4())
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        # Check if change_order_number is unique
        existing = await conn.fetchrow(
            "SELECT id FROM works_change_orders WHERE change_order_number = $1",
            change_order.change_order_number
        )
        if existing:
            raise HTTPException(status_code=400, detail="Change order number already exists")
        
        row = await conn.fetchrow("""
            INSERT INTO works_change_orders (
                id, change_order_number, project_id, title, description, reason,
                status, estimated_cost, estimated_hours, impact_on_schedule, requested_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        """, change_order_id, change_order.change_order_number, change_order.project_id,
            change_order.title, change_order.description, change_order.reason,
            change_order.status, change_order.estimated_cost, change_order.estimated_hours,
            change_order.impact_on_schedule, user_id)
        
        return dict(row)


@router.get('/change-orders/{change_order_id}', response_model=ChangeOrderResponse)
async def get_change_order(
    change_order_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get change order details by ID"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM works_change_orders WHERE id = $1",
            change_order_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Change order not found")
        
        return dict(row)


@router.put('/change-orders/{change_order_id}', response_model=ChangeOrderResponse)
async def update_change_order(
    change_order_id: str,
    change_order: ChangeOrderUpdate,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Update an existing change order"""
    pool = await get_pool(request.app)
    
    updates = []
    params = []
    param_count = 0
    
    for field, value in change_order.dict(exclude_unset=True).items():
        if value is not None:
            param_count += 1
            updates.append(f"{field} = ${param_count}")
            params.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    param_count += 1
    params.append(change_order_id)
    
    query = f"""
        UPDATE works_change_orders 
        SET {', '.join(updates)}
        WHERE id = ${param_count}
        RETURNING *
    """
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        if not row:
            raise HTTPException(status_code=404, detail="Change order not found")
        
        return dict(row)


@router.post('/change-orders/{change_order_id}/submit', response_model=ChangeOrderResponse)
async def submit_change_order(
    change_order_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Submit a change order for approval"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE works_change_orders
            SET status = 'submitted', submitted_at = NOW()
            WHERE id = $1
            RETURNING *
        """, change_order_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Change order not found")
        
        return dict(row)


@router.post('/change-orders/{change_order_id}/approve', response_model=ChangeOrderResponse)
async def approve_change_order(
    change_order_id: str,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Approve a change order"""
    pool = await get_pool(request.app)
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE works_change_orders
            SET status = 'approved', approved_at = NOW(), approved_by = $2
            WHERE id = $1
            RETURNING *
        """, change_order_id, user_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Change order not found")
        
        return dict(row)


@router.post('/change-orders/{change_order_id}/reject', response_model=ChangeOrderResponse)
async def reject_change_order(
    change_order_id: str,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Reject a change order"""
    pool = await get_pool(request.app)
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            UPDATE works_change_orders
            SET status = 'rejected', approved_by = $2
            WHERE id = $1
            RETURNING *
        """, change_order_id, user_id)
        
        if not row:
            raise HTTPException(status_code=404, detail="Change order not found")
        
        return dict(row)


# ============================================================================
# WINTER MAINTENANCE ENDPOINTS
# ============================================================================

@router.get('/winter-maintenance', response_model=List[WinterMaintenanceResponse])
async def list_winter_maintenance(
    request: Request,
    work_order_id: Optional[str] = None,
    route_name: Optional[str] = None,
    _user: dict = Depends(require_auth)
):
    """List all winter maintenance entries with optional filters"""
    pool = await get_pool(request.app)
    
    query = "SELECT * FROM works_winter_maintenance WHERE 1=1"
    params = []
    param_count = 0
    
    if work_order_id:
        param_count += 1
        query += f" AND work_order_id = ${param_count}"
        params.append(work_order_id)
    
    if route_name:
        param_count += 1
        query += f" AND route_name ILIKE ${param_count}"
        params.append(f"%{route_name}%")
    
    query += " ORDER BY start_time DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.post('/winter-maintenance', response_model=WinterMaintenanceResponse, status_code=201)
async def create_winter_maintenance(
    winter_maintenance: WinterMaintenanceCreate,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Create a new winter maintenance entry"""
    pool = await get_pool(request.app)
    winter_maintenance_id = str(uuid.uuid4())
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO works_winter_maintenance (
                id, work_order_id, route_name, road_condition, weather_condition,
                temperature, salt_used_kg, sand_used_kg, plowing_performed,
                start_time, end_time, distance_km, notes, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
            RETURNING *
        """, winter_maintenance_id, winter_maintenance.work_order_id,
            winter_maintenance.route_name, winter_maintenance.road_condition,
            winter_maintenance.weather_condition, winter_maintenance.temperature,
            winter_maintenance.salt_used_kg, winter_maintenance.sand_used_kg,
            winter_maintenance.plowing_performed, winter_maintenance.start_time,
            winter_maintenance.end_time, winter_maintenance.distance_km,
            winter_maintenance.notes, user_id)
        
        return dict(row)


@router.get('/winter-maintenance/{winter_maintenance_id}', response_model=WinterMaintenanceResponse)
async def get_winter_maintenance(
    winter_maintenance_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get winter maintenance entry details by ID"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM works_winter_maintenance WHERE id = $1",
            winter_maintenance_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Winter maintenance entry not found")
        
        return dict(row)


@router.put('/winter-maintenance/{winter_maintenance_id}', response_model=WinterMaintenanceResponse)
async def update_winter_maintenance(
    winter_maintenance_id: str,
    winter_maintenance: WinterMaintenanceUpdate,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Update a winter maintenance entry"""
    pool = await get_pool(request.app)
    
    updates = []
    params = []
    param_count = 0
    
    for field, value in winter_maintenance.dict(exclude_unset=True).items():
        if value is not None:
            param_count += 1
            updates.append(f"{field} = ${param_count}")
            params.append(value)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    param_count += 1
    params.append(winter_maintenance_id)
    
    query = f"""
        UPDATE works_winter_maintenance 
        SET {', '.join(updates)}
        WHERE id = ${param_count}
        RETURNING *
    """
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        if not row:
            raise HTTPException(status_code=404, detail="Winter maintenance entry not found")
        
        return dict(row)


# ============================================================================
# DOCUMENTATION ENDPOINTS
# ============================================================================

@router.get('/documentation', response_model=List[DocumentationResponse])
async def list_documentation(
    request: Request,
    project_id: Optional[str] = None,
    work_order_id: Optional[str] = None,
    change_order_id: Optional[str] = None,
    document_type: Optional[str] = None,
    _user: dict = Depends(require_auth)
):
    """List all documentation with optional filters"""
    pool = await get_pool(request.app)
    
    query = "SELECT * FROM works_documentation WHERE 1=1"
    params = []
    param_count = 0
    
    if project_id:
        param_count += 1
        query += f" AND project_id = ${param_count}"
        params.append(project_id)
    
    if work_order_id:
        param_count += 1
        query += f" AND work_order_id = ${param_count}"
        params.append(work_order_id)
    
    if change_order_id:
        param_count += 1
        query += f" AND change_order_id = ${param_count}"
        params.append(change_order_id)
    
    if document_type:
        param_count += 1
        query += f" AND document_type = ${param_count}"
        params.append(document_type)
    
    query += " ORDER BY created_at DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.post('/documentation', response_model=DocumentationResponse, status_code=201)
async def upload_documentation(
    documentation: DocumentationCreate,
    request: Request,
    user: dict = Depends(require_auth)
):
    """Upload a new document"""
    pool = await get_pool(request.app)
    documentation_id = str(uuid.uuid4())
    user_id = user.get('user_id')
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO works_documentation (
                id, project_id, work_order_id, change_order_id, document_type,
                title, description, file_path, file_size, mime_type, uploaded_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *
        """, documentation_id, documentation.project_id, documentation.work_order_id,
            documentation.change_order_id, documentation.document_type,
            documentation.title, documentation.description, documentation.file_path,
            documentation.file_size, documentation.mime_type, user_id)
        
        return dict(row)


@router.get('/documentation/{documentation_id}', response_model=DocumentationResponse)
async def get_documentation(
    documentation_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get document details by ID"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM works_documentation WHERE id = $1",
            documentation_id
        )
        if not row:
            raise HTTPException(status_code=404, detail="Document not found")
        
        return dict(row)


@router.delete('/documentation/{documentation_id}', status_code=204)
async def delete_documentation(
    documentation_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Delete a document"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM works_documentation WHERE id = $1",
            documentation_id
        )
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Document not found")
