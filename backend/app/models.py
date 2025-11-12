"""
Pydantic models for API request/response schemas.
UPDATED: Added core logistics models for commercial deployment (DHL, MSB, etc.)
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime, date


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
# FACILITY MODELS (formerly "Bases")
# ============================================================================

class FacilityIn(BaseModel):
    """Facility (warehouse, depot, distribution center) input model"""
    id: Optional[str] = None
    name: str
    type: str = Field(..., description="warehouse, distribution_center, depot, service_center, office, yard, transfer_station")
    lat: float
    lon: float
    capacity: Optional[int] = Field(None, description="Storage capacity in units or cubic meters")
    assets_stored: Optional[List[str]] = None
    description: Optional[str] = None

    # Contact and operational info
    contact_phone: Optional[str] = None
    contact_email: Optional[str] = None
    operating_hours: Optional[str] = Field(None, description="e.g., '06:00-22:00' or '24/7'")
    zone_code: Optional[str] = Field(None, description="Postal/delivery zone code")


class FacilityOut(BaseModel):
    """Facility output model"""
    id: str
    name: str
    type: str
    lat: float
    lon: float
    capacity: Optional[int]
    assets_stored: Optional[List[str]]
    description: Optional[str]
    contact_phone: Optional[str]
    contact_email: Optional[str]
    operating_hours: Optional[str]
    zone_code: Optional[str]
    created_at: Optional[datetime]


# Backward compatibility alias
class BaseIn(FacilityIn):
    """Legacy alias for FacilityIn - DEPRECATED"""
    pass


# ============================================================================
# CUSTOMER/CLIENT MODELS
# ============================================================================

class CustomerIn(BaseModel):
    """Customer/Client model for logistics operations"""
    id: Optional[str] = None
    name: str
    customer_type: Literal["business", "individual", "government", "municipality"] = "business"

    # Contact information
    contact_name: str
    contact_phone: str
    contact_email: str

    # Address
    address_street: str
    address_city: str
    address_postal_code: str
    address_country: str = "Sweden"
    delivery_lat: Optional[float] = None
    delivery_lon: Optional[float] = None

    # Business details
    organization_number: Optional[str] = Field(None, description="Swedishorg.nr or similar")
    billing_account: Optional[str] = None
    service_level: Literal["standard", "express", "same_day", "economy"] = "standard"

    # Access and delivery instructions
    access_instructions: Optional[str] = Field(None, description="Gate codes, delivery notes, etc.")
    preferred_delivery_window: Optional[str] = Field(None, description="e.g., '08:00-12:00'")

    notes: Optional[str] = None
    active: bool = True


class CustomerOut(BaseModel):
    """Customer output model"""
    id: str
    name: str
    customer_type: str
    contact_name: str
    contact_phone: str
    contact_email: str
    address_street: str
    address_city: str
    address_postal_code: str
    address_country: str
    delivery_lat: Optional[float]
    delivery_lon: Optional[float]
    organization_number: Optional[str]
    billing_account: Optional[str]
    service_level: str
    access_instructions: Optional[str]
    preferred_delivery_window: Optional[str]
    notes: Optional[str]
    active: bool
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


# ============================================================================
# DRIVER/OPERATOR MODELS
# ============================================================================

class DriverIn(BaseModel):
    """Driver/Operator model for logistics personnel"""
    id: Optional[str] = None
    first_name: str
    last_name: str
    employee_number: Optional[str] = None

    # Contact
    phone: str
    email: str
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    # License and certifications
    license_number: str
    license_type: str = Field(..., description="B, C, CE, etc. (EU license classes)")
    license_expiry: date
    adr_certified: bool = Field(False, description="Dangerous goods certified (ADR)")
    adr_expiry: Optional[date] = None
    forklift_certified: bool = False

    # Employment
    home_facility_id: Optional[str] = None
    role: Literal["driver", "operator", "dispatcher", "manager"] = "driver"
    employment_status: Literal["active", "on_leave", "inactive"] = "active"

    # Working hours tracking (EU compliance)
    daily_driving_limit_minutes: int = Field(540, description="9 hours default, max 10 per EU rules")
    weekly_driving_limit_minutes: int = Field(3360, description="56 hours per EU rules")

    # Current assignment
    assigned_vehicle_id: Optional[str] = None
    current_shift_start: Optional[datetime] = None

    notes: Optional[str] = None


class DriverOut(BaseModel):
    """Driver output model"""
    id: str
    first_name: str
    last_name: str
    employee_number: Optional[str]
    phone: str
    email: str
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    license_number: str
    license_type: str
    license_expiry: date
    adr_certified: bool
    adr_expiry: Optional[date]
    forklift_certified: bool
    home_facility_id: Optional[str]
    role: str
    employment_status: str
    daily_driving_limit_minutes: int
    weekly_driving_limit_minutes: int
    assigned_vehicle_id: Optional[str]
    current_shift_start: Optional[datetime]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


class DriverHoursLog(BaseModel):
    """Track driver working hours for compliance"""
    driver_id: str
    shift_date: date
    shift_start: datetime
    shift_end: Optional[datetime] = None
    driving_minutes: int = 0
    break_minutes: int = 0
    other_work_minutes: int = 0
    notes: Optional[str] = None


# ============================================================================
# SHIPMENT/PACKAGE MODELS
# ============================================================================

class ShipmentItem(BaseModel):
    """Individual item within a shipment"""
    description: str
    quantity: int = Field(..., gt=0)
    weight_kg: Optional[float] = Field(None, ge=0)
    volume_m3: Optional[float] = Field(None, ge=0)
    sku: Optional[str] = None
    barcode: Optional[str] = None
    requires_signature: bool = False
    fragile: bool = False
    temperature_controlled: bool = False
    dangerous_goods: bool = False
    adr_class: Optional[str] = Field(None, description="ADR classification if dangerous goods")


class ShipmentIn(BaseModel):
    """Shipment/Package model - core of logistics operations"""
    id: Optional[str] = None
    tracking_number: Optional[str] = Field(None, description="Auto-generated if not provided")

    # Customer references
    customer_id: str
    customer_reference: Optional[str] = Field(None, description="Customer's PO or reference number")

    # Origin and destination
    origin_facility_id: str
    destination_facility_id: Optional[str] = None
    destination_customer_id: Optional[str] = None  # If delivering to customer location
    delivery_address: Optional[str] = None
    delivery_lat: Optional[float] = None
    delivery_lon: Optional[float] = None

    # Shipment details
    items: List[ShipmentItem] = Field(..., min_items=1)
    total_weight_kg: Optional[float] = Field(None, ge=0)
    total_volume_m3: Optional[float] = Field(None, ge=0)

    # Service level and timing
    service_level: Literal["standard", "express", "same_day", "economy"] = "standard"
    requested_pickup_date: Optional[date] = None
    requested_delivery_date: Optional[date] = None
    delivery_time_window: Optional[str] = Field(None, description="e.g., '08:00-12:00'")

    # Status and tracking
    status: Literal["created", "picked_up", "in_transit", "out_for_delivery", "delivered",
                    "failed", "cancelled", "returned"] = "created"
    priority: Literal["low", "normal", "high", "urgent"] = "normal"

    # Assignment
    assigned_vehicle_id: Optional[str] = None
    assigned_driver_id: Optional[str] = None
    assigned_task_id: Optional[str] = None  # Link to TaskIn/work order

    # Special handling
    requires_signature: bool = True
    requires_photo_proof: bool = False
    special_instructions: Optional[str] = None

    # Pricing (optional)
    estimated_cost: Optional[float] = None
    currency: str = "SEK"

    notes: Optional[str] = None


class ShipmentOut(BaseModel):
    """Shipment output model"""
    id: str
    tracking_number: str
    customer_id: str
    customer_reference: Optional[str]
    origin_facility_id: str
    destination_facility_id: Optional[str]
    destination_customer_id: Optional[str]
    delivery_address: Optional[str]
    delivery_lat: Optional[float]
    delivery_lon: Optional[float]
    items: List[ShipmentItem]
    total_weight_kg: Optional[float]
    total_volume_m3: Optional[float]
    service_level: str
    requested_pickup_date: Optional[date]
    requested_delivery_date: Optional[date]
    delivery_time_window: Optional[str]
    status: str
    priority: str
    assigned_vehicle_id: Optional[str]
    assigned_driver_id: Optional[str]
    assigned_task_id: Optional[str]
    requires_signature: bool
    requires_photo_proof: bool
    special_instructions: Optional[str]
    estimated_cost: Optional[float]
    currency: str
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    # Delivery tracking
    actual_pickup_time: Optional[datetime] = None
    actual_delivery_time: Optional[datetime] = None
    delivery_attempts: int = 0


class ShipmentEvent(BaseModel):
    """Shipment status change event for tracking history"""
    shipment_id: str
    event_type: Literal["created", "picked_up", "in_transit", "arrived_at_facility",
                        "out_for_delivery", "delivery_attempted", "delivered", "exception"]
    status: str
    location_facility_id: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    notes: Optional[str] = None
    timestamp: datetime


class ProofOfDelivery(BaseModel):
    """Proof of delivery capture"""
    shipment_id: str
    delivered_at: datetime
    delivered_by_driver_id: str
    delivery_lat: float
    delivery_lon: float
    recipient_name: Optional[str] = None
    signature_image_url: Optional[str] = None  # Base64 or URL to stored signature
    photo_urls: Optional[List[str]] = None  # Photos of delivered package
    notes: Optional[str] = None


# ============================================================================
# VEHICLE/ASSET MODELS (Updated)
# ============================================================================

class AssetIn(BaseModel):
    """Vehicle/Asset model - updated for logistics"""
    id: Optional[str] = None
    type: str = Field(..., description="van, truck, trailer, forklift, cargo_bike, car")

    # Vehicle identification
    registration_number: Optional[str] = None
    vin: Optional[str] = Field(None, description="Vehicle Identification Number")
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None

    # Location and movement
    lat: float
    lon: float
    route: str = "stationary"
    route_index: float = 0.0
    speed: float = 0.0
    heading: float = 0.0
    status: Literal["available", "in_use", "parked", "maintenance", "out_of_service"] = "parked"

    # Capacity and specifications
    cargo_capacity_kg: Optional[float] = Field(None, description="Maximum cargo weight in kg")
    cargo_volume_m3: Optional[float] = Field(None, description="Cargo volume in cubic meters")
    pallet_capacity: Optional[int] = Field(None, description="Number of EUR pallets")

    # Fuel/Energy
    fuel_type: Literal["electric", "diesel", "gasoline", "hybrid_diesel", "hybrid_petrol", "lng", "cng"] = "diesel"
    fuel_level: Optional[float] = Field(default=100.0, ge=0, le=100, description="Current fuel percentage")
    fuel_capacity: Optional[float] = Field(default=100.0, description="Fuel tank capacity in liters")
    fuel_consumption_rate: Optional[float] = Field(default=8.0, description="Liters per 100km")

    # Electric vehicle fields
    has_battery: bool = False
    battery: Optional[float] = Field(None, ge=0, le=100, description="Battery percentage")
    battery_capacity_kwh: Optional[float] = None
    battery_drain: float = 0.0

    # Maintenance tracking
    operating_hours: Optional[float] = Field(default=0.0, description="Total hours in operation")
    odometer_km: Optional[float] = Field(default=0.0, description="Total kilometers driven")
    maintenance_hours: Optional[float] = Field(default=200.0, description="Hours until maintenance required")
    maintenance_km: Optional[float] = Field(default=10000.0, description="Km until maintenance required")
    last_maintenance: Optional[datetime] = None
    next_maintenance_due: Optional[date] = None
    maintenance_status: Optional[Literal["operational", "needs_maintenance", "under_maintenance"]] = "operational"

    # Insurance and compliance
    insurance_expiry: Optional[date] = None
    inspection_expiry: Optional[date] = None  # "Besiktning" in Swedish
    tachograph_equipped: bool = False

    # Assignment and location
    home_facility_id: Optional[str] = None
    current_driver_id: Optional[str] = None
    assigned_to_customer_id: Optional[str] = None  # For dedicated contract vehicles

    # Special features
    refrigerated: bool = False
    tail_lift: bool = False
    gps_tracker_id: Optional[str] = None

    notes: Optional[str] = None

    # Legacy fields for compatibility
    home_base_id: Optional[str] = None
    capacity: Optional[int] = None
    assets_stored: Optional[List[str]] = None


class AssetOut(BaseModel):
    """Asset output model"""
    id: str
    type: str
    registration_number: Optional[str]
    vin: Optional[str]
    make: Optional[str]
    model: Optional[str]
    year: Optional[int]
    lat: float
    lon: float
    route: str
    route_index: float
    speed: float
    heading: float
    status: str
    cargo_capacity_kg: Optional[float]
    cargo_volume_m3: Optional[float]
    pallet_capacity: Optional[int]
    fuel_type: str
    fuel_level: Optional[float]
    fuel_capacity: Optional[float]
    fuel_consumption_rate: Optional[float]
    has_battery: bool
    battery: Optional[float]
    battery_capacity_kwh: Optional[float]
    battery_drain: float
    operating_hours: Optional[float]
    odometer_km: Optional[float]
    maintenance_hours: Optional[float]
    maintenance_km: Optional[float]
    last_maintenance: Optional[datetime]
    next_maintenance_due: Optional[date]
    maintenance_status: Optional[str]
    insurance_expiry: Optional[date]
    inspection_expiry: Optional[date]
    tachograph_equipped: bool
    home_facility_id: Optional[str]
    current_driver_id: Optional[str]
    assigned_to_customer_id: Optional[str]
    refrigerated: bool
    tail_lift: bool
    gps_tracker_id: Optional[str]
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


# ============================================================================
# AUTHENTICATION MODELS (Updated)
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
# TASK/WORK ORDER MODELS (Updated)
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
# INVENTORY MODELS (Updated)
# ============================================================================

class InventoryItemIn(BaseModel):
    id: Optional[str] = None
    name: str

    # Classification
    type: str = Field(..., description="fuel, spare_parts, equipment, consumable, pallet, packaging")
    category: str = Field(..., description="consumable, equipment, tool, safety, office, etc.")

    # Quantity and units
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., description="liters, kg, units, boxes, pallets, etc.")

    # Physical properties
    weight_per_unit: Optional[float] = Field(None, ge=0, description="Weight in kg")
    volume_per_unit: Optional[float] = Field(None, ge=0, description="Volume in cubic meters")

    # Location
    location_type: Literal["facility", "vehicle"] = "facility"
    location_id: str
    zone: Optional[str] = Field(None, description="Warehouse zone/aisle/bin location")

    # Stock management
    min_stock_level: Optional[float] = Field(default=0, ge=0)
    max_stock_level: Optional[float] = None
    reorder_point: Optional[float] = None

    # Identification
    sku: Optional[str] = None
    barcode: Optional[str] = None
    supplier: Optional[str] = None
    supplier_part_number: Optional[str] = None

    # Tracking
    batch_number: Optional[str] = None
    serial_number: Optional[str] = None
    expiration_date: Optional[date] = None

    # Valuation
    unit_cost: Optional[float] = None
    currency: str = "SEK"

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
    zone: Optional[str]
    min_stock_level: float
    max_stock_level: Optional[float]
    reorder_point: Optional[float]
    sku: Optional[str]
    barcode: Optional[str]
    supplier: Optional[str]
    supplier_part_number: Optional[str]
    batch_number: Optional[str]
    serial_number: Optional[str]
    expiration_date: Optional[date]
    unit_cost: Optional[float]
    currency: str
    description: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    total_value: Optional[float] = None  # Calculated: quantity * unit_cost


class InventoryTransactionIn(BaseModel):
    item_id: str
    transaction_type: Literal["add", "remove", "transfer", "adjust", "consume", "restock", "return"]
    quantity: float = Field(..., gt=0)

    # Location tracking
    from_location_type: Optional[Literal["facility", "vehicle"]] = None
    from_location_id: Optional[str] = None
    to_location_type: Optional[Literal["facility", "vehicle"]] = None
    to_location_id: Optional[str] = None

    # Associated records
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    shipment_id: Optional[str] = None
    task_id: Optional[str] = None

    # Reason and tracking
    reason: Optional[str] = Field(None, description="Reason for transaction")
    reference_number: Optional[str] = None
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
    vehicle_id: Optional[str]
    driver_id: Optional[str]
    shipment_id: Optional[str]
    task_id: Optional[str]
    reason: Optional[str]
    reference_number: Optional[str]
    user_email: Optional[str]
    notes: Optional[str]
    timestamp: datetime


# ============================================================================
# INCIDENT/EXCEPTION MODELS (for MSB compliance)
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
    updated_at: Optional[datetime]