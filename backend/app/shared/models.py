"""
Shared Pydantic models used across multiple modules.
Includes authentication, tasks, geofences, and incident models.
Also re-exports module-specific models for backward compatibility.
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime, date

# Import module-specific models for re-export
from ..logistics.models import (
    CustomerIn, CustomerOut,
    ShipmentIn, ShipmentOut, ShipmentEvent, ProofOfDelivery, ShipmentItem
)
from ..fleet.models import (
    DriverIn, DriverOut, DriverHoursLog,
    AssetIn, AssetOut
)
from ..sites.models import (
    FacilityIn, FacilityOut, BaseIn,
    InventoryItemIn, InventoryItemOut,
    InventoryTransactionIn, InventoryTransactionOut
)


# ============================================================================
# AUTHENTICATION MODELS
# ============================================================================

class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    access_token: str
    role: str
    user_id: Optional[str] = None
    name: Optional[str] = None


class UserIn(BaseModel):
    """User model for database storage"""
    id: Optional[str] = None
    email: str
    password_hash: str
    first_name: str
    last_name: str
    role: Literal["admin", "dispatcher", "driver", "manager", "viewer", "customer"] = "viewer"
    phone: Optional[str] = None
    facility_id: Optional[str] = None  # Home facility/office
    driver_id: Optional[str] = None  # Link to Driver record if applicable
    active: bool = True


class UserOut(BaseModel):
    """User output model (no password)"""
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    phone: Optional[str]
    facility_id: Optional[str]
    driver_id: Optional[str]
    active: bool
    created_at: Optional[datetime]
    last_login: Optional[datetime]


# ============================================================================
# TASK/WORK ORDER MODELS
# ============================================================================

class Waypoint(BaseModel):
    lat: float
    lon: float
    name: Optional[str] = None
    action: Optional[str] = Field(None, description="pickup, delivery, service, inspection")
    estimated_duration_minutes: Optional[int] = None
    customer_id: Optional[str] = None
    shipment_ids: Optional[List[str]] = None  # Shipments to handle at this waypoint


class TaskIn(BaseModel):
    """Task (work order, delivery route) input model"""
    id: Optional[str] = None
    name: str
    description: Optional[str] = None

    # Assignment
    assigned_vehicle_id: Optional[str] = None
    assigned_driver_id: Optional[str] = None

    # Route and timing
    waypoints: List[Waypoint] = Field(..., min_items=1, description="At least 1 waypoint required")
    estimated_duration_minutes: Optional[int] = None
    estimated_distance_km: Optional[float] = None

    # Status and priority
    status: Literal["planned", "assigned", "in_progress", "completed", "cancelled", "failed"] = "planned"
    priority: Literal["low", "normal", "high", "urgent"] = "normal"

    # Task type
    task_type: Literal["delivery", "pickup", "transfer", "service", "inspection", "multi_stop"] = "delivery"

    # Facilities involved
    source_facility_id: Optional[str] = None
    destination_facility_id: Optional[str] = None

    # Shipments linked to this task
    shipment_ids: Optional[List[str]] = None

    # Timing
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None

    notes: Optional[str] = None

    # Legacy fields for compatibility
    asset_id: Optional[str] = None  # Same as assigned_vehicle_id
    mission_type: Optional[str] = None
    source_base_id: Optional[str] = None
    destination_base_id: Optional[str] = None
    transfer_items: Optional[List[dict]] = None

    @validator('waypoints')
    def validate_waypoints(cls, v):
        if len(v) < 1:
            raise ValueError('Task must have at least 1 waypoint')
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
    assigned_vehicle_id: Optional[str]
    assigned_driver_id: Optional[str]
    waypoints: List[Waypoint]
    estimated_duration_minutes: Optional[int]
    estimated_distance_km: Optional[float]
    status: str
    priority: str
    task_type: str
    source_facility_id: Optional[str]
    destination_facility_id: Optional[str]
    shipment_ids: Optional[List[str]]
    scheduled_start: Optional[datetime]
    scheduled_end: Optional[datetime]
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    # Legacy compatibility
    asset_id: Optional[str]
    mission_type: Optional[str]
    source_base_id: Optional[str]
    destination_base_id: Optional[str]


# Legacy alias for backward compatibility
class MissionIn(TaskIn):
    """Legacy alias for TaskIn - DEPRECATED"""
    pass


class MissionOut(TaskOut):
    """Legacy alias for TaskOut - DEPRECATED"""
    pass


# ============================================================================
# GEOFENCE MODELS
# ============================================================================

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


# ============================================================================
# INCIDENT/EXCEPTION MODELS
# ============================================================================

class IncidentIn(BaseModel):
    """Incident/Exception reporting for MSB and logistics operations"""
    id: Optional[str] = None
    incident_type: Literal["accident", "breakdown", "delay", "theft", "damage", "safety",
                           "security", "environmental", "customer_complaint", "other"]
    severity: Literal["low", "medium", "high", "critical"] = "medium"

    title: str
    description: str

    # Location
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    location_description: Optional[str] = None
    facility_id: Optional[str] = None

    # Involved parties
    reported_by_user_id: str
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    customer_id: Optional[str] = None
    shipment_ids: Optional[List[str]] = None

    # Status and resolution
    status: Literal["reported", "acknowledged", "investigating", "resolved", "closed"] = "reported"
    resolution_notes: Optional[str] = None

    # Media
    photo_urls: Optional[List[str]] = None
    document_urls: Optional[List[str]] = None

    # Follow-up
    requires_followup: bool = False
    assigned_to_user_id: Optional[str] = None

    reported_at: datetime
    resolved_at: Optional[datetime] = None


class IncidentOut(BaseModel):
    """Incident output model"""
    id: str
    incident_type: str
    severity: str
    title: str
    description: str
    location_lat: Optional[float]
    location_lon: Optional[float]
    location_description: Optional[str]
    facility_id: Optional[str]
    reported_by_user_id: str
    vehicle_id: Optional[str]
    driver_id: Optional[str]
    customer_id: Optional[str]
    shipment_ids: Optional[List[str]]
    status: str
    resolution_notes: Optional[str]
    photo_urls: Optional[List[str]]
    document_urls: Optional[List[str]]
    requires_followup: bool
    assigned_to_user_id: Optional[str]
    reported_at: datetime
    resolved_at: Optional[datetime]
    created_at: Optional[datetime]
