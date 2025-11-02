"""
Authentication logic for Aegis backend.
Handles user management, password hashing, JWT token creation and verification, and role checks.
"""
import jwt
from datetime import datetime, timedelta, UTC
from fastapi import Depends, Header, HTTPException
from passlib.context import CryptContext
from .config import JWT_SECRET, JWT_EXP_MIN

pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Example users (you may want to replace with database calls)
USERS = {
    "admin@aegis.local": {"password_hash": pwd.hash("admin123"), "role": "admin"},
    "user@aegis.local": {"password_hash": pwd.hash("user123"), "role": "user"},
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
