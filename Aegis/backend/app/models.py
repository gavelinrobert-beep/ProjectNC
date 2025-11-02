"""
Pydantic models for API request/response schemas.
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal


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


class AssetIn(BaseModel):
    id: Optional[str] = None
    type: str = Field(..., description="vehicle, uav, truck, helicopter, plane")
    lat: float
    lon: float
    route: str = "stationary"
    route_index: float = 0.0
    speed: float = 0.0
    status: Literal["mobile", "parked", "airborne"]  # ← Use Literal
    battery: Optional[float] = None
    battery_drain: float = 0.0
    has_battery: bool = False
    fuel_type: Literal["electric", "diesel", "aviation", "jet", "gasoline"]  # ← Use Literal
    capacity: Optional[int] = None
    assets_stored: Optional[List[str]] = None


class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    access_token: str
    role: str