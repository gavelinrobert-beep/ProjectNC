"""
Pydantic models for Sites module.
Handles depot, material, inventory, and pickup event models.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, date


# ============================================================================
# FACILITY MODELS (Depots, Warehouses)
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
# INVENTORY MODELS
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
