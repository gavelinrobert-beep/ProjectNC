"""
Metrics API endpoints for dashboard widgets and performance tracking.
Provides resource status, performance metrics, and other analytics data.
"""
from fastapi import APIRouter, Request, Depends
from typing import Optional
from datetime import datetime, timedelta
from ..shared.database import get_pool
from ..shared.auth import require_auth

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
    Now includes trend data comparing to previous period.
    """
    pool = await get_pool(request.app)
    
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "today":
        start_date = now.replace(hour=0, minute=0, second=0, microsecond=0)
        previous_start = start_date - timedelta(days=1)
        period_label = "Today"
    elif period == "30days":
        start_date = now - timedelta(days=30)
        previous_start = start_date - timedelta(days=30)
        period_label = "Last 30 Days"
    else:  # default to 7days
        start_date = now - timedelta(days=7)
        previous_start = start_date - timedelta(days=7)
        period_label = "Last 7 Days"
    
    async with pool.acquire() as conn:
        # Get completed deliveries/tasks for current period
        deliveries_result = await conn.fetchrow("""
            SELECT COUNT(*) as completed
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1
        """, start_date)
        deliveries_completed = deliveries_result['completed'] if deliveries_result else 0
        
        # Get previous period deliveries for trend
        prev_deliveries_result = await conn.fetchrow("""
            SELECT COUNT(*) as completed
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1 AND actual_end < $2
        """, previous_start, start_date)
        prev_deliveries = prev_deliveries_result['completed'] if prev_deliveries_result else 0
        
        # Get total distance driven from completed tasks
        distance_result = await conn.fetchrow("""
            SELECT SUM(estimated_distance_km) as total_distance
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1
        """, start_date)
        total_distance = distance_result['total_distance'] if distance_result and distance_result['total_distance'] else 0
        
        # Get previous period distance
        prev_distance_result = await conn.fetchrow("""
            SELECT SUM(estimated_distance_km) as total_distance
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1 AND actual_end < $2
        """, previous_start, start_date)
        prev_distance = prev_distance_result['total_distance'] if prev_distance_result and prev_distance_result['total_distance'] else 0
        
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
        
        # Get previous period avg time
        prev_avg_time_result = await conn.fetchrow("""
            SELECT 
                AVG(EXTRACT(EPOCH FROM (actual_end - actual_start)) / 3600) as avg_hours
            FROM tasks
            WHERE status = 'completed'
            AND actual_start IS NOT NULL
            AND actual_end IS NOT NULL
            AND actual_end >= $1 AND actual_end < $2
        """, previous_start, start_date)
        prev_avg_time = prev_avg_time_result['avg_hours'] if prev_avg_time_result and prev_avg_time_result['avg_hours'] else 0
        
        # Calculate on-time delivery rate
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
        
        # Get previous period on-time rate
        prev_ontime_result = await conn.fetchrow("""
            SELECT 
                COUNT(*) as total_completed,
                SUM(CASE 
                    WHEN actual_end <= scheduled_end THEN 1 
                    ELSE 0 
                END) as ontime_count
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1 AND actual_end < $2
            AND scheduled_end IS NOT NULL
        """, previous_start, start_date)
        
        prev_total = prev_ontime_result['total_completed'] if prev_ontime_result else 0
        prev_ontime = prev_ontime_result['ontime_count'] if prev_ontime_result and prev_ontime_result['ontime_count'] else 0
        prev_ontime_rate = (prev_ontime / prev_total * 100) if prev_total > 0 else 100
        
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
        
        # Calculate trend percentages
        def calculate_trend(current, previous):
            if previous == 0:
                return None if current == 0 else 100
            return round(((current - previous) / previous) * 100, 1)
        
        deliveries_trend = calculate_trend(deliveries_completed, prev_deliveries)
        distance_trend = calculate_trend(total_distance, prev_distance)
        # For avg delivery time, lower is better, so invert the trend
        avg_time_trend = calculate_trend(prev_avg_time, avg_delivery_time_hours) if prev_avg_time > 0 else None
        ontime_trend = round(ontime_rate - prev_ontime_rate, 1) if prev_total > 0 else None
        
        return {
            "period": period_label,
            "period_code": period,
            "start_date": start_date.isoformat(),
            "deliveries_completed": deliveries_completed,
            "deliveries_trend": deliveries_trend,
            "total_distance_km": round(total_distance, 1),
            "distance_trend": distance_trend,
            "avg_delivery_time_hours": round(avg_delivery_time_hours, 2),
            "avg_time_trend": avg_time_trend,
            "ontime_delivery_rate": round(ontime_rate, 1),
            "ontime_trend": ontime_trend,
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


@router.get("/live-operations")
async def get_live_operations(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """
    Get real-time operational status for live operations dashboard card.
    Returns counts of active drivers, routes, deliveries, and next ETA.
    """
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        # Get count of drivers on duty (active drivers with current shift started)
        drivers_result = await conn.fetchrow("""
            SELECT COUNT(*) as on_duty
            FROM drivers
            WHERE employment_status = 'active'
            AND current_shift_start IS NOT NULL
            AND current_shift_start > NOW() - INTERVAL '24 hours'
        """)
        drivers_on_duty = drivers_result['on_duty'] if drivers_result else 0
        
        # Get count of active routes (tasks that are in progress)
        active_routes_result = await conn.fetchrow("""
            SELECT COUNT(*) as active
            FROM tasks
            WHERE status IN ('active', 'in_progress')
        """)
        active_routes = active_routes_result['active'] if active_routes_result else 0
        
        # Get count of deliveries in progress (shipments in transit or out for delivery)
        deliveries_result = await conn.fetchrow("""
            SELECT COUNT(*) as in_progress
            FROM shipments
            WHERE status IN ('in_transit', 'out_for_delivery')
        """)
        deliveries_in_progress = deliveries_result['in_progress'] if deliveries_result else 0
        
        # Get next delivery ETA (earliest scheduled end time from active tasks)
        next_eta_result = await conn.fetchrow("""
            SELECT MIN(scheduled_end) as next_eta
            FROM tasks
            WHERE status IN ('active', 'in_progress')
            AND scheduled_end IS NOT NULL
            AND scheduled_end > NOW()
        """)
        
        next_delivery_eta = None
        if next_eta_result and next_eta_result['next_eta']:
            eta_time = next_eta_result['next_eta']
            # Calculate minutes until ETA
            time_diff = (eta_time - datetime.utcnow()).total_seconds() / 60
            if time_diff > 60:
                next_delivery_eta = f"{int(time_diff / 60)}h {int(time_diff % 60)}m"
            else:
                next_delivery_eta = f"{int(time_diff)}m"
        
        return {
            "drivers_on_duty": drivers_on_duty,
            "active_routes": active_routes,
            "deliveries_in_progress": deliveries_in_progress,
            "next_delivery_eta": next_delivery_eta,
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/performance/history")
async def get_performance_history(
    request: Request,
    period: str = "7days",  # Options: 7days, 30days
    _user: dict = Depends(require_auth)
):
    """
    Get historical performance metrics for trend charts.
    Returns daily data points: date, deliveries, distance_km, avg_time_hrs, on_time_rate
    """
    pool = await get_pool(request.app)
    
    # Calculate date range based on period
    now = datetime.utcnow()
    if period == "30days":
        start_date = now - timedelta(days=30)
        days = 30
    else:  # default to 7days
        start_date = now - timedelta(days=7)
        days = 7
    
    async with pool.acquire() as conn:
        # Get daily aggregated data
        history_data = await conn.fetch("""
            SELECT 
                DATE(actual_end) as date,
                COUNT(*) as deliveries,
                COALESCE(SUM(estimated_distance_km), 0) as distance_km,
                COALESCE(AVG(EXTRACT(EPOCH FROM (actual_end - actual_start)) / 3600), 0) as avg_time_hrs,
                COALESCE(
                    SUM(CASE WHEN actual_end <= scheduled_end THEN 1 ELSE 0 END)::float / 
                    NULLIF(COUNT(*), 0) * 100, 
                    0
                ) as on_time_rate
            FROM tasks
            WHERE status = 'completed'
            AND actual_end >= $1
            AND actual_start IS NOT NULL
            AND actual_end IS NOT NULL
            GROUP BY DATE(actual_end)
            ORDER BY DATE(actual_end)
        """, start_date)
        
        # Convert to list of dictionaries
        history = []
        for row in history_data:
            history.append({
                "date": row['date'].isoformat() if row['date'] else None,
                "deliveries": row['deliveries'],
                "distance_km": round(float(row['distance_km']), 1),
                "avg_time_hrs": round(float(row['avg_time_hrs']), 2),
                "on_time_rate": round(float(row['on_time_rate']), 1)
            })
        
        return {
            "period": period,
            "start_date": start_date.isoformat(),
            "end_date": now.isoformat(),
            "history": history,
            "timestamp": datetime.utcnow().isoformat()
        }


@router.get("/fleet/utilization-history")
async def get_fleet_utilization_history(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """
    Get fleet utilization history for the last 7 days with hourly snapshots.
    Returns vehicle status distribution over time.
    """
    pool = await get_pool(request.app)
    
    # For now, return current status as we don't have historical tracking
    # In production, you would track status changes in a separate table
    now = datetime.utcnow()
    start_date = now - timedelta(days=7)
    
    async with pool.acquire() as conn:
        # Get current status distribution
        status_counts = await conn.fetch("""
            SELECT 
                status,
                COUNT(*) as count
            FROM assets
            WHERE asset_type IN ('vehicle', 'truck', 'van', 'car')
            GROUP BY status
        """)
        
        status_dict = {row['status']: row['count'] for row in status_counts}
        
        # Generate mock hourly data points for demonstration
        # In production, this would come from a status_history table
        history = []
        for day in range(7):
            current_date = start_date + timedelta(days=day)
            for hour in range(0, 24, 3):  # Every 3 hours
                timestamp = current_date + timedelta(hours=hour)
                history.append({
                    "timestamp": timestamp.isoformat(),
                    "in_use": status_dict.get('in_use', 0),
                    "available": status_dict.get('available', 0),
                    "maintenance": status_dict.get('maintenance', 0),
                    "parked": status_dict.get('parked', 0),
                    "out_of_service": status_dict.get('out_of_service', 0)
                })
        
        return {
            "period": "7days",
            "start_date": start_date.isoformat(),
            "end_date": now.isoformat(),
            "history": history,
            "timestamp": datetime.utcnow().isoformat()
        }
