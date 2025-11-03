"""
Pydantic models for API request/response schemas.
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime


class GeofenceIn(BaseModel):
    id: Optional[str] = None
    name: str
    polygon: List[List[float]] = Field(..., description="[[lat,lon], ...]")

    @validator('polygon')
    def validate_polygon(cls, v):
        if len(v) < 3:
            raise ValueError('Polygon must have at least 3 points')
        for point in v:
            if len(point) != 2:
                raise ValueError('Each point must have [lat, lon]')
            lat, lon = point
            if not -90 <= lat <= 90:
                raise ValueError(f'Invalid latitude: {lat}')
            if not -180 <= lon <= 180:
                raise ValueError(f'Invalid longitude: {lon}')
        return v


class BaseIn(BaseModel):
    id: Optional[str] = None
    name: str
    type: str = Field(..., description="logistics, military, airfield, storage")
    lat: float
    lon: float
    capacity: Optional[int] = None
    assets_stored: Optional[List[str]] = None
    description: Optional[str] = None


class AssetIn(BaseModel):
    id: Optional[str] = None
    type: str = Field(..., description="vehicle, uav, truck, helicopter, plane")
    lat: float
    lon: float
    route: str = "stationary"
    route_index: float = 0.0
    speed: float = 0.0
    status: Literal["mobile", "parked", "airborne"]
    battery: Optional[float] = None
    battery_drain: float = 0.0
    has_battery: bool = False
    fuel_type: Literal["electric", "diesel", "aviation", "jet", "gasoline"]
    capacity: Optional[int] = None
    assets_stored: Optional[List[str]] = None


class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    access_token: str
    role: str


# NEW: Mission models
class Waypoint(BaseModel):
    lat: float
    lon: float
    name: Optional[str] = None
    action: Optional[str] = None  # e.g., "pickup", "dropoff", "refuel", "patrol"


class MissionIn(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    asset_id: Optional[str] = None
    waypoints: List[Waypoint] = Field(..., min_items=2, description="At least 2 waypoints required")
    status: Literal["planned", "active", "completed", "cancelled"] = "planned"
    priority: Literal["low", "medium", "high", "critical"] = "medium"

    @validator('waypoints')
    def validate_waypoints(cls, v):
        if len(v) < 2:
            raise ValueError('Mission must have at least 2 waypoints')
        for wp in v:
            if not -90 <= wp.lat <= 90:
                raise ValueError(f'Invalid latitude: {wp.lat}')
            if not -180 <= wp.lon <= 180:
                raise ValueError(f'Invalid longitude: {wp.lon}')
        return v


class MissionOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    asset_id: Optional[str]
    waypoints: List[dict]
    status: str
    priority: str
    estimated_duration_minutes: Optional[int]
    estimated_fuel_consumption: Optional[float]
    total_distance_km: Optional[float]
    created_at: datetime
    started_at: Optional[datetime]
    completed_at: Optional[datetime]