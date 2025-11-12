from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import random
import json

router = APIRouter()


class SimulationEvent(BaseModel):
    event_type: str
    event_category: str
    title: str
    description: Optional[str] = None
    severity: str = "info"
    base_id: Optional[int] = None
    asset_id: Optional[int] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    data: Optional[Dict[str, Any]] = None


class SimulationConfig(BaseModel):
    config_key: str
    config_value: str


# Get simulation dashboard
@router.get("/dashboard")
async def get_simulation_dashboard(request: Request):
    """Get simulation overview and statistics"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            # Get recent events
            recent_events = await conn.fetch("""
                SELECT * FROM simulation_events
                ORDER BY occurred_at DESC
                LIMIT 20
            """)

            # Get event counts by category
            event_counts = await conn.fetch("""
                SELECT event_category, COUNT(*) as count
                FROM simulation_events
                WHERE occurred_at > NOW() - INTERVAL '24 hours'
                GROUP BY event_category
            """)

            # Get unresolved events
            unresolved = await conn.fetch("""
                SELECT * FROM simulation_events
                WHERE resolved = FALSE
                ORDER BY 
                    CASE severity
                        WHEN 'critical' THEN 1
                        WHEN 'high' THEN 2
                        WHEN 'medium' THEN 3
                        WHEN 'low' THEN 4
                        WHEN 'info' THEN 5
                    END,
                    occurred_at DESC
                LIMIT 10
            """)

            # Get simulation config
            config = await conn.fetch("SELECT * FROM simulation_config")

            # Get pending maintenance
            maintenance = await conn.fetch("""
                SELECT m.*, a.id as asset_id, a.type as asset_type
                FROM maintenance_schedule m
                LEFT JOIN assets a ON m.asset_id::text = a.id::text
                WHERE m.completed = FALSE
                ORDER BY m.scheduled_date
                LIMIT 10
            """)

            return {
                "recent_events": [dict(row) for row in recent_events],
                "event_counts": {row['event_category']: row['count'] for row in event_counts},
                "unresolved_events": [dict(row) for row in unresolved],
                "config": {row['config_key']: row['config_value'] for row in config},
                "pending_maintenance": [dict(row) for row in maintenance]
            }
    except Exception as e:
        print(f"Dashboard error: {e}")
        return {
            "recent_events": [],
            "event_counts": {},
            "unresolved_events": [],
            "config": {},
            "pending_maintenance": []
        }


# Get all events
@router.get("/events")
async def get_events(
        request: Request,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        resolved: Optional[bool] = None,
        limit: int = 50
):
    """Get simulation events with filters"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            query = "SELECT * FROM simulation_events WHERE 1=1"
            params = []
            param_count = 1

            if category:
                query += f" AND event_category = ${param_count}"
                params.append(category)
                param_count += 1

            if severity:
                query += f" AND severity = ${param_count}"
                params.append(severity)
                param_count += 1

            if resolved is not None:
                query += f" AND resolved = ${param_count}"
                params.append(resolved)
                param_count += 1

            query += f" ORDER BY occurred_at DESC LIMIT ${param_count}"
            params.append(limit)

            rows = await conn.fetch(query, *params)
            return {"events": [dict(row) for row in rows]}
    except Exception as e:
        print(f"Error fetching events: {e}")
        return {"events": []}


# Create simulation event
@router.post("/events")
async def create_event(event: SimulationEvent, request: Request):
    """Create a new simulation event"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO simulation_events 
                (event_type, event_category, title, description, severity, 
                 base_id, asset_id, location_lat, location_lon, data)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING id, occurred_at
            """, event.event_type, event.event_category, event.title, event.description,
                                      event.severity, event.base_id, event.asset_id, event.location_lat,
                                      event.location_lon, json.dumps(event.data) if event.data else None)

            return {
                "success": True,
                "id": row['id'],
                "occurred_at": row['occurred_at'].isoformat()
            }
    except Exception as e:
        print(f"Error creating event: {e}")
        return {"success": False, "error": str(e)}


# Resolve event
@router.put("/events/{event_id}/resolve")
async def resolve_event(event_id: int, request: Request):
    """Mark an event as resolved"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE simulation_events 
                SET resolved = TRUE, resolved_at = NOW()
                WHERE id = $1
            """, event_id)

            return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# Get simulation config
@router.get("/config")
async def get_config(request: Request):
    """Get simulation configuration"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            rows = await conn.fetch("SELECT * FROM simulation_config")
            return {"config": {row['config_key']: row['config_value'] for row in rows}}
    except Exception as e:
        print(f"Error fetching config: {e}")
        return {"config": {}}


# Update simulation config
@router.put("/config")
async def update_config(config: SimulationConfig, request: Request):
    """Update simulation configuration"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            await conn.execute("""
                INSERT INTO simulation_config (config_key, config_value, updated_at)
                VALUES ($1, $2, NOW())
                ON CONFLICT (config_key) 
                DO UPDATE SET config_value = $2, updated_at = NOW()
            """, config.config_key, config.config_value)

            return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# Trigger weather event
@router.post("/trigger/weather")
async def trigger_weather_event(request: Request):
    """Manually trigger a weather event"""
    weather_types = [
        {
            "type": "sandstorm",
            "title": "Severe Sandstorm Warning",
            "description": "Intense sandstorm approaching. Visibility reduced to near zero. All air operations suspended. Personnel advised to seek shelter.",
            "severity": "high"
        },
        {
            "type": "thunderstorm",
            "title": "Thunderstorm Alert",
            "description": "Heavy thunderstorm with lightning detected. Outdoor operations restricted. Equipment securing protocols activated.",
            "severity": "medium"
        },
        {
            "type": "extreme_heat",
            "title": "Extreme Heat Advisory",
            "description": "Temperature exceeding 45C. Heat exhaustion risk elevated. Mandatory hydration protocols in effect.",
            "severity": "medium"
        },
        {
            "type": "fog",
            "title": "Dense Fog Conditions",
            "description": "Heavy fog reducing visibility below 100m. Air traffic delayed. Ground operations proceed with caution.",
            "severity": "low"
        }
    ]

    weather = random.choice(weather_types)

    event = SimulationEvent(
        event_type=weather["type"],
        event_category="weather",
        title=weather["title"],
        description=weather["description"],
        severity=weather["severity"],
        location_lat=35.0 + random.uniform(-2, 2),
        location_lon=40.0 + random.uniform(-2, 2)
    )

    return await create_event(event, request)


# Trigger supply event
@router.post("/trigger/supply")
async def trigger_supply_event(request: Request):
    """Manually trigger a supply chain event"""
    supply_events = [
        {
            "type": "shortage",
            "title": "Critical Fuel Shortage",
            "description": "Fuel reserves below 20% at Base Alpha. Emergency resupply requested. Non-essential vehicle operations suspended.",
            "severity": "critical"
        },
        {
            "type": "shortage",
            "title": "Medical Supply Low",
            "description": "Medical supplies running low. Trauma kits at 30% capacity. Resupply convoy en route, ETA 6 hours.",
            "severity": "high"
        },
        {
            "type": "resupply",
            "title": "Resupply Convoy Arrived",
            "description": "Supply convoy successfully delivered: 5000L fuel, 200 MREs, medical supplies, ammunition. Inventory updated.",
            "severity": "info"
        },
        {
            "type": "shortage",
            "title": "Ammunition Stock Alert",
            "description": "Ammunition reserves at 40%. Training exercises reduced. Resupply scheduled within 48 hours.",
            "severity": "medium"
        }
    ]

    supply = random.choice(supply_events)

    event = SimulationEvent(
        event_type=supply["type"],
        event_category="supply",
        title=supply["title"],
        description=supply["description"],
        severity=supply["severity"]
    )

    return await create_event(event, request)


# Trigger maintenance event
@router.post("/trigger/maintenance")
async def trigger_maintenance_event(request: Request):
    """Manually trigger a maintenance event"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            # Get a random asset
            asset = await conn.fetchrow("""
                SELECT id, type FROM assets 
                WHERE status = 'operational'
                ORDER BY RANDOM()
                LIMIT 1
            """)

            if not asset:
                return {"success": False, "error": "No operational assets found"}

            maintenance_types = [
                {
                    "type": "scheduled",
                    "title": f"Scheduled Maintenance: {asset['id']}",
                    "description": f"Routine maintenance required for {asset['type']} {asset['id']}. Service interval reached. Estimated downtime: 4 hours.",
                    "severity": "low"
                },
                {
                    "type": "urgent",
                    "title": f"Urgent Repair: {asset['id']}",
                    "description": f"Mechanical issue detected on {asset['type']} {asset['id']}. Immediate attention required. Asset temporarily offline.",
                    "severity": "high"
                },
                {
                    "type": "inspection",
                    "title": f"Safety Inspection: {asset['id']}",
                    "description": f"Mandatory safety inspection due for {asset['type']} {asset['id']}. Compliance check required within 24 hours.",
                    "severity": "medium"
                }
            ]

            maint = random.choice(maintenance_types)

            # Schedule maintenance
            await conn.execute("""
                INSERT INTO maintenance_schedule 
                (asset_id, maintenance_type, scheduled_date, notes)
                VALUES ($1, $2, NOW() + INTERVAL '2 hours', $3)
            """, asset['id'], maint['type'], maint['description'])

            # Create event
            event = SimulationEvent(
                event_type=maint["type"],
                event_category="maintenance",
                title=maint["title"],
                description=maint["description"],
                severity=maint["severity"],
                asset_id=asset['id']
            )

            return await create_event(event, request)
    except Exception as e:
        return {"success": False, "error": str(e)}


# Trigger random event
@router.post("/trigger/random")
async def trigger_random_event(request: Request):
    """Trigger a random simulation event"""
    event_type = random.choice(["weather", "supply", "maintenance", "operational"])

    if event_type == "weather":
        return await trigger_weather_event(request)
    elif event_type == "supply":
        return await trigger_supply_event(request)
    elif event_type == "maintenance":
        return await trigger_maintenance_event(request)
    else:
        # Operational events
        operational_events = [
            {
                "category": "operational",
                "type": "equipment_failure",
                "title": "Communication Equipment Failure",
                "description": "Primary radio system experiencing intermittent failures. Backup systems activated. Technicians investigating.",
                "severity": "medium"
            },
            {
                "category": "operational",
                "type": "personnel",
                "title": "Staff Shortage Alert",
                "description": "Multiple personnel on medical leave. Shift coverage adjusted. Operations continue at reduced capacity.",
                "severity": "medium"
            },
            {
                "category": "operational",
                "type": "success",
                "title": "Training Exercise Complete",
                "description": "Combined arms training exercise successfully completed. All objectives met. Performance ratings: Excellent.",
                "severity": "info"
            }
        ]

        op_event = random.choice(operational_events)

        event = SimulationEvent(
            event_type=op_event["type"],
            event_category=op_event["category"],
            title=op_event["title"],
            description=op_event["description"],
            severity=op_event["severity"]
        )

        return await create_event(event, request)


# Get maintenance schedule
@router.get("/maintenance")
async def get_maintenance(request: Request, completed: Optional[bool] = None):
    """Get maintenance schedule"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            query = """
                SELECT m.*, a.id as asset_id, a.type as asset_type
                FROM maintenance_schedule m
                LEFT JOIN assets a ON m.asset_id::text = a.id::text
            """

            if completed is not None:
                query += f" WHERE m.completed = ${1}"
                rows = await conn.fetch(query + " ORDER BY m.scheduled_date", completed)
            else:
                rows = await conn.fetch(query + " ORDER BY m.scheduled_date")

            return {"maintenance": [dict(row) for row in rows]}
    except Exception as e:
        print(f"Error fetching maintenance: {e}")
        return {"maintenance": []}