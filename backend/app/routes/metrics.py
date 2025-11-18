"""
Metrics API endpoints for dashboard widgets and performance tracking.
Provides resource status, performance metrics, and other analytics data.
"""
from fastapi import APIRouter, Request, Depends
from typing import Optional
from datetime import datetime, timedelta
from ..database import get_pool
from ..auth import require_auth

router = APIRouter(prefix="/api/metrics", tags=["metrics"])


@router.get("/resource-status")
async def get_resource_status(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """
    Get fleet resource status for the dashboard widget.
    Returns counts for different asset statuses and utilization metrics.
    """
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        # Get asset counts by status
        status_counts = await conn.fetch("""
            SELECT 
                status,
                COUNT(*) as count
            FROM assets
            GROUP BY status
        """)
        
        # Get total assets
        total_result = await conn.fetchrow("SELECT COUNT(*) as total FROM assets")
        total = total_result['total'] if total_result else 0
        
        # Convert to dictionary
        status_dict = {row['status']: row['count'] for row in status_counts}
        
        # Calculate specific status counts
        available = status_dict.get('available', 0)
        in_use = status_dict.get('in_use', 0)
        parked = status_dict.get('parked', 0)
        maintenance = status_dict.get('maintenance', 0)
        out_of_service = status_dict.get('out_of_service', 0)
        
        # Calculate utilization rate (in_use / (available + in_use + parked))
        active_fleet = available + in_use + parked
        utilization_rate = (in_use / active_fleet * 100) if active_fleet > 0 else 0
        
        # Calculate average response time estimate based on available assets
        # Simple heuristic: more available assets = faster response time
        if available > 10:
            avg_response_time_minutes = 15
        elif available > 5:
            avg_response_time_minutes = 25
        elif available > 0:
            avg_response_time_minutes = 45
        else:
            avg_response_time_minutes = 90
        
        return {
            "total": total,
            "available": available,
            "in_use": in_use,
            "parked": parked,
            "maintenance": maintenance,
            "out_of_service": out_of_service,
            "utilization_rate": round(utilization_rate, 1),
            "avg_response_time_minutes": avg_response_time_minutes,
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/performance")
async def get_performance_metrics(
    request: Request,
    period: str = "7days",  # Options: today, 7days, 30days
    _user: dict = Depends(require_auth)
):
    """
    Get performance metrics for tracking deliveries, distance, and efficiency.
    Supports filtering by period: today, 7days, 30days.
    """
    pool = await get_pool(request.app)
    
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        period_label = "Today"
    elif period == "30days":
        start_date = now - timedelta(days=30)
        period_label = "Last 30 Days"
    else:  # default to 7days
        start_date = now - timedelta(days=7)
        period_label = "Last 7 Days"
    
    async with pool.acquire() as conn:
        # Get completed deliveries/tasks
        deliveries_result = await conn.fetchrow("""
            SELECT COUNT(*) as completed
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1
        """, start_date)
        deliveries_completed = deliveries_result['completed'] if deliveries_result else 0
        
        # Get total distance driven from completed tasks
        # Use actual tracked distance from tasks table
        distance_result = await conn.fetchrow("""
            SELECT SUM(estimated_distance_km) as total_distance
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1
        """, start_date)
        total_distance = distance_result['total_distance'] if distance_result and distance_result['total_distance'] else 0
        
        # Calculate average delivery time
        avg_time_result = await conn.fetchrow("""
            SELECT 
                AVG(EXTRACT(EPOCH FROM (actual_end - actual_start)) / 3600) as avg_hours
            FROM tasks
            WHERE status = 'completed'
            AND actual_start IS NOT NULL
            AND actual_end IS NOT NULL
            AND actual_end >= $1
        """, start_date)
        avg_delivery_time_hours = avg_time_result['avg_hours'] if avg_time_result and avg_time_result['avg_hours'] else 0
        
        # Calculate on-time delivery rate
        # Assuming tasks have a scheduled end time
        ontime_result = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_completed,
                SUM(CASE 
                    WHEN actual_end <= scheduled_end THEN 1 
                    ELSE 0 
                END) as ontime_count
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1
            AND scheduled_end IS NOT NULL
        """, start_date)
        
        total_completed = ontime_result['total_completed'] if ontime_result else 0
        ontime_count = ontime_result['ontime_count'] if ontime_result and ontime_result['ontime_count'] else 0
        ontime_rate = (ontime_count / total_completed * 100) if total_completed > 0 else 100
        
        # Calculate vehicle utilization (% of time vehicles are in use)
        utilization_result = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_vehicles,
                SUM(CASE WHEN status = 'in_use' THEN 1 ELSE 0 END) as in_use_count
            FROM assets
            WHERE asset_type IN ('vehicle', 'truck', 'van', 'car')
        """)
        
        total_vehicles = utilization_result['total_vehicles'] if utilization_result else 0
        in_use_count = utilization_result['in_use_count'] if utilization_result else 0
        vehicle_utilization = (in_use_count / total_vehicles * 100) if total_vehicles > 0 else 0
        
        return {
            "period": period_label,
            "period_code": period,
            "start_date": start_date.isoformat(),
            "deliveries_completed": deliveries_completed,
            "total_distance_km": round(total_distance, 1),
            "avg_delivery_time_hours": round(avg_delivery_time_hours, 2),
            "ontime_delivery_rate": round(ontime_rate, 1),
            "vehicle_utilization": round(vehicle_utilization, 1),
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/summary")
async def get_metrics_summary(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """
    Get a summary of key metrics for the dashboard.
    Combines resource status and recent performance data.
    """
    pool = await get_pool(request.app)
    
    # Get resource status and performance metrics
    resource_status = await get_resource_status(request, _user)
    performance = await get_performance_metrics(request, "7days", _user)
    
    async with pool.acquire() as conn:
        # Get active incidents count
        incidents_result = await conn.fetchrow("""
            SELECT COUNT(*) as active_incidents
            FROM incidents
            WHERE status IN ('open', 'in_progress')
        """)
        active_incidents = incidents_result['active_incidents'] if incidents_result else 0
        
        # Get active tasks count
        tasks_result = await conn.fetchrow("""
            SELECT COUNT(*) as active_tasks
            FROM tasks
            WHERE status IN ('active', 'in_progress')
        """)
        active_tasks = tasks_result['active_tasks'] if tasks_result else 0
        
        return {
            "resource_status": resource_status,
            "performance_7days": performance,
            "active_incidents": active_incidents,
            "active_tasks": active_tasks,
            "timestamp": datetime.utcnow().isoformat()
        }
