"""
Weather endpoints (uses Aegis/backend/app/weather.py).
"""
from fastapi import APIRouter, HTTPException
from ..database import get_pool
from .. import weather as weather_module

router = APIRouter(prefix="", tags=["weather"])


@router.get("/weather/{base_id}")
async def get_base_weather(base_id: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        base = await conn.fetchrow("SELECT lat, lon FROM bases WHERE id = $1", base_id)
        if not base:
            raise HTTPException(status_code=404, detail="Base not found")

    weather = await weather_module.get_weather(base["lat"], base["lon"])
    if not weather:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    return weather


@router.get("/weather/location/{lat}/{lon}")
async def get_location_weather(lat: float, lon: float):
    weather = await weather_module.get_weather(lat, lon)
    if not weather:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    return weather


@router.get("/forecast/{base_id}")
async def get_base_forecast(base_id: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        base = await conn.fetchrow("SELECT lat, lon FROM bases WHERE id = $1", base_id)
        if not base:
            raise HTTPException(status_code=404, detail="Base not found")

    forecast = await weather_module.get_forecast(base["lat"], base["lon"])
    if not forecast:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    return forecast
