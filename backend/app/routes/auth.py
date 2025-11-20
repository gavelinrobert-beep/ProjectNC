"""
Authentication routes (login).
"""
from fastapi import APIRouter, HTTPException, Request, Depends
from ..shared.models import LoginIn, LoginOut
from ..shared.auth import make_token, pwd
from ..shared.database import get_pool

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/login", response_model=LoginOut)
async def login(creds: LoginIn, request: Request):
    """Login with email and password from database"""
    pool = await get_pool(request.app)

    async with pool.acquire() as conn:
        # Query user from database
        user = await conn.fetchrow(
            "SELECT id, email, password_hash, role, first_name, last_name, driver_id FROM users WHERE email = $1 AND active = true",
            creds.email
        )

    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not pwd.verify(creds.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Update last_login
    async with pool.acquire() as conn:
        await conn.execute(
            "UPDATE users SET last_login = NOW() WHERE id = $1",
            user["id"]
        )

    # Create token
    token = make_token(user["email"], user["role"])

    return {
        "access_token": token,
        "role": user["role"],
        "user": {
            "id": user["id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "role": user["role"],
            "driver_id": user["driver_id"]
        }
    }