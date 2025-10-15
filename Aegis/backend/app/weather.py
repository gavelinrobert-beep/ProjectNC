import os
import asyncio
import aiohttp
from typing import Optional, Dict, Any
from datetime import datetime, timedelta

WEATHER_CACHE: Dict[str, tuple[Dict[Any, Any], datetime]] = {}
CACHE_DURATION = timedelta(minutes=10)


async def get_weather(lat: float, lon: float) -> Optional[Dict[Any, Any]]:
    """Fetch weather data for a location."""
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

    if not OPENWEATHER_API_KEY:
        print("Warning: OPENWEATHER_API_KEY not set")
        return None

    cache_key = f"{lat:.2f},{lon:.2f}"

    # Check cache
    if cache_key in WEATHER_CACHE:
        cached_data, cached_time = WEATHER_CACHE[cache_key]
        if datetime.utcnow() - cached_time < CACHE_DURATION:
            return cached_data

    # Fetch new data
    url = f"https://api.openweathermap.org/data/2.5/weather"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric"
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    weather_data = {
                        "temp": data["main"]["temp"],
                        "feels_like": data["main"]["feels_like"],
                        "humidity": data["main"]["humidity"],
                        "pressure": data["main"]["pressure"],
                        "wind_speed": data["wind"]["speed"],
                        "wind_deg": data["wind"].get("deg", 0),
                        "clouds": data["clouds"]["all"],
                        "weather": data["weather"][0]["main"],
                        "description": data["weather"][0]["description"],
                        "icon": data["weather"][0]["icon"],
                        "visibility": data.get("visibility", 0),
                        "timestamp": datetime.utcnow().isoformat()
                    }

                    WEATHER_CACHE[cache_key] = (weather_data, datetime.utcnow())
                    return weather_data
                else:
                    print(f"Weather API error: {response.status}")
                    return None
    except Exception as e:
        print(f"Error fetching weather: {e}")
        return None


async def get_forecast(lat: float, lon: float) -> Optional[Dict[Any, Any]]:
    """Fetch 5-day forecast for a location."""
    OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "")

    if not OPENWEATHER_API_KEY:
        print("Warning: OPENWEATHER_API_KEY not set")
        return None

    url = f"https://api.openweathermap.org/data/2.5/forecast"
    params = {
        "lat": lat,
        "lon": lon,
        "appid": OPENWEATHER_API_KEY,
        "units": "metric",
        "cnt": 8
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, params=params) as response:
                if response.status == 200:
                    data = await response.json()
                    forecast_data = []
                    for item in data["list"]:
                        forecast_data.append({
                            "time": item["dt_txt"],
                            "temp": item["main"]["temp"],
                            "weather": item["weather"][0]["main"],
                            "description": item["weather"][0]["description"],
                            "icon": item["weather"][0]["icon"],
                            "wind_speed": item["wind"]["speed"],
                            "clouds": item["clouds"]["all"]
                        })
                    return {"forecast": forecast_data}
                else:
                    return None
    except Exception as e:
        print(f"Error fetching forecast: {e}")
        return None