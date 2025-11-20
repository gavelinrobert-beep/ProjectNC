"""
Pydantic models for Field module.
Handles mobile sync endpoints, offline data queue, and field sessions.
"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime


# ============================================================================
# FIELD OPERATIONS MODELS
# ============================================================================

class OfflineTask(BaseModel):
    """Task data for offline mobile operations"""
    task_id: str
    task_type: str
    priority: str
    status: str
    data: Dict[str, Any]
    synced: bool = False
    created_offline: bool = False


class SyncQueue(BaseModel):
    """Queue entry for offline data synchronization"""
    id: Optional[str] = None
    device_id: str
    user_id: str
    operation_type: str  # create, update, delete
    entity_type: str  # shipment, driver_log, proof_of_delivery, etc.
    entity_id: Optional[str] = None
    payload: Dict[str, Any]
    timestamp: datetime
    synced: bool = False
    sync_attempts: int = 0
    last_sync_attempt: Optional[datetime] = None
    error_message: Optional[str] = None


class FieldSession(BaseModel):
    """Mobile app session tracking"""
    id: Optional[str] = None
    user_id: str
    device_id: str
    app_version: str
    platform: str  # ios, android, web
    session_start: datetime
    session_end: Optional[datetime] = None
    last_sync: Optional[datetime] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
