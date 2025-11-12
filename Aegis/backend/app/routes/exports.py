"""
Export endpoints for generating reports in CSV and PDF formats.
Supports assets, missions, inventory, and field reports.
"""
from fastapi import APIRouter, HTTPException, Request, Response, Depends
from fastapi.responses import StreamingResponse
from typing import Optional, List
from datetime import datetime, timedelta
import csv
import io
import json

from ..auth import require_admin, bearer_role
from ..database import get_pool

router = APIRouter(prefix="/api/exports", tags=["exports"])


def generate_csv(headers: List[str], rows: List[List]) -> str:
    """Generate CSV content from headers and rows"""
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(rows)
    return output.getvalue()


@router.get("/assets.csv")
async def export_assets_csv(request: Request, role: str = Depends(bearer_role)):
    """Export all assets to CSV format"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, type, lat, lon, status, fuel_level, fuel_type,
                   maintenance_status, home_base_id, speed, heading
            FROM assets
            ORDER BY id
        """)
        
        if not rows:
            raise HTTPException(status_code=404, detail="No assets found")
        
        headers = [
            "Asset ID", "Type", "Latitude", "Longitude", "Status",
            "Fuel Level (%)", "Fuel Type", "Maintenance Status",
            "Home Base", "Speed", "Heading"
        ]
        
        data_rows = [
            [
                row['id'], row['type'], row['lat'], row['lon'], row['status'],
                row['fuel_level'], row['fuel_type'], row['maintenance_status'],
                row['home_base_id'] or 'N/A', row['speed'], row['heading']
            ]
            for row in rows
        ]
        
        csv_content = generate_csv(headers, data_rows)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=aegis_assets_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )


@router.get("/missions.csv")
async def export_missions_csv(
    request: Request,
    status: Optional[str] = None,
    role: str = Depends(bearer_role)
):
    """Export missions to CSV format"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        if status:
            rows = await conn.fetch(
                "SELECT * FROM missions WHERE status = $1 ORDER BY created_at DESC",
                status
            )
        else:
            rows = await conn.fetch("SELECT * FROM missions ORDER BY created_at DESC")
        
        if not rows:
            raise HTTPException(status_code=404, detail="No missions found")
        
        headers = [
            "Mission ID", "Name", "Type", "Status", "Asset ID",
            "Priority", "Waypoints Count", "Created At"
        ]
        
        data_rows = [
            [
                row['id'], row['name'] or 'N/A', row['mission_type'] or 'patrol',
                row['status'], row['asset_id'] or 'Unassigned',
                'Medium',  # Default priority
                len(json.loads(row['waypoints'])) if row['waypoints'] else 0,
                row['created_at'].strftime('%Y-%m-%d %H:%M:%S') if row['created_at'] else 'N/A'
            ]
            for row in rows
        ]
        
        csv_content = generate_csv(headers, data_rows)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=aegis_missions_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )


@router.get("/inventory.csv")
async def export_inventory_csv(
    request: Request,
    location_id: Optional[str] = None,
    role: str = Depends(bearer_role)
):
    """Export inventory items to CSV format"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        if location_id:
            rows = await conn.fetch(
                "SELECT * FROM inventory WHERE location_id = $1 ORDER BY name",
                location_id
            )
        else:
            rows = await conn.fetch("SELECT * FROM inventory ORDER BY location_id, name")
        
        if not rows:
            raise HTTPException(status_code=404, detail="No inventory items found")
        
        headers = [
            "Item ID", "Name", "Location", "Quantity", "Unit", "Min Stock Level"
        ]
        
        data_rows = [
            [
                row['id'], row['name'], row['location_id'] or 'N/A',
                row['quantity'], row['unit'] or 'units',
                row['min_stock_level'] or 0
            ]
            for row in rows
        ]
        
        csv_content = generate_csv(headers, data_rows)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=aegis_inventory_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )


@router.get("/alerts.csv")
async def export_alerts_csv(
    request: Request,
    acknowledged: Optional[bool] = None,
    role: str = Depends(bearer_role)
):
    """Export alerts to CSV format"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        if acknowledged is not None:
            rows = await conn.fetch(
                "SELECT * FROM alerts WHERE acknowledged = $1 ORDER BY ts DESC",
                acknowledged
            )
        else:
            rows = await conn.fetch("SELECT * FROM alerts ORDER BY ts DESC")
        
        if not rows:
            raise HTTPException(status_code=404, detail="No alerts found")
        
        headers = [
            "Alert ID", "Asset ID", "Rule", "Severity", "Message",
            "Acknowledged", "Timestamp"
        ]
        
        data_rows = [
            [
                row['id'], row['asset_id'], row['rule'],
                row['severity'] or 'warning', row['message'] or '',
                'Yes' if row['acknowledged'] else 'No',
                row['ts'].strftime('%Y-%m-%d %H:%M:%S') if row['ts'] else 'N/A'
            ]
            for row in rows
        ]
        
        csv_content = generate_csv(headers, data_rows)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=aegis_alerts_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )


@router.get("/bases.csv")
async def export_bases_csv(request: Request, role: str = Depends(bearer_role)):
    """Export bases to CSV format"""
    if role == "anonymous":
        raise HTTPException(status_code=401, detail="Authentication required")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT * FROM bases ORDER BY name")
        
        if not rows:
            raise HTTPException(status_code=404, detail="No bases found")
        
        headers = [
            "Base ID", "Name", "Type", "Latitude", "Longitude",
            "Capacity", "Description"
        ]
        
        data_rows = [
            [
                row['id'], row['name'], row['type'],
                row['lat'], row['lon'],
                row['capacity'] or 'N/A',
                row['description'] or ''
            ]
            for row in rows
        ]
        
        csv_content = generate_csv(headers, data_rows)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=aegis_bases_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )


@router.get("/operations-report.csv")
async def export_operations_report_csv(
    request: Request,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    role: str = Depends(bearer_role)
):
    """
    Generate comprehensive operations report for a date range.
    Includes assets status, missions, alerts, and inventory status.
    """
    if role not in ["admin", "contractor"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")
    
    # Parse dates
    try:
        if start_date:
            start_dt = datetime.fromisoformat(start_date)
        else:
            start_dt = datetime.now() - timedelta(days=7)
        
        if end_date:
            end_dt = datetime.fromisoformat(end_date)
        else:
            end_dt = datetime.now()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format (YYYY-MM-DD)")
    
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Get summary statistics
        total_assets = await conn.fetchval("SELECT COUNT(*) FROM assets")
        active_missions = await conn.fetchval(
            "SELECT COUNT(*) FROM missions WHERE status = 'active'"
        )
        critical_alerts = await conn.fetchval(
            "SELECT COUNT(*) FROM alerts WHERE acknowledged = false AND severity = 'critical'"
        )
        low_stock_items = await conn.fetchval(
            "SELECT COUNT(*) FROM inventory WHERE quantity < min_stock_level"
        )
        
        # Build report
        headers = ["Metric", "Value"]
        data_rows = [
            ["Report Generated", datetime.now().strftime('%Y-%m-%d %H:%M:%S')],
            ["Period Start", start_dt.strftime('%Y-%m-%d')],
            ["Period End", end_dt.strftime('%Y-%m-%d')],
            [""],
            ["Total Assets", total_assets],
            ["Active Missions", active_missions],
            ["Critical Alerts", critical_alerts],
            ["Low Stock Items", low_stock_items],
        ]
        
        csv_content = generate_csv(headers, data_rows)
        
        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={
                "Content-Disposition": f"attachment; filename=aegis_operations_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv"
            }
        )
