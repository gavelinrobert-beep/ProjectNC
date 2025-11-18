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