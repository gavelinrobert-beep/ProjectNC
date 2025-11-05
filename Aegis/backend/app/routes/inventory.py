from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

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

# In-memory storage (you can switch to DB later)
inventory_items = []

@router.get('/items')
async def get_inventory_items(location_id: Optional[str] = None):
    """Get all inventory items, optionally filtered by location"""
    if location_id:
        return [item for item in inventory_items if item.get('location_id') == location_id]
    return inventory_items

@router.post('/items')
async def create_inventory_item(item: InventoryItemCreate):
    """Create a new inventory item"""
    new_item = {
        'id': str(uuid.uuid4()),
        'name': item.name,
        'category': item.category,
        'quantity': item.quantity,
        'unit': item.unit,
        'location_id': item.location_id,
        'min_stock_level': item.min_stock_level,
        'max_stock_level': item.max_stock_level,
        'last_updated': datetime.utcnow().isoformat()
    }
    inventory_items.append(new_item)
    return new_item

@router.put('/items/{item_id}')
async def update_inventory_item(item_id: str, quantity: int):
    """Update inventory item quantity"""
    for item in inventory_items:
        if item['id'] == item_id:
            item['quantity'] = quantity
            item['last_updated'] = datetime.utcnow().isoformat()
            return item
    raise HTTPException(status_code=404, detail='Item not found')

@router.delete('/items/{item_id}')
async def delete_inventory_item(item_id: str):
    """Delete an inventory item"""
    global inventory_items
    inventory_items = [item for item in inventory_items if item['id'] != item_id]
    return {'message': 'Item deleted'}