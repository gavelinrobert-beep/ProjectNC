"""
Pydantic models for Logistics module.
Handles delivery, route, shipment, and customer models.
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Literal
from datetime import datetime, date


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
    organization_number: Optional[str] = Field(None, description="Swedish org.nr or similar")
    billing_account: Optional[str] = None
    billing_email: Optional[str] = None

    # Service agreement
    service_level: Literal["standard", "premium", "enterprise"] = "standard"
    credit_limit: Optional[float] = None
    payment_terms_days: int = 30

    active: bool = True
    notes: Optional[str] = None


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
    billing_email: Optional[str]
    service_level: str
    credit_limit: Optional[float]
    payment_terms_days: int
    active: bool
    notes: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]


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
