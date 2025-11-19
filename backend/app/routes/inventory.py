from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid
from ..database import get_pool
from ..auth import require_auth

router = APIRouter(prefix='/api/inventory', tags=['inventory'])

class InventoryItemCreate(BaseModel):
    name: str
    category: str
    quantity: int
    unit: str
    location_id: str
    min_stock_level: int = 100
    max_stock_level: int = 10000

class InventoryItem(InventoryItemCreate):
    id: str
    last_updated: str

@router.get('/items')
async def get_inventory_items(
    request: Request,
    location_id: Optional[str] = None,
    _user: dict = Depends(require_auth)
):
    """Get all inventory items, optionally filtered by location"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        if location_id:
            rows = await conn.fetch("""
                SELECT id, name, type, category, quantity, unit, location_id, 
                       min_stock_level, max_stock_level, updated_at
                FROM inventory
                WHERE location_id = $1
                ORDER BY name
            """, location_id)
        else:
            rows = await conn.fetch("""
                SELECT id, name, type, category, quantity, unit, location_id,
                       min_stock_level, max_stock_level, updated_at
                FROM inventory
                ORDER BY name
            """)
        
        items = []
        for row in rows:
            items.append({
                'id': row['id'],
                'name': row['name'],
                'type': row['type'] if row['type'] else '',
                'category': row['category'],
                'quantity': int(row['quantity']) if row['quantity'] else 0,
                'unit': row['unit'],
                'location_id': row['location_id'],
                'min_stock_level': int(row['min_stock_level']) if row['min_stock_level'] else 100,
                'max_stock_level': int(row['max_stock_level']) if row['max_stock_level'] else 10000,
                'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
            })
        return items

@router.post('/items')
async def create_inventory_item(
    item: InventoryItemCreate,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Create a new inventory item"""
    item_id = str(uuid.uuid4())
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        # Insert the new inventory item
        await conn.execute("""
            INSERT INTO inventory (
                id, name, type, category, quantity, unit, location_id,
                min_stock_level, max_stock_level, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        """, item_id, item.name, item.category, item.category, 
            item.quantity, item.unit, item.location_id,
            item.min_stock_level, item.max_stock_level)
        
        # Fetch the created item
        row = await conn.fetchrow("""
            SELECT id, name, type, category, quantity, unit, location_id,
                   min_stock_level, max_stock_level, updated_at
            FROM inventory WHERE id = $1
        """, item_id)
        
        return {
            'id': row['id'],
            'name': row['name'],
            'category': row['category'],
            'quantity': int(row['quantity']) if row['quantity'] else 0,
            'unit': row['unit'],
            'location_id': row['location_id'],
            'min_stock_level': int(row['min_stock_level']) if row['min_stock_level'] else 100,
            'max_stock_level': int(row['max_stock_level']) if row['max_stock_level'] else 10000,
            'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
        }

@router.put('/items/{item_id}')
async def update_inventory_item(
    item_id: str,
    quantity: int,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Update inventory item quantity"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        # Update the quantity
        result = await conn.execute("""
            UPDATE inventory
            SET quantity = $1, updated_at = NOW()
            WHERE id = $2
        """, quantity, item_id)
        
        if result == 'UPDATE 0':
            raise HTTPException(status_code=404, detail='Item not found')
        
        # Fetch the updated item
        row = await conn.fetchrow("""
            SELECT id, name, type, category, quantity, unit, location_id,
                   min_stock_level, max_stock_level, updated_at
            FROM inventory WHERE id = $1
        """, item_id)
        
        if not row:
            raise HTTPException(status_code=404, detail='Item not found')
        
        return {
            'id': row['id'],
            'name': row['name'],
            'category': row['category'],
            'quantity': int(row['quantity']) if row['quantity'] else 0,
            'unit': row['unit'],
            'location_id': row['location_id'],
            'min_stock_level': int(row['min_stock_level']) if row['min_stock_level'] else 100,
            'max_stock_level': int(row['max_stock_level']) if row['max_stock_level'] else 10000,
            'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
        }

@router.delete('/items/{item_id}')
async def delete_inventory_item(
    item_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Delete an inventory item"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        result = await conn.execute("""
            DELETE FROM inventory WHERE id = $1
        """, item_id)
        
        if result == 'DELETE 0':
            raise HTTPException(status_code=404, detail='Item not found')
        
        return {'message': 'Item deleted'}


@router.get('/facilities')
async def get_facilities(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all facilities for inventory location dropdown"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, name, type, lat, lon
            FROM facilities
            ORDER BY name
        """)
        
        facilities = []
        for row in rows:
            facilities.append({
                'id': row['id'],
                'name': row['name'],
                'type': row['type'],
                'lat': row['lat'],
                'lon': row['lon']
            })
        return facilities


# ============================================================================
# CATEGORY MANAGEMENT
# ============================================================================

@router.get('/categories')
async def get_inventory_categories(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all inventory categories"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, name, description, created_at
            FROM inventory_categories
            ORDER BY name
        """)
        
        categories = []
        for row in rows:
            categories.append({
                'id': row['id'],
                'name': row['name'],
                'description': row['description'],
                'created_at': row['created_at'].isoformat() if row['created_at'] else None
            })
        return categories


@router.get('/categories/{category_id}/items')
async def get_items_by_category(
    category_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all items in a specific category"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, name, type, category, category_id, quantity, unit, 
                   status, location_id, assigned_to_asset_id, assigned_to_facility_id,
                   assigned_to_shipment_id, tracking_number, weight_kg, 
                   special_handling, updated_at
            FROM inventory
            WHERE category_id = $1
            ORDER BY name
        """, category_id)
        
        items = []
        for row in rows:
            items.append({
                'id': row['id'],
                'name': row['name'],
                'type': row['type'],
                'category': row['category'],
                'category_id': row['category_id'],
                'quantity': float(row['quantity']) if row['quantity'] else 0,
                'unit': row['unit'],
                'status': row['status'],
                'location_id': row['location_id'],
                'assigned_to_asset_id': row['assigned_to_asset_id'],
                'assigned_to_facility_id': row['assigned_to_facility_id'],
                'assigned_to_shipment_id': row['assigned_to_shipment_id'],
                'tracking_number': row['tracking_number'],
                'weight_kg': float(row['weight_kg']) if row['weight_kg'] else None,
                'special_handling': row['special_handling'],
                'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
            })
        return items


# ============================================================================
# VEHICLE EQUIPMENT
# ============================================================================

@router.get('/vehicle/{asset_id}/equipment')
async def get_vehicle_equipment(
    asset_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all equipment assigned to a vehicle"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Get vehicle info
        vehicle = await conn.fetchrow("""
            SELECT id, type, registration_number, make, model
            FROM assets
            WHERE id = $1
        """, asset_id)
        
        if not vehicle:
            raise HTTPException(status_code=404, detail='Vehicle not found')
        
        # Get equipment
        rows = await conn.fetch("""
            SELECT id, name, type, category, quantity, unit, status,
                   last_inspection_date, next_inspection_due, description
            FROM inventory
            WHERE assigned_to_asset_id = $1 AND category_id = 'vehicle_equipment'
            ORDER BY type, name
        """, asset_id)
        
        equipment = []
        for row in rows:
            equipment.append({
                'id': row['id'],
                'name': row['name'],
                'type': row['type'],
                'category': row['category'],
                'quantity': int(row['quantity']) if row['quantity'] else 0,
                'unit': row['unit'],
                'status': row['status'],
                'last_inspection_date': row['last_inspection_date'].isoformat() if row['last_inspection_date'] else None,
                'next_inspection_due': row['next_inspection_due'].isoformat() if row['next_inspection_due'] else None,
                'description': row['description']
            })
        
        return {
            'vehicle': {
                'id': vehicle['id'],
                'type': vehicle['type'],
                'registration_number': vehicle['registration_number'],
                'make': vehicle['make'],
                'model': vehicle['model']
            },
            'equipment': equipment
        }


@router.post('/vehicle/{asset_id}/assign')
async def assign_equipment_to_vehicle(
    asset_id: str,
    item_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Assign equipment to a vehicle"""
    pool = await get_pool(request.app)
    
    async with pool.acquire() as conn:
        # Check if vehicle exists
        vehicle = await conn.fetchrow("SELECT id FROM assets WHERE id = $1", asset_id)
        if not vehicle:
            raise HTTPException(status_code=404, detail='Vehicle not found')
        
        # Check if item exists
        item = await conn.fetchrow("SELECT id FROM inventory WHERE id = $1", item_id)
        if not item:
            raise HTTPException(status_code=404, detail='Item not found')
        
        # Assign equipment to vehicle
        await conn.execute("""
            UPDATE inventory
            SET assigned_to_asset_id = $1, 
                status = 'assigned',
                updated_at = NOW()
            WHERE id = $2
        """, asset_id, item_id)
        
        return {'message': 'Equipment assigned to vehicle', 'asset_id': asset_id, 'item_id': item_id}


# ============================================================================
# CARGO/DELIVERY TRACKING
# ============================================================================

@router.get('/cargo/in-transit')
async def get_cargo_in_transit(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all cargo currently in-transit"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT i.id, i.name, i.tracking_number, i.status, i.weight_kg,
                   i.special_handling, i.customer_info, i.assigned_to_asset_id,
                   a.registration_number, a.type as vehicle_type,
                   i.updated_at
            FROM inventory i
            LEFT JOIN assets a ON i.assigned_to_asset_id = a.id
            WHERE i.category_id = 'cargo_delivery' AND i.status = 'in_transit'
            ORDER BY i.updated_at DESC
        """)
        
        cargo = []
        for row in rows:
            cargo.append({
                'id': row['id'],
                'name': row['name'],
                'tracking_number': row['tracking_number'],
                'status': row['status'],
                'weight_kg': float(row['weight_kg']) if row['weight_kg'] else None,
                'special_handling': row['special_handling'],
                'customer_info': row['customer_info'],
                'vehicle': {
                    'id': row['assigned_to_asset_id'],
                    'registration_number': row['registration_number'],
                    'type': row['vehicle_type']
                } if row['assigned_to_asset_id'] else None,
                'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
            })
        return cargo


@router.get('/shipment/{shipment_id}/cargo')
async def get_shipment_cargo(
    shipment_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all cargo items for a specific shipment"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT id, name, type, tracking_number, status, quantity, unit,
                   weight_kg, dimensions_cm, special_handling, customer_info,
                   assigned_to_asset_id, updated_at
            FROM inventory
            WHERE assigned_to_shipment_id = $1 AND category_id = 'cargo_delivery'
            ORDER BY name
        """, shipment_id)
        
        cargo = []
        for row in rows:
            cargo.append({
                'id': row['id'],
                'name': row['name'],
                'type': row['type'],
                'tracking_number': row['tracking_number'],
                'status': row['status'],
                'quantity': int(row['quantity']) if row['quantity'] else 0,
                'unit': row['unit'],
                'weight_kg': float(row['weight_kg']) if row['weight_kg'] else None,
                'dimensions_cm': row['dimensions_cm'],
                'special_handling': row['special_handling'],
                'customer_info': row['customer_info'],
                'assigned_to_asset_id': row['assigned_to_asset_id'],
                'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
            })
        return cargo


@router.get('/cargo/track/{tracking_number}')
async def track_cargo_item(
    tracking_number: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Track a cargo item by tracking number"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            SELECT i.id, i.name, i.tracking_number, i.status, i.weight_kg,
                   i.dimensions_cm, i.special_handling, i.customer_info,
                   i.assigned_to_asset_id, i.assigned_to_shipment_id,
                   a.registration_number, a.type as vehicle_type, a.lat, a.lon,
                   i.created_at, i.updated_at
            FROM inventory i
            LEFT JOIN assets a ON i.assigned_to_asset_id = a.id
            WHERE i.tracking_number = $1 AND i.category_id = 'cargo_delivery'
        """, tracking_number)
        
        if not row:
            raise HTTPException(status_code=404, detail='Tracking number not found')
        
        return {
            'id': row['id'],
            'name': row['name'],
            'tracking_number': row['tracking_number'],
            'status': row['status'],
            'weight_kg': float(row['weight_kg']) if row['weight_kg'] else None,
            'dimensions_cm': row['dimensions_cm'],
            'special_handling': row['special_handling'],
            'customer_info': row['customer_info'],
            'assigned_to_shipment_id': row['assigned_to_shipment_id'],
            'vehicle': {
                'id': row['assigned_to_asset_id'],
                'registration_number': row['registration_number'],
                'type': row['vehicle_type'],
                'lat': float(row['lat']) if row['lat'] else None,
                'lon': float(row['lon']) if row['lon'] else None
            } if row['assigned_to_asset_id'] else None,
            'created_at': row['created_at'].isoformat() if row['created_at'] else None,
            'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
        }


# ============================================================================
# FACILITY STOCK
# ============================================================================

@router.get('/facility/{facility_id}/stock')
async def get_facility_stock(
    facility_id: str,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get all inventory at a facility"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        # Get facility info
        facility = await conn.fetchrow("""
            SELECT id, name, type
            FROM facilities
            WHERE id = $1
        """, facility_id)
        
        if not facility:
            raise HTTPException(status_code=404, detail='Facility not found')
        
        # Get stock
        rows = await conn.fetch("""
            SELECT id, name, type, category, quantity, unit, 
                   min_stock_level, max_stock_level, status,
                   unit_cost, currency, description, updated_at
            FROM inventory
            WHERE assigned_to_facility_id = $1 AND category_id = 'facility_stock'
            ORDER BY type, name
        """, facility_id)
        
        stock = []
        for row in rows:
            stock.append({
                'id': row['id'],
                'name': row['name'],
                'type': row['type'],
                'category': row['category'],
                'quantity': float(row['quantity']) if row['quantity'] else 0,
                'unit': row['unit'],
                'min_stock_level': float(row['min_stock_level']) if row['min_stock_level'] else 0,
                'max_stock_level': float(row['max_stock_level']) if row['max_stock_level'] else 0,
                'status': row['status'],
                'unit_cost': float(row['unit_cost']) if row['unit_cost'] else 0,
                'currency': row['currency'],
                'description': row['description'],
                'last_updated': row['updated_at'].isoformat() if row['updated_at'] else None
            })
        
        return {
            'facility': {
                'id': facility['id'],
                'name': facility['name'],
                'type': facility['type']
            },
            'stock': stock
        }


@router.get('/alerts/low-stock')
async def get_low_stock_alerts(
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Get items below minimum threshold"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT i.id, i.name, i.type, i.quantity, i.unit, 
                   i.min_stock_level, i.assigned_to_facility_id,
                   f.name as facility_name
            FROM inventory i
            LEFT JOIN facilities f ON i.assigned_to_facility_id = f.id
            WHERE i.category_id = 'facility_stock' 
                AND i.quantity < i.min_stock_level
            ORDER BY (i.quantity / NULLIF(i.min_stock_level, 0)) ASC
        """)
        
        alerts = []
        for row in rows:
            alerts.append({
                'id': row['id'],
                'name': row['name'],
                'type': row['type'],
                'quantity': float(row['quantity']) if row['quantity'] else 0,
                'unit': row['unit'],
                'min_stock_level': float(row['min_stock_level']) if row['min_stock_level'] else 0,
                'facility_id': row['assigned_to_facility_id'],
                'facility_name': row['facility_name']
            })
        return alerts


class TransferRequest(BaseModel):
    item_id: str
    from_location_type: str
    from_location_id: str
    to_location_type: str
    to_location_id: str
    notes: Optional[str] = None


@router.post('/transfer')
async def create_inventory_transfer(
    transfer: TransferRequest,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Transfer inventory between locations"""
    pool = await get_pool(request.app)
    transfer_id = str(uuid.uuid4())
    
    async with pool.acquire() as conn:
        # Verify item exists
        item = await conn.fetchrow("SELECT id FROM inventory WHERE id = $1", transfer.item_id)
        if not item:
            raise HTTPException(status_code=404, detail='Item not found')
        
        # Create transfer record
        await conn.execute("""
            INSERT INTO inventory_transfers 
            (id, item_id, from_location_type, from_location_id, 
             to_location_type, to_location_id, status, initiated_by, notes)
            VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
        """, transfer_id, transfer.item_id, transfer.from_location_type, 
            transfer.from_location_id, transfer.to_location_type, 
            transfer.to_location_id, _user.get('email'), transfer.notes)
        
        return {
            'id': transfer_id,
            'message': 'Transfer initiated',
            'status': 'pending'
        }


# ============================================================================
# FUEL TRACKING
# ============================================================================

class FuelRefuelRequest(BaseModel):
    asset_id: str
    facility_id: str
    quantity_liters: float
    cost_sek: Optional[float] = None
    odometer_km: Optional[int] = None
    fuel_type: str = 'diesel'
    notes: Optional[str] = None


@router.post('/fuel/refuel')
async def record_refuel(
    refuel: FuelRefuelRequest,
    request: Request,
    _user: dict = Depends(require_auth)
):
    """Record a refueling transaction"""
    pool = await get_pool(request.app)
    fuel_id = str(uuid.uuid4())
    
    async with pool.acquire() as conn:
        # Get driver from asset
        driver = await conn.fetchrow("""
            SELECT current_driver_id FROM assets WHERE id = $1
        """, refuel.asset_id)
        
        driver_id = driver['current_driver_id'] if driver else None
        
        # Record fuel transaction
        await conn.execute("""
            INSERT INTO fuel_tracking 
            (id, asset_id, facility_id, quantity_liters, cost_sek, 
             odometer_km, fuel_type, driver_id, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """, fuel_id, refuel.asset_id, refuel.facility_id, refuel.quantity_liters,
            refuel.cost_sek, refuel.odometer_km, refuel.fuel_type, driver_id, refuel.notes)
        
        # Update vehicle fuel level
        await conn.execute("""
            UPDATE assets
            SET fuel_level = LEAST(fuel_capacity, fuel_level + $1),
                updated_at = NOW()
            WHERE id = $2
        """, refuel.quantity_liters, refuel.asset_id)
        
        return {
            'id': fuel_id,
            'message': 'Refueling recorded',
            'quantity_liters': refuel.quantity_liters
        }


@router.get('/fuel/vehicle/{asset_id}/history')
async def get_fuel_history(
    asset_id: str,
    request: Request,
    limit: int = 50,
    _user: dict = Depends(require_auth)
):
    """Get fuel history for a vehicle"""
    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT f.id, f.quantity_liters, f.cost_sek, f.odometer_km,
                   f.fuel_type, f.timestamp, f.notes,
                   fac.name as facility_name,
                   d.first_name || ' ' || d.last_name as driver_name
            FROM fuel_tracking f
            LEFT JOIN facilities fac ON f.facility_id = fac.id
            LEFT JOIN drivers d ON f.driver_id = d.id
            WHERE f.asset_id = $1
            ORDER BY f.timestamp DESC
            LIMIT $2
        """, asset_id, limit)
        
        history = []
        for row in rows:
            history.append({
                'id': row['id'],
                'quantity_liters': float(row['quantity_liters']),
                'cost_sek': float(row['cost_sek']) if row['cost_sek'] else None,
                'odometer_km': row['odometer_km'],
                'fuel_type': row['fuel_type'],
                'timestamp': row['timestamp'].isoformat(),
                'facility_name': row['facility_name'],
                'driver_name': row['driver_name'],
                'notes': row['notes']
            })
        return history


@router.get('/fuel/consumption-report')
async def get_fuel_consumption_report(
    request: Request,
    period: str = '7days',
    _user: dict = Depends(require_auth)
):
    """Get fuel consumption analytics"""
    pool = await get_pool(request.app)
    
    # Parse period
    interval_map = {
        '7days': '7 days',
        '30days': '30 days',
        '90days': '90 days'
    }
    interval = interval_map.get(period, '7 days')
    
    async with pool.acquire() as conn:
        # Total consumption by vehicle
        rows = await conn.fetch(f"""
            SELECT a.id, a.registration_number, a.make, a.model,
                   SUM(f.quantity_liters) as total_liters,
                   SUM(f.cost_sek) as total_cost,
                   COUNT(*) as refuel_count
            FROM fuel_tracking f
            JOIN assets a ON f.asset_id = a.id
            WHERE f.timestamp >= NOW() - INTERVAL '{interval}'
            GROUP BY a.id, a.registration_number, a.make, a.model
            ORDER BY total_liters DESC
        """)
        
        by_vehicle = []
        for row in rows:
            by_vehicle.append({
                'vehicle_id': row['id'],
                'registration_number': row['registration_number'],
                'make': row['make'],
                'model': row['model'],
                'total_liters': float(row['total_liters']) if row['total_liters'] else 0,
                'total_cost': float(row['total_cost']) if row['total_cost'] else 0,
                'refuel_count': row['refuel_count']
            })
        
        # Overall summary
        summary = await conn.fetchrow(f"""
            SELECT SUM(quantity_liters) as total_liters,
                   SUM(cost_sek) as total_cost,
                   COUNT(*) as total_refuels,
                   COUNT(DISTINCT asset_id) as vehicles_refueled
            FROM fuel_tracking
            WHERE timestamp >= NOW() - INTERVAL '{interval}'
        """)
        
        return {
            'period': period,
            'summary': {
                'total_liters': float(summary['total_liters']) if summary['total_liters'] else 0,
                'total_cost': float(summary['total_cost']) if summary['total_cost'] else 0,
                'total_refuels': summary['total_refuels'],
                'vehicles_refueled': summary['vehicles_refueled']
            },
            'by_vehicle': by_vehicle
        }