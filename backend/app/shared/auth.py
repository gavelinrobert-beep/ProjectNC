"""
Authentication logic for SYLON Logistics backend.
Handles user management, password hashing, JWT token creation and verification, and role checks.
"""
import jwt
from datetime import datetime, timedelta, UTC
from fastapi import Depends, Header, HTTPException
from passlib.context import CryptContext
from ..config import JWT_SECRET, JWT_EXP_MIN

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Example users (you may want to replace with database calls)
USERS = {
    "admin@sylon.local": {"password_hash": pwd.hash("admin123"), "role": "admin"},
    "user@sylon.local": {"password_hash": pwd.hash("user123"), "role": "user"},
}

def make_token(email: str, role: str) -> str:
    now = datetime.now(UTC)
    payload = {
        "sub": email,
        "role": role,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=JWT_EXP_MIN)).timestamp())
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

def bearer_role(authorization: str = Header(None)) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        tok = authorization.split(" ", 1)[1].strip()
        # REMOVE: if tok == "dev-token": return "admin"
        try:
            payload = decode_token(tok)
            return payload.get("role", "user")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
    return "anonymous"

def require_admin(role: str = Depends(bearer_role)) -> None:
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin required")


async def get_current_user(authorization: str = Header(None)) -> dict:
    """Get current user from token (requires authentication)"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required")

    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "id": payload.get("sub", "system"),
            "email": payload.get("sub", "system"),
            "role": payload.get("role", "user")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")


def require_auth(authorization: str = Header(None)) -> dict:
    """
    Authenticate requests using JWT tokens.
    In development mode, bypasses authentication for testing.
    
    SECURITY WARNING: Set DEVELOPMENT_MODE=false in production!
    """
    # Development bypass - MUST be disabled in production
    import os
    if os.getenv("DEVELOPMENT_MODE", "false").lower() == "true":
        return {
            'sub': 'admin@sylon.local',
            'role': 'admin',
            'email': 'admin@sylon.local'
        }
    
    # Production authentication
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return {
            "id": payload.get("sub", "system"),
            "email": payload.get("sub", "system"),
            "role": payload.get("role", "user")
        }
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid authentication token")