"""
Inventory management endpoints for tracking materials, supplies, and equipment.
"""
from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Optional
from uuid import uuid4
from datetime import datetime

from ..models import InventoryItemIn, InventoryItemOut, InventoryTransactionIn, InventoryTransactionOut
from ..auth import require_admin, get_current_user
from ..database import get_pool

router = APIRouter(prefix="/api/inventory", tags=["inventory"])


@router.get("/items", response_model=List[InventoryItemOut])
async def get_inventory_items(
    location_type: Optional[str] = None,
    location_id: Optional[str] = None,
    category: Optional[str] = None,
    low_stock: bool = False
):
    """Get all inventory items with optional filters"""
    pool = await get_pool()

    query = "SELECT * FROM inventory_items WHERE 1=1"
    params = []
    param_count = 1

    if location_type:
        query += f" AND location_type = ${param_count}"
        params.append(location_type)
        param_count += 1

    if location_id:
        query += f" AND location_id = ${param_count}"
        params.append(location_id)
        param_count += 1

    if category:
        query += f" AND category = ${param_count}"
        params.append(category)
        param_count += 1

    if low_stock:
        query += " AND quantity <= min_stock_level"

    query += " ORDER BY name"

    async with pool.acquire() as conn:
        rows = await conn.fetch(query, *params)
        return [dict(row) for row in rows]


@router.get("/items/{item_id}", response_model=InventoryItemOut)
async def get_inventory_item(item_id: str):
    """Get a specific inventory item"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow("SELECT * FROM inventory_items WHERE id = $1", item_id)
        if not row:
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return dict(row)


@router.post("/items", response_model=InventoryItemOut, dependencies=[Depends(require_admin)])
async def create_inventory_item(payload: InventoryItemIn):
    """Create a new inventory item"""
    item_id = payload.id or f"inv-{uuid4().hex[:8]}"
    pool = await get_pool()

    async with pool.acquire() as conn:
        # Check if location exists
        if payload.location_type == "base":
            base = await conn.fetchrow("SELECT id FROM bases WHERE id = $1", payload.location_id)
            if not base:
                raise HTTPException(status_code=404, detail="Base not found")
        elif payload.location_type == "asset":
            asset = await conn.fetchrow("SELECT id FROM assets WHERE id = $1", payload.location_id)
            if not asset:
                raise HTTPException(status_code=404, detail="Asset not found")

        await conn.execute("""
            INSERT INTO inventory_items (
                id, name, type, category, quantity, unit,
                weight_per_unit, volume_per_unit, location_type, location_id,
                min_stock_level, max_stock_level, expiration_date, description
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        """,
            item_id, payload.name, payload.type, payload.category, payload.quantity,
            payload.unit, payload.weight_per_unit, payload.volume_per_unit,
            payload.location_type, payload.location_id, payload.min_stock_level,
            payload.max_stock_level, payload.expiration_date, payload.description
        )

        row = await conn.fetchrow("SELECT * FROM inventory_items WHERE id = $1", item_id)
        return dict(row)


@router.put("/items/{item_id}", response_model=InventoryItemOut, dependencies=[Depends(require_admin)])
async def update_inventory_item(item_id: str, payload: InventoryItemIn):
    """Update an inventory item"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        existing = await conn.fetchrow("SELECT * FROM inventory_items WHERE id = $1", item_id)
        if not existing:
            raise HTTPException(status_code=404, detail="Inventory item not found")

        await conn.execute("""
            UPDATE inventory_items SET
                name = $2, type = $3, category = $4, quantity = $5, unit = $6,
                weight_per_unit = $7, volume_per_unit = $8,
                location_type = $9, location_id = $10,
                min_stock_level = $11, max_stock_level = $12,
                expiration_date = $13, description = $14,
                updated_at = NOW()
            WHERE id = $1
        """,
            item_id, payload.name, payload.type, payload.category, payload.quantity,
            payload.unit, payload.weight_per_unit, payload.volume_per_unit,
            payload.location_type, payload.location_id, payload.min_stock_level,
            payload.max_stock_level, payload.expiration_date, payload.description
        )

        row = await conn.fetchrow("SELECT * FROM inventory_items WHERE id = $1", item_id)
        return dict(row)


@router.delete("/items/{item_id}", dependencies=[Depends(require_admin)])
async def delete_inventory_item(item_id: str):
    """Delete an inventory item"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute("DELETE FROM inventory_items WHERE id = $1", item_id)
        if result == "DELETE 0":
            raise HTTPException(status_code=404, detail="Inventory item not found")
        return {"ok": True}


@router.post("/transactions", response_model=InventoryTransactionOut)
async def create_transaction(payload: InventoryTransactionIn, user_email: str = Depends(get_current_user)):
    """Record an inventory transaction"""
    pool = await get_pool()

    async with pool.acquire() as conn:
        # Verify item exists
        item = await conn.fetchrow("SELECT * FROM inventory_items WHERE id = $1", payload.item_id)
        if not item:
            raise HTTPException(status_code=404, detail="Inventory item not found")

        # Handle different transaction types
        if payload.transaction_type == "add" or payload.transaction_type == "restock":
            new_quantity = item['quantity'] + payload.quantity
            await conn.execute(
                "UPDATE inventory_items SET quantity = $1, updated_at = NOW() WHERE id = $2",
                new_quantity, payload.item_id
            )

        elif payload.transaction_type == "remove" or payload.transaction_type == "consume":
            if item['quantity'] < payload.quantity:
                raise HTTPException(status_code=400, detail="Insufficient inventory")
            new_quantity = item['quantity'] - payload.quantity
            await conn.execute(
                "UPDATE inventory_items SET quantity = $1, updated_at = NOW() WHERE id = $2",
                new_quantity, payload.item_id
            )

        elif payload.transaction_type == "transfer":
            if not payload.to_location_id or not payload.to_location_type:
                raise HTTPException(status_code=400, detail="Transfer requires destination")
            if item['quantity'] < payload.quantity:
                raise HTTPException(status_code=400, detail="Insufficient inventory")

            # Remove from source
            new_quantity = item['quantity'] - payload.quantity
            await conn.execute(
                "UPDATE inventory_items SET quantity = $1, updated_at = NOW() WHERE id = $2",
                new_quantity, payload.item_id
            )

            # Add to destination (create or update)
            dest_item = await conn.fetchrow("""
                SELECT * FROM inventory_items
                WHERE name = $1 AND location_type = $2 AND location_id = $3
            """, item['name'], payload.to_location_type, payload.to_location_id)

            if dest_item:
                await conn.execute("""
                    UPDATE inventory_items SET quantity = quantity + $1, updated_at = NOW()
                    WHERE id = $2
                """, payload.quantity, dest_item['id'])
            else:
                new_id = f"inv-{uuid4().hex[:8]}"
                await conn.execute("""
                    INSERT INTO inventory_items (
                        id, name, type, category, quantity, unit,
                        weight_per_unit, volume_per_unit, location_type, location_id,
                        min_stock_level, description
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                """,
                    new_id, item['name'], item['type'], item['category'], payload.quantity,
                    item['unit'], item['weight_per_unit'], item['volume_per_unit'],
                    payload.to_location_type, payload.to_location_id,
                    item['min_stock_level'], item['description']
                )

        # Record transaction
        row = await conn.fetchrow("""
            INSERT INTO inventory_transactions (
                item_id, transaction_type, quantity,
                from_location_type, from_location_id,
                to_location_type, to_location_id,
                asset_id, user_email, notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        """,
            payload.item_id, payload.transaction_type, payload.quantity,
            payload.from_location_type, payload.from_location_id,
            payload.to_location_type, payload.to_location_id,
            payload.asset_id, user_email, payload.notes
        )

        return dict(row)


@router.get("/transactions", response_model=List[InventoryTransactionOut])
async def get_transactions(item_id: Optional[str] = None, limit: int = 100):
    """Get inventory transaction history"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        if item_id:
            rows = await conn.fetch(
                "SELECT * FROM inventory_transactions WHERE item_id = $1 ORDER BY timestamp DESC LIMIT $2",
                item_id, limit
            )
        else:
            rows = await conn.fetch(
                "SELECT * FROM inventory_transactions ORDER BY timestamp DESC LIMIT $1",
                limit
            )
        return [dict(row) for row in rows]


@router.get("/alerts", response_model=List[dict])
async def get_inventory_alerts():
    """Get low stock alerts"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("""
            SELECT i.*, b.name as location_name
            FROM inventory_items i
            LEFT JOIN bases b ON i.location_type = 'base' AND i.location_id = b.id
            WHERE i.quantity <= i.min_stock_level
            ORDER BY (i.quantity / NULLIF(i.min_stock_level, 0)) ASC
        """)
        return [dict(row) for row in rows]