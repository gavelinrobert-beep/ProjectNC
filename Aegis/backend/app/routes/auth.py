"""
Authentication routes (login).
"""
from fastapi import APIRouter, HTTPException
from ..models import LoginIn, LoginOut
from ..auth import USERS, make_token, pwd

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/login", response_model=LoginOut)
async def login(creds: LoginIn):
    user = USERS.get(creds.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not pwd.verify(creds.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = make_token(creds.email, user.get("role", "user"))
    return {"access_token": token, "role": user.get("role", "user")}
