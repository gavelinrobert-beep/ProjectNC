from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

router = APIRouter()


class Message(BaseModel):
    channel: str
    sender: str
    content: str
    priority: str = "normal"
    encrypted: bool = False


@router.get("/channels")
def get_channels():
    """Get all available communication channels"""
    return {
        "channels": [
            {"id": "command", "name": "Command Net", "icon": "🎖️", "status": "active"},
            {"id": "logistics", "name": "Logistics Net", "icon": "📦", "status": "active"},
            {"id": "tactical", "name": "Tactical Net", "icon": "⚔️", "status": "active"},
            {"id": "emergency", "name": "Emergency", "icon": "🚨", "status": "standby"}
        ]
    }


@router.get("/messages/{channel}")
async def get_messages(channel: str, limit: int = 50, request: Request = None):
    """Get messages for a specific channel"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            rows = await conn.fetch("""
                SELECT id, channel, sender, content, priority, encrypted, timestamp, read
                FROM messages
                WHERE channel = $1
                ORDER BY timestamp DESC
                LIMIT $2
            """, channel, limit)

            messages = []
            for row in rows:
                messages.append({
                    "id": row['id'],
                    "channel": row['channel'],
                    "sender": row['sender'],
                    "content": row['content'],
                    "priority": row['priority'],
                    "encrypted": row['encrypted'],
                    "timestamp": row['timestamp'].isoformat() if row['timestamp'] else None,
                    "read": row['read']
                })

            return {"messages": messages}
    except Exception as e:
        print(f"Error fetching messages: {e}")
        return {"messages": [], "error": str(e)}


@router.post("/messages")
async def send_message(msg: Message, request: Request):
    """Send a message to a channel"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            row = await conn.fetchrow("""
                INSERT INTO messages (channel, sender, content, priority, encrypted, timestamp, read)
                VALUES ($1, $2, $3, $4, $5, NOW(), FALSE)
                RETURNING id, timestamp
            """, msg.channel, msg.sender, msg.content, msg.priority, msg.encrypted)

            return {
                "success": True,
                "id": row['id'],
                "timestamp": row['timestamp'].isoformat()
            }
    except Exception as e:
        print(f"Error sending message: {e}")
        return {"success": False, "error": str(e)}


@router.put("/messages/{message_id}/read")
async def mark_read(message_id: int, request: Request):
    """Mark a message as read"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            await conn.execute("UPDATE messages SET read = TRUE WHERE id = $1", message_id)
            return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


@router.delete("/messages/{message_id}")
async def delete_message(message_id: int, request: Request):
    """Delete a message"""
    try:
        pool = request.app.state.pool
        async with pool.acquire() as conn:
            await conn.execute("DELETE FROM messages WHERE id = $1", message_id)
            return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}