"""
Routes package initializer.
"""
from fastapi import APIRouter

router = APIRouter()
# individual route modules register their own routers; main.py will include them directly
