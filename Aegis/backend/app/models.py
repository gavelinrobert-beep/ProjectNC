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


class FacilityIn(BaseModel):
    """Facility (location, depot, distribution center) input model"""
    id: Optional[str] = None
    name: str
    type: str = Field(..., description="distribution_center, warehouse, depot, service_center, office")
    lat: float
    lon: float
    capacity: Optional[int] = None
    assets_stored: Optional[List[str]] = None
    description: Optional[str] = None


# Alias for backward compatibility
class BaseIn(BaseModel):
    """Legacy alias for FacilityIn"""
    id: Optional[str] = None
    name: str
    type: str = Field(..., description="distribution_center, warehouse, depot, service_center, office")
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
    status: Literal["mobile", "parked", "airborne", "returning", "refueling", "maintenance"]
    battery: Optional[float] = None
    battery_drain: float = 0.0
    has_battery: bool = False
    fuel_type: Literal["electric", "diesel", "aviation", "jet", "gasoline"]
    capacity: Optional[int] = None
    assets_stored: Optional[List[str]] = None

    # NEW: Fuel Management Fields
    fuel_level: Optional[float] = Field(default=100.0, ge=0, le=100, description="Current fuel percentage")
    fuel_capacity: Optional[float] = Field(default=1000.0, description="Fuel tank capacity in liters")
    fuel_consumption_rate: Optional[float] = Field(default=1.0, description="Liters per km")

    # NEW: Maintenance Fields
    operating_hours: Optional[float] = Field(default=0.0, description="Total hours in operation")
    maintenance_hours: Optional[float] = Field(default=100.0, description="Hours until maintenance required")
    last_maintenance: Optional[str] = None
    maintenance_status: Optional[Literal["operational", "needs_maintenance", "under_maintenance"]] = "operational"

    # Home Facility (updated terminology)
    home_facility_id: Optional[str] = None
    # Legacy field name for compatibility
    home_base_id: Optional[str] = None


class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    access_token: str
    role: str


# Task models (work orders, assignments)
class Waypoint(BaseModel):
    lat: float
    lon: float
    name: Optional[str] = None
    action: Optional[str] = None


class TaskIn(BaseModel):
    """Task (work order, assignment) input model"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    asset_id: Optional[str] = None
    waypoints: List[Waypoint] = Field(..., min_items=2, description="At least 2 waypoints required")
    status: Literal["planned", "active", "completed", "cancelled"] = "planned"
    priority: Literal["low", "medium", "high", "critical"] = "medium"

    # Task type and transfer fields
    task_type: Optional[Literal["delivery", "pickup", "service", "inspection", "transport"]] = "delivery"
    source_facility_id: Optional[str] = None
    destination_facility_id: Optional[str] = None
    transfer_items: Optional[List[dict]] = None
    
    # Legacy field names for compatibility
    mission_type: Optional[str] = None
    source_base_id: Optional[str] = None
    destination_base_id: Optional[str] = None

    @validator('waypoints')
    def validate_waypoints(cls, v):
        if len(v) < 2:
            raise ValueError('Task must have at least 2 waypoints')
        for wp in v:
            if not -90 <= wp.lat <= 90:
                raise ValueError(f'Invalid latitude: {wp.lat}')
            if not -180 <= wp.lon <= 180:
                raise ValueError(f'Invalid longitude: {wp.lon}')
        return v


# Legacy alias for backward compatibility
class MissionIn(BaseModel):
    """Legacy alias for TaskIn"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None
    asset_id: Optional[str] = None
    waypoints: List[Waypoint] = Field(..., min_items=2, description="At least 2 waypoints required")
    status: Literal["planned", "active", "completed", "cancelled"] = "planned"
    priority: Literal["low", "medium", "high", "critical"] = "medium"

    # Transfer fields
    mission_type: Optional[Literal["patrol", "transfer", "reconnaissance", "supply", "delivery", "pickup", "service", "inspection", "transport"]] = "patrol"
    source_base_id: Optional[str] = None
    destination_base_id: Optional[str] = None
    transfer_items: Optional[List[dict]] = None

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

class TaskOut(BaseModel):
    """Task output model"""
    id: str
    name: str
    description: Optional[str]
    asset_id: Optional[str]
    waypoints: List[Waypoint]
    status: str
    priority: str
    created_at: Optional[datetime]

    # Task type and transfer fields
    task_type: Optional[str] = "delivery"
    source_facility_id: Optional[str] = None
    destination_facility_id: Optional[str] = None
    transfer_items: Optional[List[dict]] = None
    
    # Legacy field names for compatibility
    mission_type: Optional[str] = None
    source_base_id: Optional[str] = None
    destination_base_id: Optional[str] = None


# Legacy alias
class MissionOut(BaseModel):
    """Legacy alias for TaskOut"""
    id: str
    name: str
    description: Optional[str]
    asset_id: Optional[str]
    waypoints: List[Waypoint]
    status: str
    priority: str
    created_at: Optional[datetime]

    # Transfer fields
    mission_type: Optional[str] = "patrol"
    source_base_id: Optional[str] = None
    destination_base_id: Optional[str] = None
    transfer_items: Optional[List[dict]] = None


# Inventory models
class InventoryItemIn(BaseModel):
    id: Optional[str] = None
    name: str
    type: str = Field(..., description="fuel, ammunition, medical, food, spare_parts, equipment")
    category: str = Field(..., description="consumable, equipment, ammunition, medical, etc.")
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., description="liters, kg, units, boxes, etc.")
    weight_per_unit: Optional[float] = Field(None, ge=0, description="Weight in kg")
    volume_per_unit: Optional[float] = Field(None, ge=0, description="Volume in cubic meters")
    location_type: Literal["facility", "asset", "base"] = "facility"  # "base" for backward compatibility
    location_id: str
    min_stock_level: Optional[float] = Field(default=0, ge=0)
    max_stock_level: Optional[float] = None
    expiration_date: Optional[str] = None
    description: Optional[str] = None


class InventoryItemOut(BaseModel):
    id: str
    name: str
    type: str
    category: str
    quantity: float
    unit: str
    weight_per_unit: Optional[float]
    volume_per_unit: Optional[float]
    location_type: str
    location_id: str
    min_stock_level: float
    max_stock_level: Optional[float]
    expiration_date: Optional[str]
    description: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class InventoryTransactionIn(BaseModel):
    item_id: str
    transaction_type: Literal["add", "remove", "transfer", "consume", "restock"]
    quantity: float = Field(..., gt=0)
    from_location_type: Optional[Literal["base", "asset"]] = None
    from_location_id: Optional[str] = None
    to_location_type: Optional[Literal["base", "asset"]] = None
    to_location_id: Optional[str] = None
    asset_id: Optional[str] = None
    notes: Optional[str] = None


class InventoryTransactionOut(BaseModel):
    id: int
    item_id: str
    transaction_type: str
    quantity: float
    from_location_type: Optional[str]
    from_location_id: Optional[str]
    to_location_type: Optional[str]
    to_location_id: Optional[str]
    asset_id: Optional[str]
    user_email: Optional[str]
    notes: Optional[str]
    timestamp: datetime