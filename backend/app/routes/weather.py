import os
import time
from fastapi import APIRouter, HTTPException, Request
import httpx

router = APIRouter(prefix="/api", tags=["weather"])

OPENWEATHER_KEY = os.getenv("OPENWEATHER_API_KEY") or ""
OW_URL = "https://api.openweathermap.org/data/2.5/weather"
CACHE_TTL = 60
_cache = {}


def _cache_get(key: str):
    entry = _cache.get(key)
    if not entry:
        return None
    ts, data = entry
    if time.time() - ts > CACHE_TTL:
        del _cache[key]
        return None
    return data


def _cache_set(key: str, data):
    _cache[key] = (time.time(), data)


async def _fetch_weather(lat: float, lon: float) -> dict:
    """Fetch weather data for given coordinates."""
    if not OPENWEATHER_KEY:
        # Return mock data for development/testing
        return {
            "temperature": 15.5,
            "feels_like": 14.2,
            "humidity": 65,
            "pressure": 1013,
            "wind_speed": 12,
            "wind_deg": 180,
            "condition": "Cloudy",
            "description": "Partly cloudy (mock data - API key not configured)",
            "provider_raw": {},
        }

    key = f"{lat:.4f}:{lon:.4f}"
    cached = _cache_get(key)
    if cached:
        return cached

    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_KEY,
        "units": "metric",
        "lang": "en"
    }

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(OW_URL, params=params)
            r.raise_for_status()
            j = r.json()
    except httpx.HTTPStatusError as e:
        raise HTTPException(status_code=502, detail=f"OpenWeather error: {e.response.status_code}")
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Weather provider error: {str(e)}")

    # Extract and normalize data
    data = {
        "temperature": j.get("main", {}).get("temp"),
        "feels_like": j.get("main", {}).get("feels_like"),
        "humidity": j.get("main", {}).get("humidity"),
        "pressure": j.get("main", {}).get("pressure"),
        "wind_speed": j.get("wind", {}).get("speed"),
        "wind_deg": j.get("wind", {}).get("deg"),
        "condition": j.get("weather", [{}])[0].get("main"),
        "description": j.get("weather", [{}])[0].get("description"),
        "provider_raw": j,
    }
    _cache_set(key, data)
    return data


@router.get("/weather")
async def weather_by_coords(lat: float, lon: float):
    """GET /weather?lat={lat}&lon={lon}"""
    return await _fetch_weather(lat, lon)


@router.get("/weather/{facility_id}")
async def weather_by_facility(facility_id: str, request: Request):
    """
    GET /weather/{facility_id}
    Lookup facility by ID in database and fetch weather.
    """
    from ..database import get_pool

    print(f"[WEATHER] Looking up facility_id: {facility_id}")

    pool = await get_pool(request.app)
    async with pool.acquire() as conn:
        facility_row = await conn.fetchrow(
            "SELECT id, name, lat, lon FROM facilities WHERE id = $1",
            facility_id
        )
        if not facility_row:
            raise HTTPException(status_code=404, detail=f"Facility {facility_id} not found")
        
        print(f"[WEATHER] Found facility in database: {facility_row['name']}")
        return await _fetch_weather(float(facility_row['lat']), float(facility_row['lon']))