"""
Road routing API using OpenRouteService for realistic vehicle movement.
Falls back to straight-line routing if API key is not configured.
"""
import os
import math
from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import httpx

router = APIRouter(prefix="/api/routing", tags=["routing"])

OPENROUTESERVICE_API_KEY = os.getenv("OPENROUTESERVICE_API_KEY", "")
ORS_URL = "https://api.openrouteservice.org/v2/directions/driving-car"


class Waypoint(BaseModel):
    """A geographic coordinate point"""
    lat: float
    lon: float


class RouteRequest(BaseModel):
    """Request for road routing between waypoints"""
    waypoints: List[Waypoint]


class RouteResponse(BaseModel):
    """Response containing road coordinates and metadata"""
    coordinates: List[List[float]]  # [[lon, lat], [lon, lat], ...]
    distance_km: float
    duration_minutes: float
    source: str  # "openrouteservice" or "straight_line"


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula (in km)"""
    R = 6371  # Earth's radius in km

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c


def generate_straight_line_route(waypoints: List[Waypoint]) -> RouteResponse:
    """Generate a straight-line fallback route when API is not available"""
    total_distance = 0.0
    coordinates = []
    
    for i, wp in enumerate(waypoints):
        coordinates.append([wp.lon, wp.lat])
        
        if i < len(waypoints) - 1:
            next_wp = waypoints[i + 1]
            total_distance += calculate_distance(wp.lat, wp.lon, next_wp.lat, next_wp.lon)
    
    # Estimate duration assuming 60 km/h average speed
    duration_minutes = int((total_distance / 60.0) * 60)
    
    return RouteResponse(
        coordinates=coordinates,
        distance_km=round(total_distance, 2),
        duration_minutes=duration_minutes,
        source="straight_line"
    )


async def fetch_ors_route(waypoints: List[Waypoint]) -> Optional[RouteResponse]:
    """Fetch route from OpenRouteService API"""
    if not OPENROUTESERVICE_API_KEY:
        return None
    
    # Convert waypoints to ORS format: [[lon, lat], [lon, lat], ...]
    coordinates = [[wp.lon, wp.lat] for wp in waypoints]
    
    headers = {
        "Authorization": OPENROUTESERVICE_API_KEY,
        "Content-Type": "application/json"
    }
    
    payload = {
        "coordinates": coordinates,
        "preference": "recommended",
        "units": "km",
        "language": "en",
        "geometry": "true",
        "instructions": "false"
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(ORS_URL, json=payload, headers=headers)
            response.raise_for_status()
            data = response.json()
        
        # Extract route data
        route = data["routes"][0]
        geometry = route["geometry"]["coordinates"]  # [[lon, lat], ...]
        distance_km = route["summary"]["distance"]  # Already in km
        duration_sec = route["summary"]["duration"]  # In seconds
        duration_minutes = int(duration_sec / 60)
        
        return RouteResponse(
            coordinates=geometry,
            distance_km=round(distance_km, 2),
            duration_minutes=duration_minutes,
            source="openrouteservice"
        )
    
    except httpx.HTTPStatusError as e:
        print(f"[ROUTING] OpenRouteService HTTP error: {e.response.status_code}")
        return None
    except Exception as e:
        print(f"[ROUTING] OpenRouteService error: {str(e)}")
        return None


@router.post("/route", response_model=RouteResponse)
async def get_route(request: RouteRequest):
    """
    POST /api/routing/route
    
    Get road routing between waypoints using OpenRouteService.
    Falls back to straight-line routing if API key is not configured.
    
    Request body:
    {
        "waypoints": [
            {"lat": 59.3293, "lon": 18.0686},
            {"lat": 57.7089, "lon": 11.9746}
        ]
    }
    
    Response:
    {
        "coordinates": [[18.0686, 59.3293], [11.9746, 57.7089], ...],
        "distance_km": 470.5,
        "duration_minutes": 282,
        "source": "openrouteservice"
    }
    """
    if len(request.waypoints) < 2:
        raise HTTPException(status_code=400, detail="At least 2 waypoints required")
    
    # Try OpenRouteService first
    if OPENROUTESERVICE_API_KEY:
        print(f"[ROUTING] Attempting OpenRouteService API for {len(request.waypoints)} waypoints")
        ors_result = await fetch_ors_route(request.waypoints)
        if ors_result:
            print(f"[ROUTING] Success via OpenRouteService: {ors_result.distance_km} km")
            return ors_result
        print("[ROUTING] OpenRouteService failed, falling back to straight line")
    else:
        print("[ROUTING] No API key configured, using straight line")
    
    # Fallback to straight line
    result = generate_straight_line_route(request.waypoints)
    print(f"[ROUTING] Straight line route: {result.distance_km} km")
    return result
