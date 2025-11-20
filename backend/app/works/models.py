"""
Pydantic models for SYLON Works module.
Handles construction/contracting operations including projects, work orders,
machine hours, change orders (ÄTA), winter maintenance, and documentation.
"""
from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime, date
from decimal import Decimal


# ============================================================================
# PROJECT MODELS
# ============================================================================

class ProjectCreate(BaseModel):
    """Model for creating a new project"""
    project_number: str = Field(..., description="Unique project number, e.g., PRJ-2025-001")
    name: str = Field(..., description="Project name")
    description: Optional[str] = None
    customer_id: Optional[str] = None
    site_id: Optional[str] = Field(None, description="Reference to facilities table")
    status: Literal['planning', 'active', 'on_hold', 'completed', 'cancelled'] = 'planning'
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = None
    project_manager_id: Optional[str] = Field(None, description="Reference to users table")


class ProjectUpdate(BaseModel):
    """Model for updating an existing project"""
    name: Optional[str] = None
    description: Optional[str] = None
    customer_id: Optional[str] = None
    site_id: Optional[str] = None
    status: Optional[Literal['planning', 'active', 'on_hold', 'completed', 'cancelled']] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget: Optional[Decimal] = None
    project_manager_id: Optional[str] = None


class ProjectResponse(BaseModel):
    """Model for project API responses"""
    id: str
    project_number: str
    name: str
    description: Optional[str]
    customer_id: Optional[str]
    site_id: Optional[str]
    status: str
    start_date: Optional[date]
    end_date: Optional[date]
    budget: Optional[Decimal]
    project_manager_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]


class ProjectStatistics(BaseModel):
    """Statistics for a project"""
    total_work_orders: int = 0
    completed_work_orders: int = 0
    active_work_orders: int = 0
    total_machine_hours: Decimal = Decimal('0.0')
    total_machine_costs: Decimal = Decimal('0.0')
    total_change_orders: int = 0
    approved_change_orders: int = 0
    change_order_costs: Decimal = Decimal('0.0')


# ============================================================================
# WORK ORDER MODELS
# ============================================================================

class WorkOrderCreate(BaseModel):
    """Model for creating a new work order"""
    order_number: str = Field(..., description="Unique order number, e.g., WO-2025-001")
    project_id: Optional[str] = None
    title: str
    description: Optional[str] = None
    type: Literal['construction', 'maintenance', 'winter_maintenance', 'emergency', 'other'] = 'other'
    priority: Literal['low', 'medium', 'high', 'urgent'] = 'medium'
    status: Literal['draft', 'scheduled', 'in_progress', 'completed', 'cancelled'] = 'draft'
    assigned_to: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    location_lat: Optional[Decimal] = None
    location_lng: Optional[Decimal] = None
    location_address: Optional[str] = None


class WorkOrderUpdate(BaseModel):
    """Model for updating an existing work order"""
    title: Optional[str] = None
    description: Optional[str] = None
    type: Optional[Literal['construction', 'maintenance', 'winter_maintenance', 'emergency', 'other']] = None
    priority: Optional[Literal['low', 'medium', 'high', 'urgent']] = None
    status: Optional[Literal['draft', 'scheduled', 'in_progress', 'completed', 'cancelled']] = None
    assigned_to: Optional[str] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    location_lat: Optional[Decimal] = None
    location_lng: Optional[Decimal] = None
    location_address: Optional[str] = None


class WorkOrderResponse(BaseModel):
    """Model for work order API responses"""
    id: str
    order_number: str
    project_id: Optional[str]
    title: str
    description: Optional[str]
    type: str
    priority: str
    status: str
    assigned_to: Optional[str]
    scheduled_start: Optional[datetime]
    scheduled_end: Optional[datetime]
    actual_start: Optional[datetime]
    actual_end: Optional[datetime]
    location_lat: Optional[Decimal]
    location_lng: Optional[Decimal]
    location_address: Optional[str]
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str]


# ============================================================================
# MACHINE HOURS MODELS
# ============================================================================

class MachineHoursCreate(BaseModel):
    """Model for creating a machine hours entry"""
    work_order_id: Optional[str] = None
    project_id: Optional[str] = None
    asset_id: Optional[str] = Field(None, description="Reference to assets table")
    operator_id: Optional[str] = Field(None, description="Reference to users table")
    start_time: datetime
    end_time: Optional[datetime] = None
    hourly_rate: Optional[Decimal] = None
    notes: Optional[str] = None


class MachineHoursUpdate(BaseModel):
    """Model for updating a machine hours entry"""
    end_time: Optional[datetime] = None
    hourly_rate: Optional[Decimal] = None
    notes: Optional[str] = None


class MachineHoursResponse(BaseModel):
    """Model for machine hours API responses"""
    id: str
    work_order_id: Optional[str]
    project_id: Optional[str]
    asset_id: Optional[str]
    operator_id: Optional[str]
    start_time: datetime
    end_time: Optional[datetime]
    hours: Optional[Decimal]
    hourly_rate: Optional[Decimal]
    total_cost: Optional[Decimal]
    notes: Optional[str]
    created_at: datetime
    created_by: Optional[str]


# ============================================================================
# CHANGE ORDER MODELS (ÄTA)
# ============================================================================

class ChangeOrderCreate(BaseModel):
    """Model for creating a change order (ÄTA)"""
    change_order_number: str = Field(..., description="Unique ÄTA number, e.g., ÄTA-2025-001")
    project_id: str
    title: str
    description: str
    reason: Optional[str] = None
    status: Literal['draft', 'submitted', 'approved', 'rejected', 'completed'] = 'draft'
    estimated_cost: Optional[Decimal] = None
    estimated_hours: Optional[Decimal] = None
    impact_on_schedule: Optional[int] = Field(None, description="Impact on schedule in days")


class ChangeOrderUpdate(BaseModel):
    """Model for updating a change order"""
    title: Optional[str] = None
    description: Optional[str] = None
    reason: Optional[str] = None
    status: Optional[Literal['draft', 'submitted', 'approved', 'rejected', 'completed']] = None
    estimated_cost: Optional[Decimal] = None
    actual_cost: Optional[Decimal] = None
    estimated_hours: Optional[Decimal] = None
    impact_on_schedule: Optional[int] = None


class ChangeOrderResponse(BaseModel):
    """Model for change order API responses"""
    id: str
    change_order_number: str
    project_id: str
    title: str
    description: str
    reason: Optional[str]
    status: str
    requested_by: Optional[str]
    approved_by: Optional[str]
    estimated_cost: Optional[Decimal]
    actual_cost: Optional[Decimal]
    estimated_hours: Optional[Decimal]
    impact_on_schedule: Optional[int]
    submitted_at: Optional[datetime]
    approved_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime


# ============================================================================
# WINTER MAINTENANCE MODELS
# ============================================================================

class WinterMaintenanceCreate(BaseModel):
    """Model for creating a winter maintenance entry"""
    work_order_id: str
    route_name: Optional[str] = None
    road_condition: Literal['dry', 'wet', 'snow', 'ice', 'black_ice'] = 'dry'
    weather_condition: Optional[str] = None
    temperature: Optional[Decimal] = None
    salt_used_kg: Optional[Decimal] = None
    sand_used_kg: Optional[Decimal] = None
    plowing_performed: bool = False
    start_time: datetime
    end_time: Optional[datetime] = None
    distance_km: Optional[Decimal] = None
    notes: Optional[str] = None


class WinterMaintenanceUpdate(BaseModel):
    """Model for updating a winter maintenance entry"""
    route_name: Optional[str] = None
    road_condition: Optional[Literal['dry', 'wet', 'snow', 'ice', 'black_ice']] = None
    weather_condition: Optional[str] = None
    temperature: Optional[Decimal] = None
    salt_used_kg: Optional[Decimal] = None
    sand_used_kg: Optional[Decimal] = None
    plowing_performed: Optional[bool] = None
    end_time: Optional[datetime] = None
    distance_km: Optional[Decimal] = None
    notes: Optional[str] = None


class WinterMaintenanceResponse(BaseModel):
    """Model for winter maintenance API responses"""
    id: str
    work_order_id: str
    route_name: Optional[str]
    road_condition: str
    weather_condition: Optional[str]
    temperature: Optional[Decimal]
    salt_used_kg: Optional[Decimal]
    sand_used_kg: Optional[Decimal]
    plowing_performed: bool
    start_time: datetime
    end_time: Optional[datetime]
    distance_km: Optional[Decimal]
    notes: Optional[str]
    created_at: datetime
    created_by: Optional[str]


# ============================================================================
# DOCUMENTATION MODELS
# ============================================================================

class DocumentationCreate(BaseModel):
    """Model for creating a documentation entry"""
    project_id: Optional[str] = None
    work_order_id: Optional[str] = None
    change_order_id: Optional[str] = None
    document_type: Literal['photo', 'report', 'invoice', 'contract', 'permit', 'other'] = 'other'
    title: str
    description: Optional[str] = None
    file_path: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None


class DocumentationResponse(BaseModel):
    """Model for documentation API responses"""
    id: str
    project_id: Optional[str]
    work_order_id: Optional[str]
    change_order_id: Optional[str]
    document_type: str
    title: str
    description: Optional[str]
    file_path: str
    file_size: Optional[int]
    mime_type: Optional[str]
    uploaded_by: Optional[str]
    created_at: datetime
