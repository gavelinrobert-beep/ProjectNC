"""
Weather API integration module.
"""
import httpx
from .config import OPENWEATHER_API_KEY


async def get_weather(lat: float, lon: float):
    """Fetch current weather from OpenWeatherMap API."""
    if not OPENWEATHER_API_KEY:
        # Return mock data if no API key
        return {
            "temperature": 15.5,
            "condition": "Cloudy",
            "humidity": 65,
            "wind_speed": 12,
            "description": "Partly cloudy"
        }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.openweathermap.org/data/2.5/weather",
                params={
                    "lat": lat,
                    "lon": lon,
                    "appid": OPENWEATHER_API_KEY,
                    "units": "metric"
                },
                timeout=5.0
            )
            if response.status_code == 200:
                data = response.json()
                return {
                    "temperature": data["main"]["temp"],
                    "condition": data["weather"][0]["main"],
                    "humidity": data["main"]["humidity"],
                    "wind_speed": data["wind"]["speed"],
                    "description": data["weather"][0]["description"]
                }
    except Exception as e:
        print(f"[WEATHER] Error fetching weather: {e}")
    
    return None


async def get_forecast(lat: float, lon: float):
    """Fetch weather forecast."""
    # Similar implementation to get_weather but for forecast endpoint
    return None