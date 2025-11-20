"""
Pydantic models for Fleet module.
Handles vehicle, driver, telemetry, and maintenance models.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime, date


# ============================================================================
# DRIVER MODELS
# ============================================================================

class DriverIn(BaseModel):
    """Driver/Operator model for logistics operations"""
    id: Optional[str] = None
    name: str
    email: str
    phone: str

    # License information
    license_number: str
    license_type: Literal["B", "C", "CE", "C1", "C1E", "D", "DE"] = "B"  # EU license categories
    license_expiry: date
    adr_certificate: bool = False  # Dangerous goods
    adr_expiry: Optional[date] = None
    tachograph_card_number: Optional[str] = None
    tachograph_card_expiry: Optional[date] = None

    # Employment
    employment_status: Literal["active", "on_leave", "inactive"] = "active"
    hire_date: Optional[date] = None
    employment_type: Literal["full_time", "part_time", "contractor"] = "full_time"
    role: Literal["driver", "operator", "dispatcher", "manager"] = "driver"

    # Assignment
    home_facility_id: Optional[str] = None
    current_vehicle_id: Optional[str] = None

    # Qualifications
    forklift_certified: bool = False
    hazmat_certified: bool = False
    medical_certificate_expiry: Optional[date] = None

    # Communication
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None

    # Tracking
    current_lat: Optional[float] = None
    current_lon: Optional[float] = None
    status: Literal["available", "on_duty", "on_break", "off_duty"] = "off_duty"

    notes: Optional[str] = None


class DriverOut(BaseModel):
    """Driver output model"""
    id: str
    name: str
    email: str
    phone: str
    license_number: str
    license_type: str
    license_expiry: date
    adr_certificate: bool
    adr_expiry: Optional[date]
    tachograph_card_number: Optional[str]
    tachograph_card_expiry: Optional[date]
    employment_status: str
    hire_date: Optional[date]
    employment_type: str
    role: str
    home_facility_id: Optional[str]
    current_vehicle_id: Optional[str]
    forklift_certified: bool
    hazmat_certified: bool
    medical_certificate_expiry: Optional[date]
    emergency_contact_name: Optional[str]
    emergency_contact_phone: Optional[str]
    current_lat: Optional[float]
    current_lon: Optional[float]
    status: str
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
# VEHICLE/ASSET MODELS
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
