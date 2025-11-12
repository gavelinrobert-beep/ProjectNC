from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta
import random

router = APIRouter()


class IntelReport(BaseModel):
    report_type: str
    title: str
    content: str
    threat_level: str = "low"
    source: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    created_by: Optional[str] = "system"


class Threat(BaseModel):
    name: str
    threat_type: str
    severity: str = "low"
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    description: Optional[str] = None


class SigintIntercept(BaseModel):
    frequency: Optional[str] = None
    content: str
    source_location_lat: Optional[float] = None
    source_location_lon: Optional[float] = None
    classification: str = "unclassified"


# Dashboard overview
@router.get("/dashboard")
async def get_intel_dashboard(request: Request):
    """Get intelligence dashboard overview"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            # Count reports by type
            reports = await conn.fetch("""
                SELECT report_type, COUNT(*) as count
                FROM intelligence_reports
                WHERE status = 'active'
                GROUP BY report_type
            """)

            # Count threats by severity
            threats = await conn.fetch("""
                SELECT severity, COUNT(*) as count
                FROM threats
                WHERE status = 'active'
                GROUP BY severity
            """)

            # Recent intercepts
            intercepts_count = await conn.fetchval("""
                SELECT COUNT(*) FROM sigint_intercepts
                WHERE intercept_time > NOW() - INTERVAL '24 hours'
            """)

            # Active threats
            active_threats = await conn.fetch("""
                SELECT * FROM threats
                WHERE status = 'active'
                ORDER BY last_updated DESC
                LIMIT 10
            """)

            return {
                "reports_by_type": {row['report_type']: row['count'] for row in reports},
                "threats_by_severity": {row['severity']: row['count'] for row in threats},
                "recent_intercepts": intercepts_count or 0,
                "active_threats": [dict(row) for row in active_threats]
            }
    except Exception as e:
        print(f"Dashboard error: {e}")
        return {
            "reports_by_type": {},
            "threats_by_severity": {},
            "recent_intercepts": 0,
            "active_threats": []
        }


# Intelligence Reports
@router.get("/reports")
async def get_reports(request: Request, report_type: Optional[str] = None):
    """Get intelligence reports"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            if report_type:
                rows = await conn.fetch("""
                    SELECT * FROM intelligence_reports
                    WHERE report_type = $1 AND status = 'active'
                    ORDER BY created_at DESC
                """, report_type)
            else:
                rows = await conn.fetch("""
                    SELECT * FROM intelligence_reports
                    WHERE status = 'active'
                    ORDER BY created_at DESC
                    LIMIT 50
                """)

            return {"reports": [dict(row) for row in rows]}
    except Exception as e:
        print(f"Error fetching reports: {e}")
        return {"reports": []}


@router.post("/reports")
async def create_report(report: IntelReport, request: Request):
    """Create new intelligence report"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO intelligence_reports 
                (report_type, title, content, threat_level, source, location_lat, location_lon, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id, created_at
            """, report.report_type, report.title, report.content, report.threat_level,
                                      report.source, report.location_lat, report.location_lon, report.created_by)

            return {"success": True, "id": row['id'], "created_at": row['created_at'].isoformat()}
    except Exception as e:
        print(f"Error creating report: {e}")
        return {"success": False, "error": str(e)}


# Threats
@router.get("/threats")
async def get_threats(request: Request):
    """Get active threats"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM threats
                WHERE status = 'active'
                ORDER BY 
                    CASE severity
                        WHEN 'critical' THEN 1
                        WHEN 'high' THEN 2
                        WHEN 'medium' THEN 3
                        WHEN 'low' THEN 4
                    END,
                    last_updated DESC
            """)

            return {"threats": [dict(row) for row in rows]}
    except Exception as e:
        print(f"Error fetching threats: {e}")
        return {"threats": []}


@router.post("/threats")
async def create_threat(threat: Threat, request: Request):
    """Create new threat"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO threats 
                (name, threat_type, severity, location_lat, location_lon, description)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id, first_detected
            """, threat.name, threat.threat_type, threat.severity,
                                      threat.location_lat, threat.location_lon, threat.description)

            return {"success": True, "id": row['id'], "first_detected": row['first_detected'].isoformat()}
    except Exception as e:
        print(f"Error creating threat: {e}")
        return {"success": False, "error": str(e)}


@router.put("/threats/{threat_id}/status")
async def update_threat_status(threat_id: int, status: str, request: Request):
    """Update threat status"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            await conn.execute("""
                UPDATE threats 
                SET status = $1, last_updated = NOW()
                WHERE id = $2
            """, status, threat_id)

            return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


# SIGINT Intercepts
@router.get("/sigint")
async def get_sigint(request: Request, limit: int = 50):
    """Get signals intelligence intercepts"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT * FROM sigint_intercepts
                ORDER BY intercept_time DESC
                LIMIT $1
            """, limit)

            return {"intercepts": [dict(row) for row in rows]}
    except Exception as e:
        print(f"Error fetching SIGINT: {e}")
        return {"intercepts": []}


@router.post("/sigint")
async def create_sigint(intercept: SigintIntercept, request: Request):
    """Log new SIGINT intercept"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO sigint_intercepts 
                (frequency, content, source_location_lat, source_location_lon, classification)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, intercept_time
            """, intercept.frequency, intercept.content,
                                      intercept.source_location_lat, intercept.source_location_lon,
                                      intercept.classification)

            return {"success": True, "id": row['id'], "intercept_time": row['intercept_time'].isoformat()}
    except Exception as e:
        print(f"Error creating SIGINT: {e}")
        return {"success": False, "error": str(e)}