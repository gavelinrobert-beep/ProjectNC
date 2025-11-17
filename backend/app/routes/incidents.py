"""
Incidents API endpoints for MSB compliance.
Supports creating, listing, updating, and deleting incidents.
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime
import json

from ..database import get_pool
from ..auth import require_auth, get_current_user

router = APIRouter(prefix="/api", tags=["incidents"])


class IncidentCreate(BaseModel):
    """Model for creating a new incident"""
    incident_type: str = Field(..., description="Type: breakdown, accident, delay, emergency, weather, other")
    severity: str = Field(default="medium", description="Severity: low, medium, high, critical")
    title: str = Field(..., min_length=1)
    description: str = Field(..., min_length=1)
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    location_description: Optional[str] = None
    facility_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    customer_id: Optional[str] = None
    shipment_ids: Optional[List[str]] = None
    status: str = Field(default="open", description="Status: open, in_progress, resolved, closed")
    requires_followup: bool = False
    assigned_to_user_id: Optional[str] = None
    reported_at: Optional[datetime] = None


class IncidentUpdate(BaseModel):
    """Model for updating an existing incident"""
    incident_type: Optional[str] = None
    severity: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    location_description: Optional[str] = None
    facility_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    customer_id: Optional[str] = None
    shipment_ids: Optional[List[str]] = None
    status: Optional[str] = None
    resolution_notes: Optional[str] = None
    requires_followup: Optional[bool] = None
    assigned_to_user_id: Optional[str] = None
    resolved_at: Optional[datetime] = None


@router.get("/incidents", response_model=List[dict])
async def get_incidents(
    request: Request,
    status: Optional[str] = None,
    severity: Optional[str] = None,
    incident_type: Optional[str] = None,
    limit: int = 100,
    _user: dict = Depends(require_auth)
):
    """
    Get list of incidents with optional filters.
    Requires authentication.
    """
    pool = await get_pool(request.app)
    
    query = "SELECT * FROM incidents WHERE 1=1"
    params = []
    param_count = 1
    
    if status:
        query += f" AND status = ${param_count}"
        params.append(status)
        param_count += 1
    
    if severity:
        query += f" AND severity = ${param_count}"
        params.append(severity)
        param_count += 1
    
    if incident_type:
        query += f" AND incident_type = ${param_count}"
        params.append(incident_type)
        param_count += 1
    
    query += f" ORDER BY reported_at DESC LIMIT ${param_count}"
    params.append(limit)
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        incidents = []
        for row in rows:
            incident = dict(row)
            # Parse JSONB fields
            if incident.get("shipment_ids") and isinstance(incident["shipment_ids"], str):
                incident["shipment_ids"] = json.loads(incident["shipment_ids"])
            if incident.get("photo_urls") and isinstance(incident["photo_urls"], str):
                incident["photo_urls"] = json.loads(incident["photo_urls"])
            if incident.get("document_urls") and isinstance(incident["document_urls"], str):
                incident["document_urls"] = json.loads(incident["document_urls"])
            # Convert datetime fields to ISO format
            for field in ["reported_at", "resolved_at", "created_at", "updated_at"]:
                if incident.get(field):
                    incident[field] = incident[field].isoformat()
            incidents.append(incident)
        return incidents


@router.get("/incidents/{incident_id}", response_model=dict)
async def get_incident(
    incident_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """
    Get a specific incident by ID.
    Requires authentication.
    """
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM incidents WHERE id = $1", incident_id)
        if not row:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        incident = dict(row)
        # Parse JSONB fields
        if incident.get("shipment_ids") and isinstance(incident["shipment_ids"], str):
            incident["shipment_ids"] = json.loads(incident["shipment_ids"])
        if incident.get("photo_urls") and isinstance(incident["photo_urls"], str):
            incident["photo_urls"] = json.loads(incident["photo_urls"])
        if incident.get("document_urls") and isinstance(incident["document_urls"], str):
            incident["document_urls"] = json.loads(incident["document_urls"])
        # Convert datetime fields to ISO format
        for field in ["reported_at", "resolved_at", "created_at", "updated_at"]:
            if incident.get(field):
                incident[field] = incident[field].isoformat()
        return incident


@router.post("/incidents", response_model=dict)
async def create_incident(
    incident: IncidentCreate,
    request: Request,
    user: dict = Depends(get_current_user)
):
    """
    Create a new incident.
    Requires authentication. The authenticated user is set as the reporter.
    """
    pool = await get_pool(request.app)
    
    # Set reported_at to now if not provided
    reported_at = incident.reported_at or datetime.utcnow()
    
    # Convert shipment_ids to JSON string if provided
    shipment_ids_json = json.dumps(incident.shipment_ids) if incident.shipment_ids else None
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO incidents (
                incident_type, severity, title, description,
                location_lat, location_lon, location_description,
                facility_id, reported_by_user_id, vehicle_id, driver_id,
                customer_id, shipment_ids, status, requires_followup,
                assigned_to_user_id, reported_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        """,
            incident.incident_type,
            incident.severity,
            incident.title,
            incident.description,
            incident.location_lat,
            incident.location_lon,
            incident.location_description,
            incident.facility_id,
            user["id"],  # Use authenticated user as reporter
            incident.vehicle_id,
            incident.driver_id,
            incident.customer_id,
            shipment_ids_json,
            incident.status,
            incident.requires_followup,
            incident.assigned_to_user_id,
            reported_at
        )
        
        result = dict(row)
        # Parse JSONB fields
        if result.get("shipment_ids") and isinstance(result["shipment_ids"], str):
            result["shipment_ids"] = json.loads(result["shipment_ids"])
        # Convert datetime fields to ISO format
        for field in ["reported_at", "resolved_at", "created_at", "updated_at"]:
            if result.get(field):
                result[field] = result[field].isoformat()
        return result


@router.put("/incidents/{incident_id}", response_model=dict)
async def update_incident(
    incident_id: str,
    incident: IncidentUpdate,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """
    Update an existing incident.
    Requires authentication.
    """
    pool = await get_pool(request.app)
    
    # Build dynamic update query
    updates = []
    params = []
    param_count = 1
    
    for field, value in incident.dict(exclude_unset=True).items():
        if value is not None:
            if field == "shipment_ids":
                value = json.dumps(value)
            updates.append(f"{field} = ${param_count}")
            params.append(value)
            param_count += 1
    
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    # Add updated_at
    updates.append(f"updated_at = ${param_count}")
    params.append(datetime.utcnow())
    param_count += 1
    
    # Add incident_id
    params.append(incident_id)
    
    query = f"UPDATE incidents SET {', '.join(updates)} WHERE id = ${param_count} RETURNING *"
    
    async with pool.acquire() as conn:
        row = await conn.fetchrow(query, *params)
        if not row:
            raise HTTPException(status_code=404, detail="Incident not found")
        
        result = dict(row)
        # Parse JSONB fields
        if result.get("shipment_ids") and isinstance(result["shipment_ids"], str):
            result["shipment_ids"] = json.loads(result["shipment_ids"])
        if result.get("photo_urls") and isinstance(result["photo_urls"], str):
            result["photo_urls"] = json.loads(result["photo_urls"])
        if result.get("document_urls") and isinstance(result["document_urls"], str):
            result["document_urls"] = json.loads(result["document_urls"])
        # Convert datetime fields to ISO format
        for field in ["reported_at", "resolved_at", "created_at", "updated_at"]:
            if result.get(field):
                result[field] = result[field].isoformat()
        return result


@router.delete("/incidents/{incident_id}")
async def delete_incident(
    incident_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """
    Delete an incident.
    Requires authentication.
    """
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM incidents WHERE id = $1", incident_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Incident not found")
        return {"ok": True, "message": "Incident deleted successfully"}
