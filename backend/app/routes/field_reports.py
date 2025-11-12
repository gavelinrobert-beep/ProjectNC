"""
Field Reports endpoints for civilian operations.
Allows field operators to submit status updates, issue reports, and completion reports
with photo attachments and offline support.
"""
from fastapi import APIRouter, HTTPException, Request, Depends, UploadFile, File, Form
from typing import Optional, List
from datetime import datetime
from uuid import uuid4
import json
import base64

from ..auth import bearer_role, get_current_user
from ..database import get_pool
from pydantic import BaseModel

router = APIRouter(prefix="/api/field-reports", tags=["field-reports"])


class FieldReportCreate(BaseModel):
    title: str
    report_type: str  # status, issue, completion, incident, maintenance
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    location_name: Optional[str] = None
    description: str
    asset_id: Optional[str] = None
    mission_id: Optional[str] = None
    severity: Optional[str] = "normal"  # low, normal, high, critical
    tags: Optional[List[str]] = []
    photos: Optional[List[str]] = []  # Base64 encoded images


class FieldReportUpdate(BaseModel):
    status: Optional[str] = None  # open, in_progress, resolved, closed
    resolution_notes: Optional[str] = None
    resolved_by: Optional[str] = None


@router.get("")
async def get_field_reports(
    request: Request,
    status: Optional[str] = None,
    report_type: Optional[str] = None,
    asset_id: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    role: str = Depends(bearer_role)
):
    """Get all field reports with optional filters"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    
    # Build query based on filters
    query = "SELECT * FROM field_reports WHERE 1=1"
    params = []
    param_count = 0
    
    if status:
        param_count += 1
        query += f" AND status = ${param_count}"
        params.append(status)
    
    if report_type:
        param_count += 1
        query += f" AND report_type = ${param_count}"
        params.append(report_type)
    
    if asset_id:
        param_count += 1
        query += f" AND asset_id = ${param_count}"
        params.append(asset_id)
    
    if start_date:
        param_count += 1
        query += f" AND created_at >= ${param_count}"
        params.append(start_date)
    
    if end_date:
        param_count += 1
        query += f" AND created_at <= ${param_count}"
        params.append(end_date)
    
    query += " ORDER BY created_at DESC"
    
    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        
        reports = []
        for row in rows:
            report = dict(row)
            # Parse JSON fields
            if report.get('tags'):
                report['tags'] = json.loads(report['tags']) if isinstance(report['tags'], str) else report['tags']
            if report.get('photos'):
                report['photos'] = json.loads(report['photos']) if isinstance(report['photos'], str) else report['photos']
            reports.append(report)
        
        return reports


@router.get("/{report_id}")
async def get_field_report(
    report_id: str,
    request: Request,
    role: str = Depends(bearer_role)
):
    """Get a specific field report by ID"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM field_reports WHERE id = $1",
            report_id
        )
        
        if not row:
            raise HTTPException(status_code=404, detail="Field report not found")
        
        report = dict(row)
        # Parse JSON fields
        if report.get('tags'):
            report['tags'] = json.loads(report['tags']) if isinstance(report['tags'], str) else report['tags']
        if report.get('photos'):
            report['photos'] = json.loads(report['photos']) if isinstance(report['photos'], str) else report['photos']
        
        return report


@router.post("")
async def create_field_report(
    payload: FieldReportCreate,
    request: Request,
    current_user: str = Depends(get_current_user)
):
    """Create a new field report"""
    report_id = str(uuid4())
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # First, ensure the table exists
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS field_reports (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                report_type TEXT NOT NULL,
                location_lat FLOAT,
                location_lon FLOAT,
                location_name TEXT,
                description TEXT NOT NULL,
                asset_id TEXT,
                mission_id TEXT,
                severity TEXT DEFAULT 'normal',
                status TEXT DEFAULT 'open',
                tags JSONB,
                photos JSONB,
                submitted_by TEXT,
                resolved_by TEXT,
                resolution_notes TEXT,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW(),
                resolved_at TIMESTAMPTZ
            )
        """)
        
        await conn.execute("""
            INSERT INTO field_reports (
                id, title, report_type, location_lat, location_lon, location_name,
                description, asset_id, mission_id, severity, tags, photos, submitted_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        """,
            report_id,
            payload.title,
            payload.report_type,
            payload.location_lat,
            payload.location_lon,
            payload.location_name,
            payload.description,
            payload.asset_id,
            payload.mission_id,
            payload.severity,
            json.dumps(payload.tags or []),
            json.dumps(payload.photos or []),
            current_user
        )
        
        # Fetch and return the created report
        row = await conn.fetchrow(
            "SELECT * FROM field_reports WHERE id = $1",
            report_id
        )
        
        report = dict(row)
        if report.get('tags'):
            report['tags'] = json.loads(report['tags']) if isinstance(report['tags'], str) else report['tags']
        if report.get('photos'):
            report['photos'] = json.loads(report['photos']) if isinstance(report['photos'], str) else report['photos']
        
        return report


@router.put("/{report_id}")
async def update_field_report(
    report_id: str,
    payload: FieldReportUpdate,
    request: Request,
    current_user: str = Depends(get_current_user),
    role: str = Depends(bearer_role)
):
    """Update a field report (change status, add resolution)"""
    if role not in ["admin", "contractor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Check if report exists
        existing = await conn.fetchrow(
            "SELECT * FROM field_reports WHERE id = $1",
            report_id
        )
        
        if not existing:
            raise HTTPException(status_code=404, detail="Field report not found")
        
        # Build update query
        updates = []
        params = []
        param_count = 0
        
        if payload.status:
            param_count += 1
            updates.append(f"status = ${param_count}")
            params.append(payload.status)
            
            # If status is resolved or closed, set resolved_at
            if payload.status in ["resolved", "closed"]:
                param_count += 1
                updates.append(f"resolved_at = ${param_count}")
                params.append(datetime.now())
                
                param_count += 1
                updates.append(f"resolved_by = ${param_count}")
                params.append(current_user)
        
        if payload.resolution_notes:
            param_count += 1
            updates.append(f"resolution_notes = ${param_count}")
            params.append(payload.resolution_notes)
        
        # Always update updated_at
        param_count += 1
        updates.append(f"updated_at = ${param_count}")
        params.append(datetime.now())
        
        # Add report_id to params
        param_count += 1
        params.append(report_id)
        
        query = f"UPDATE field_reports SET {', '.join(updates)} WHERE id = ${param_count}"
        await conn.execute(query, *params)
        
        # Fetch and return updated report
        row = await conn.fetchrow(
            "SELECT * FROM field_reports WHERE id = $1",
            report_id
        )
        
        report = dict(row)
        if report.get('tags'):
            report['tags'] = json.loads(report['tags']) if isinstance(report['tags'], str) else report['tags']
        if report.get('photos'):
            report['photos'] = json.loads(report['photos']) if isinstance(report['photos'], str) else report['photos']
        
        return report


@router.delete("/{report_id}")
async def delete_field_report(
    report_id: str,
    request: Request,
    role: str = Depends(bearer_role)
):
    """Delete a field report (admin only)"""
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM field_reports WHERE id = $1",
            report_id
        )
        
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Field report not found")
        
        return {"message": "Field report deleted successfully"}


@router.post("/{report_id}/photos")
async def add_photo_to_report(
    report_id: str,
    request: Request,
    photo: UploadFile = File(...),
    caption: Optional[str] = Form(None),
    current_user: str = Depends(get_current_user)
):
    """Add a photo to an existing field report"""
    pool = await get_pool(request.app)
    
    # Read and encode photo
    photo_data = await photo.read()
    photo_base64 = base64.b64encode(photo_data).decode('utf-8')
    
    photo_obj = {
        "id": str(uuid4()),
        "filename": photo.filename,
        "content_type": photo.content_type,
        "data": photo_base64,
        "caption": caption,
        "uploaded_by": current_user,
        "uploaded_at": datetime.now().isoformat()
    }
    
    async with pool.acquire() as conn:
        # Get existing photos
        row = await conn.fetchrow(
            "SELECT photos FROM field_reports WHERE id = $1",
            report_id
        )
        
        if not row:
            raise HTTPException(status_code=404, detail="Field report not found")
        
        photos = json.loads(row['photos']) if row['photos'] else []
        photos.append(photo_obj)
        
        # Update report with new photo
        await conn.execute(
            "UPDATE field_reports SET photos = $1, updated_at = $2 WHERE id = $3",
            json.dumps(photos),
            datetime.now(),
            report_id
        )
        
        return {"message": "Photo added successfully", "photo": photo_obj}


@router.get("/statistics/summary")
async def get_field_reports_statistics(
    request: Request,
    days: int = 30,
    role: str = Depends(bearer_role)
):
    """Get summary statistics for field reports"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Check if table exists
        table_exists = await conn.fetchval("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'field_reports'
            )
        """)
        
        if not table_exists:
            return {
                "total_reports": 0,
                "open_reports": 0,
                "resolved_reports": 0,
                "critical_reports": 0,
                "reports_by_type": {}
            }
        
        cutoff_date = datetime.now() - __import__('datetime').timedelta(days=days)
        
        total = await conn.fetchval(
            "SELECT COUNT(*) FROM field_reports WHERE created_at >= $1",
            cutoff_date
        )
        
        open_count = await conn.fetchval(
            "SELECT COUNT(*) FROM field_reports WHERE status = 'open' AND created_at >= $1",
            cutoff_date
        )
        
        resolved_count = await conn.fetchval(
            "SELECT COUNT(*) FROM field_reports WHERE status IN ('resolved', 'closed') AND created_at >= $1",
            cutoff_date
        )
        
        critical_count = await conn.fetchval(
            "SELECT COUNT(*) FROM field_reports WHERE severity = 'critical' AND created_at >= $1",
            cutoff_date
        )
        
        # Get counts by type
        type_rows = await conn.fetch("""
            SELECT report_type, COUNT(*) as count
            FROM field_reports
            WHERE created_at >= $1
            GROUP BY report_type
        """, cutoff_date)
        
        reports_by_type = {row['report_type']: row['count'] for row in type_rows}
        
        return {
            "total_reports": total or 0,
            "open_reports": open_count or 0,
            "resolved_reports": resolved_count or 0,
            "critical_reports": critical_count or 0,
            "reports_by_type": reports_by_type,
            "period_days": days
        }
