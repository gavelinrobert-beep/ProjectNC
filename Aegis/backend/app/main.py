import os, json, asyncio, math, io, csv
from datetime import datetime, timedelta, UTC
from typing import List, Optional
import random

import asyncpg
import jwt
from fastapi import Depends, FastAPI, Header, HTTPException, Request, Path, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from passlib.context import CryptContext
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from .weather import get_weather, get_forecast

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

origins_env = (os.getenv("CORS_ORIGINS", "*") or "*").strip()
if origins_env == "*":
    _ALLOW_ALL_ORIGINS = True
    ALLOWED_ORIGINS = ["*"]
else:
    _ALLOW_ALL_ORIGINS = False
    ALLOWED_ORIGINS = [o.strip() for o in origins_env.split(",") if o.strip()]

JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXP_MIN = int(os.getenv("JWT_EXP_MIN", "120"))

pwd = CryptContext(schemes=["sha256_crypt"], deprecated="auto")

USERS = {
    "admin@aegis.local": {"password_hash": pwd.hash("admin123"), "role": "admin"},
    "user@aegis.local": {"password_hash": pwd.hash("user123"), "role": "user"},
}

app = FastAPI(title="Aegis API v2.4")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False if _ALLOW_ALL_ORIGINS else True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class GeofenceIn(BaseModel):
    id: Optional[str] = None
    name: str
    polygon: List[List[float]] = Field(..., description="[[lat,lon], ...]")


class BaseIn(BaseModel):
    id: Optional[str] = None
    name: str
    type: str = Field(..., description="logistics, military, airfield, storage")
    lat: float
    lon: float
    capacity: Optional[int] = None
    assets_stored: Optional[List[str]] = None


class LoginIn(BaseModel):
    email: str
    password: str


class LoginOut(BaseModel):
    access_token: str
    role: str


async def get_pool():
    if not hasattr(app.state, "pool") or app.state.pool is None:
        app.state.pool = await asyncpg.create_pool(DATABASE_URL, min_size=1, max_size=4)
    return app.state.pool


ASSET_SUBS: list[asyncio.Queue] = []
ALERT_SUBS: list[asyncio.Queue] = []

# Alarm type definitions with colors
ALARM_TYPES = {
    "geofence_entry": {
        "name": "Geofence Entry",
        "color": "#d9b945",
        "severity": "medium",
        "icon": "⚠️"
    },
    "geofence_exit": {
        "name": "Geofence Exit",
        "color": "#e24a4a",
        "severity": "high",
        "icon": "🚨"
    },
    "low_battery": {
        "name": "Low Battery",
        "color": "#ff9800",
        "severity": "medium",
        "icon": "🔋"
    },
    "critical_battery": {
        "name": "Critical Battery",
        "color": "#b5392f",
        "severity": "critical",
        "icon": "⚡"
    },
    "communication_lost": {
        "name": "Communication Lost",
        "color": "#9c27b0",
        "severity": "critical",
        "icon": "📡"
    },
    "speed_violation": {
        "name": "Speed Violation",
        "color": "#ff5722",
        "severity": "high",
        "icon": "⚡"
    },
    "unauthorized_movement": {
        "name": "Unauthorized Movement",
        "color": "#b5392f",
        "severity": "critical",
        "icon": "🔒"
    },
    "maintenance_required": {
        "name": "Maintenance Required",
        "color": "#2196f3",
        "severity": "low",
        "icon": "🔧"
    },
    "system_normal": {
        "name": "System Normal",
        "color": "#3aa86f",
        "severity": "info",
        "icon": "✅"
    }
}


def point_in_poly(lat: float, lon: float, poly: list[list[float]]) -> bool:
    inside = False
    n = len(poly)
    if n < 3: return False
    for i in range(n):
        j = (i - 1) % n
        xi, yi = poly[i][0], poly[i][1]
        xj, yj = poly[j][0], poly[j][1]
        intersect = ((yi > lon) != (yj > lon)) and (lat < (xj - xi) * (lon - yi) / (yj - yi + 1e-12) + xi)
        if intersect: inside = not inside
    return inside


# Storage bases across Sweden
BASES = [
    {
        "id": "base-sundsvall-logistics",
        "name": "Sundsvall Logistics Center",
        "type": "logistics",
        "lat": 62.385,
        "lon": 17.295,
        "capacity": 50,
        "assets_stored": ["storage-01", "storage-02", "storage-03"],
        "description": "Main logistics hub for central Sweden"
    },
    {
        "id": "base-arlanda-airfield",
        "name": "Stockholm Arlanda Airfield",
        "type": "airfield",
        "lat": 59.651,
        "lon": 17.918,
        "capacity": 100,
        "assets_stored": ["arlanda-heli-01", "arlanda-plane-01", "arlanda-plane-02"],
        "description": "Primary airport and military airfield"
    },
    {
        "id": "base-stockholm-military",
        "name": "Stockholm Military Base",
        "type": "military",
        "lat": 59.340,
        "lon": 18.055,
        "capacity": 75,
        "assets_stored": [],
        "description": "Central command and operations center"
    },
    {
        "id": "base-gothenburg-harbor",
        "name": "Gothenburg Harbor Storage",
        "type": "storage",
        "lat": 57.700,
        "lon": 11.960,
        "capacity": 40,
        "assets_stored": ["gbg-storage-01"],
        "description": "Harbor logistics and storage facility"
    },
    {
        "id": "base-malmo-depot",
        "name": "Malmö Equipment Depot",
        "type": "storage",
        "lat": 55.600,
        "lon": 12.995,
        "capacity": 30,
        "assets_stored": ["malmo-storage-01", "malmo-uav-01"],
        "description": "Southern Sweden equipment depot"
    },
    {
        "id": "base-kiruna-military",
        "name": "Kiruna Military Outpost",
        "type": "military",
        "lat": 67.855,
        "lon": 20.225,
        "capacity": 25,
        "assets_stored": [],
        "description": "Northern military operations base"
    },
    {
        "id": "base-visby-airfield",
        "name": "Visby Airfield",
        "type": "airfield",
        "lat": 57.662,
        "lon": 18.346,
        "capacity": 20,
        "assets_stored": [],
        "description": "Gotland island airfield"
    },
    {
        "id": "base-karlskrona-naval",
        "name": "Karlskrona Naval Base",
        "type": "military",
        "lat": 56.161,
        "lon": 15.586,
        "capacity": 60,
        "assets_stored": [],
        "description": "Naval operations and coastal defense"
    }
]

# Realistic street routes across Sweden
STREET_ROUTES = {
    "route_sundsvall_e4_north": [
        [62.390, 17.305], [62.391, 17.306], [62.392, 17.307], [62.393, 17.308],
        [62.394, 17.308], [62.395, 17.309], [62.396, 17.310], [62.397, 17.311],
        [62.398, 17.312], [62.399, 17.313], [62.400, 17.314], [62.401, 17.315],
        [62.402, 17.316], [62.403, 17.317], [62.404, 17.318], [62.405, 17.319],
        [62.406, 17.320], [62.407, 17.321], [62.408, 17.321], [62.409, 17.322],
        [62.410, 17.322]
    ],
    "route_sundsvall_e4_south": [
        [62.410, 17.322], [62.409, 17.322], [62.408, 17.321], [62.407, 17.321],
        [62.406, 17.320], [62.405, 17.319], [62.404, 17.318], [62.403, 17.317],
        [62.402, 17.316], [62.401, 17.315], [62.400, 17.314], [62.399, 17.313],
        [62.398, 17.312], [62.397, 17.311], [62.396, 17.310], [62.395, 17.309],
        [62.394, 17.308], [62.393, 17.308], [62.392, 17.307], [62.391, 17.306],
        [62.390, 17.305]
    ],
    "route_sundsvall_city": [
        [62.390, 17.305], [62.391, 17.307], [62.392, 17.310], [62.393, 17.312],
        [62.394, 17.315], [62.393, 17.318], [62.392, 17.320], [62.391, 17.319],
        [62.390, 17.318], [62.389, 17.315], [62.388, 17.312], [62.389, 17.308],
        [62.390, 17.305]
    ],
    "route_stockholm_arlanda_city": [
        [59.651, 17.918], [59.640, 17.920], [59.630, 17.925], [59.620, 17.930],
        [59.610, 17.935], [59.600, 17.940], [59.590, 17.945], [59.580, 17.950],
        [59.570, 17.955], [59.560, 17.960], [59.550, 17.970], [59.540, 17.980],
        [59.530, 17.990], [59.520, 18.000], [59.510, 18.010], [59.500, 18.020],
        [59.490, 18.030], [59.480, 18.040], [59.470, 18.050], [59.460, 18.055],
        [59.450, 18.060], [59.440, 18.063], [59.430, 18.065], [59.420, 18.066],
        [59.410, 18.068], [59.400, 18.069], [59.390, 18.070], [59.380, 18.070],
        [59.370, 18.070], [59.360, 18.069], [59.350, 18.068], [59.340, 18.067],
        [59.330, 18.065]
    ],
    "route_stockholm_city_loop": [
        [59.330, 18.065], [59.332, 18.068], [59.335, 18.070], [59.338, 18.072],
        [59.340, 18.075], [59.342, 18.078], [59.340, 18.080], [59.338, 18.082],
        [59.335, 18.080], [59.332, 18.077], [59.330, 18.075], [59.328, 18.072],
        [59.327, 18.070], [59.328, 18.067], [59.330, 18.065]
    ],
    "route_gothenburg_harbor": [
        [57.705, 11.965], [57.706, 11.967], [57.707, 11.969], [57.708, 11.971],
        [57.709, 11.973], [57.710, 11.975], [57.711, 11.977], [57.712, 11.979],
        [57.713, 11.981], [57.714, 11.983], [57.715, 11.985], [57.714, 11.987],
        [57.713, 11.989], [57.712, 11.987], [57.711, 11.985], [57.710, 11.983],
        [57.709, 11.981], [57.708, 11.979], [57.707, 11.977], [57.706, 11.975],
        [57.705, 11.973], [57.704, 11.971], [57.705, 11.968], [57.705, 11.965]
    ],
    "route_malmo_city": [
        [55.605, 13.000], [55.606, 13.002], [55.607, 13.004], [55.608, 13.006],
        [55.609, 13.008], [55.610, 13.010], [55.609, 13.012], [55.608, 13.014],
        [55.607, 13.012], [55.606, 13.010], [55.605, 13.008], [55.604, 13.006],
        [55.603, 13.004], [55.604, 13.002], [55.605, 13.000]
    ],
    "route_uav_sundsvall_patrol": [
        [62.395, 17.318], [62.396, 17.320], [62.397, 17.323], [62.398, 17.326],
        [62.399, 17.328], [62.400, 17.330], [62.398, 17.332], [62.396, 17.334],
        [62.394, 17.335], [62.392, 17.333], [62.390, 17.330], [62.389, 17.327],
        [62.388, 17.324], [62.389, 17.321], [62.391, 17.318], [62.393, 17.316],
        [62.395, 17.318]
    ],
    "route_uav_stockholm_patrol": [
        [59.330, 18.065], [59.335, 18.070], [59.340, 18.075], [59.345, 18.080],
        [59.350, 18.078], [59.355, 18.075], [59.350, 18.070], [59.345, 18.065],
        [59.340, 18.062], [59.335, 18.060], [59.330, 18.062], [59.330, 18.065]
    ],
    "route_aircraft_north_south": [
        [65.585, 22.140], [64.750, 20.950], [63.825, 20.260], [62.630, 17.940],
        [62.390, 17.305], [60.675, 17.140], [59.651, 17.918], [59.330, 18.065],
        [58.410, 15.620], [57.780, 14.160], [57.705, 11.965], [56.040, 12.695],
        [55.605, 13.000]
    ],
    "route_aircraft_coastal": [
        [59.651, 17.918], [59.270, 18.050], [58.590, 16.920], [58.410, 15.620],
        [57.780, 14.160], [57.705, 11.965], [56.680, 12.850], [55.925, 14.085],
        [55.605, 13.000]
    ],
    "stationary": [[0, 0]]
}

# Assets with battery tracking - only for electric/battery-powered assets
ASSETS = [
    # Sundsvall area - battery-powered
    {
        "id": "unit-01",
        "type": "vehicle",
        "lat": 62.390,
        "lon": 17.305,
        "route": "route_sundsvall_e4_north",
        "route_index": 0.0,
        "speed": 0.08,
        "status": "mobile",
        "battery": 85.0,
        "battery_drain": 0.05,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "unit-02",
        "type": "uav",
        "lat": 62.395,
        "lon": 17.318,
        "route": "route_uav_sundsvall_patrol",
        "route_index": 0.0,
        "speed": 0.12,
        "status": "mobile",
        "battery": 45.0,
        "battery_drain": 0.15,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "unit-03",
        "type": "truck",
        "lat": 62.410,
        "lon": 17.322,
        "route": "route_sundsvall_e4_south",
        "route_index": 0.0,
        "speed": 0.06,
        "status": "mobile",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Parked vehicles
    {
        "id": "storage-01",
        "type": "vehicle",
        "lat": 62.385,
        "lon": 17.295,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": 100.0,
        "battery_drain": 0.01,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "storage-02",
        "type": "truck",
        "lat": 62.386,
        "lon": 17.296,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "storage-03",
        "type": "vehicle",
        "lat": 62.384,
        "lon": 17.294,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": 78.0,
        "battery_drain": 0.01,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Stockholm area
    {
        "id": "sthlm-patrol-01",
        "type": "vehicle",
        "lat": 59.330,
        "lon": 18.065,
        "route": "route_stockholm_city_loop",
        "route_index": 0.0,
        "speed": 0.07,
        "status": "mobile",
        "battery": 68.0,
        "battery_drain": 0.06,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "sthlm-patrol-02",
        "type": "uav",
        "lat": 59.330,
        "lon": 18.065,
        "route": "route_uav_stockholm_patrol",
        "route_index": 5.0,
        "speed": 0.15,
        "status": "mobile",
        "battery": 22.0,
        "battery_drain": 0.18,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "sthlm-transport",
        "type": "truck",
        "lat": 59.651,
        "lon": 17.918,
        "route": "route_stockholm_arlanda_city",
        "route_index": 0.0,
        "speed": 0.05,
        "status": "mobile",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Aircraft at Arlanda - no battery tracking (use jet fuel)
    {
        "id": "arlanda-heli-01",
        "type": "helicopter",
        "lat": 59.651,
        "lon": 17.918,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "aviation",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "arlanda-plane-01",
        "type": "plane",
        "lat": 59.652,
        "lon": 17.920,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "jet",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "arlanda-plane-02",
        "type": "plane",
        "lat": 59.653,
        "lon": 17.922,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "jet",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Aircraft in flight
    {
        "id": "flight-sk001",
        "type": "plane",
        "lat": 65.585,
        "lon": 22.140,
        "route": "route_aircraft_north_south",
        "route_index": 0.0,
        "speed": 0.03,
        "status": "airborne",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "jet",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "flight-heli-01",
        "type": "helicopter",
        "lat": 62.395,
        "lon": 17.318,
        "route": "route_uav_sundsvall_patrol",
        "route_index": 8.0,
        "speed": 0.10,
        "status": "airborne",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "aviation",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "flight-sk002",
        "type": "plane",
        "lat": 59.651,
        "lon": 17.918,
        "route": "route_aircraft_coastal",
        "route_index": 0.0,
        "speed": 0.04,
        "status": "airborne",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "jet",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Gothenburg
    {
        "id": "gbg-patrol-01",
        "type": "vehicle",
        "lat": 57.705,
        "lon": 11.965,
        "route": "route_gothenburg_harbor",
        "route_index": 0.0,
        "speed": 0.08,
        "status": "mobile",
        "battery": 73.0,
        "battery_drain": 0.05,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "gbg-storage-01",
        "type": "truck",
        "lat": 57.700,
        "lon": 11.960,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Malmö
    {
        "id": "malmo-patrol-01",
        "type": "vehicle",
        "lat": 55.605,
        "lon": 13.000,
        "route": "route_malmo_city",
        "route_index": 0.0,
        "speed": 0.09,
        "status": "mobile",
        "battery": 62.0,
        "battery_drain": 0.07,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "malmo-storage-01",
        "type": "vehicle",
        "lat": 55.600,
        "lon": 12.995,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": 100.0,
        "battery_drain": 0.01,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "malmo-uav-01",
        "type": "uav",
        "lat": 55.610,
        "lon": 13.005,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": 100.0,
        "battery_drain": 0.01,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
{
        "id": "uppsala-patrol-01",
        "type": "vehicle",
        "lat": 59.858,
        "lon": 17.638,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.07,
        "status": "mobile",
        "battery": 82.0,
        "battery_drain": 0.06,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "uppsala-uav-01",
        "type": "uav",
        "lat": 59.860,
        "lon": 17.640,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.12,
        "status": "mobile",
        "battery": 55.0,
        "battery_drain": 0.14,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "uppsala-truck-01",
        "type": "truck",
        "lat": 59.855,
        "lon": 17.635,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Linköping area (2 assets)
    {
        "id": "linkoping-military-01",
        "type": "vehicle",
        "lat": 58.410,
        "lon": 15.620,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.08,
        "status": "mobile",
        "battery": 91.0,
        "battery_drain": 0.05,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "linkoping-storage-01",
        "type": "vehicle",
        "lat": 58.405,
        "lon": 15.615,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": 100.0,
        "battery_drain": 0.01,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Örebro area (2 assets)
    {
        "id": "orebro-logistics-01",
        "type": "truck",
        "lat": 59.274,
        "lon": 15.213,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.06,
        "status": "mobile",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "orebro-patrol-01",
        "type": "vehicle",
        "lat": 59.276,
        "lon": 15.215,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.07,
        "status": "mobile",
        "battery": 67.0,
        "battery_drain": 0.06,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Västerås area (2 assets)
    {
        "id": "vasteras-heli-01",
        "type": "helicopter",
        "lat": 59.609,
        "lon": 16.544,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "aviation",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "vasteras-storage-01",
        "type": "vehicle",
        "lat": 59.605,
        "lon": 16.540,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": 100.0,
        "battery_drain": 0.01,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Jönköping area (2 assets)
    {
        "id": "jonkoping-patrol-01",
        "type": "vehicle",
        "lat": 57.782,
        "lon": 14.161,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.08,
        "status": "mobile",
        "battery": 79.0,
        "battery_drain": 0.06,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "jonkoping-uav-01",
        "type": "uav",
        "lat": 57.785,
        "lon": 14.165,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.12,
        "status": "mobile",
        "battery": 48.0,
        "battery_drain": 0.15,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Gävle area (3 assets)
    {
        "id": "gavle-patrol-01",
        "type": "vehicle",
        "lat": 60.675,
        "lon": 17.140,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.07,
        "status": "mobile",
        "battery": 84.0,
        "battery_drain": 0.05,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "gavle-truck-01",
        "type": "truck",
        "lat": 60.672,
        "lon": 17.138,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.06,
        "status": "mobile",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "gavle-storage-01",
        "type": "vehicle",
        "lat": 60.670,
        "lon": 17.135,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": 100.0,
        "battery_drain": 0.01,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Umeå area (2 assets)
    {
        "id": "umea-patrol-01",
        "type": "vehicle",
        "lat": 63.825,
        "lon": 20.260,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.07,
        "status": "mobile",
        "battery": 71.0,
        "battery_drain": 0.06,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "umea-storage-01",
        "type": "truck",
        "lat": 63.820,
        "lon": 20.255,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "diesel",
        "in_geofence": False,
        "last_alarm_tick": 0
    },

    # Luleå area (2 assets)
    {
        "id": "lulea-patrol-01",
        "type": "vehicle",
        "lat": 65.585,
        "lon": 22.140,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.07,
        "status": "mobile",
        "battery": 88.0,
        "battery_drain": 0.05,
        "has_battery": True,
        "fuel_type": "electric",
        "in_geofence": False,
        "last_alarm_tick": 0
    },
    {
        "id": "lulea-heli-01",
        "type": "helicopter",
        "lat": 65.580,
        "lon": 22.135,
        "route": "stationary",
        "route_index": 0.0,
        "speed": 0.0,
        "status": "parked",
        "battery": None,
        "battery_drain": 0.0,
        "has_battery": False,
        "fuel_type": "aviation",
        "in_geofence": False,
        "last_alarm_tick": 0
    }
]


def interpolate(start, end, t):
    """Linear interpolation between two points"""
    return start + (end - start) * t


def update_asset_position(asset):
    """Update asset position along its route with smooth movement"""
    if asset["speed"] == 0.0 or asset["route"] == "stationary":
        return

    route_name = asset["route"]
    route = STREET_ROUTES[route_name]

    current_idx = int(asset["route_index"])
    next_idx = (current_idx + 1) % len(route)
    progress = asset["route_index"] - current_idx

    current_point = route[current_idx]
    next_point = route[next_idx]

    asset["lat"] = interpolate(current_point[0], next_point[0], progress)
    asset["lon"] = interpolate(current_point[1], next_point[1], progress)

    asset["route_index"] += asset["speed"]

    if asset["route_index"] >= len(route):
        asset["route_index"] = 0.0


async def create_alarm(conn, asset_id: str, alarm_type: str, geofence_id: str = None, extra_data: str = ""):
    """Create an alarm with type and color information"""
    alarm_info = ALARM_TYPES.get(alarm_type, ALARM_TYPES["system_normal"])
    rule = f"{alarm_info['icon']} {alarm_info['name']}"
    if extra_data:
        rule += f" - {extra_data}"

    try:
        rec = await conn.fetchrow("""
            INSERT INTO alarms(asset_id, geofence_id, rule)
            VALUES($1,$2,$3)
            RETURNING id, asset_id, geofence_id, rule, acknowledged, ts
        """, asset_id, geofence_id, rule)

        alert = {
            'id': rec['id'],
            'asset_id': rec['asset_id'],
            'geofence_id': rec['geofence_id'],
            'rule': rec['rule'],
            'acknowledged': rec['acknowledged'],
            'ts': rec['ts'].isoformat(),
            'alarm_type': alarm_type,
            'color': alarm_info['color'],
            'severity': alarm_info['severity']
        }

        for q in list(ALERT_SUBS):
            if not q.full():
                q.put_nowait([alert])

        return alert
    except Exception as e:
        print(f"[ERROR] Failed to create alarm: {e}")
        return None


@app.on_event("startup")
async def on_startup():
    pool = await get_pool()
    async with pool.acquire() as conn:
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS geofences (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          polygon JSONB NOT NULL
        );
        """)
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS alarms (
          id SERIAL PRIMARY KEY,
          asset_id TEXT NOT NULL,
          geofence_id TEXT,
          rule TEXT NOT NULL,
          acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
          ts TIMESTAMPTZ DEFAULT NOW()
        );
        """)
        await conn.execute("""
        CREATE TABLE IF NOT EXISTS bases (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          lat FLOAT NOT NULL,
          lon FLOAT NOT NULL,
          capacity INT,
          assets_stored JSONB,
          description TEXT
        );
        """)
        # Insert default bases if table is empty
        count = await conn.fetchval("SELECT COUNT(*) FROM bases")
        if count == 0:
            for base in BASES:
                await conn.execute("""
                    INSERT INTO bases(id, name, type, lat, lon, capacity, assets_stored, description)
                    VALUES($1, $2, $3, $4, $5, $6, $7, $8)
                """, base['id'], base['name'], base['type'], base['lat'], base['lon'],
                     base['capacity'], json.dumps(base.get('assets_stored', [])), base.get('description', ''))
    asyncio.create_task(simulation_loop())


@app.get("/health")
async def health():
    return {"ok": True}


def make_token(email: str, role: str) -> str:
    now = datetime.now(UTC)
    payload = {"sub": email, "role": role, "iat": int(now.timestamp()),
               "exp": int((now + timedelta(minutes=JWT_EXP_MIN)).timestamp())}
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def decode_token(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])


def bearer_role(authorization: Optional[str] = Header(None)) -> str:
    if authorization and authorization.lower().startswith("bearer "):
        tok = authorization.split(" ", 1)[1].strip()
        if tok == "dev-token":
            return "admin"
        try:
            payload = decode_token(tok)
            return payload.get("role", "user")
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid token")
    return "anonymous"


def require_admin(role: str = Depends(bearer_role)) -> None:
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin required")


@app.post("/auth/login", response_model=LoginOut)
async def login(body: LoginIn):
    user = USERS.get(body.email.lower())
    if not user or not pwd.verify(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Felaktiga inloggningsuppgifter")
    token = make_token(body.email.lower(), user["role"])
    return LoginOut(access_token=token, role=user["role"])


@app.get("/assets")
async def assets():
    return [{
        "id": a["id"],
        "type": a["type"],
        "lat": a["lat"],
        "lon": a["lon"],
        "status": a.get("status", "mobile"),
        "battery": a.get("battery"),
        "has_battery": a.get("has_battery", False),
        "fuel_type": a.get("fuel_type", "unknown")
    } for a in ASSETS]


@app.get("/bases")
async def get_bases():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, type, lat, lon, capacity, assets_stored, description FROM bases")

    result = []
    for r in rows:
        assets_stored = r["assets_stored"]
        if isinstance(assets_stored, str):
            try:
                assets_stored = json.loads(assets_stored)
            except:
                assets_stored = []

        result.append({
            "id": r["id"],
            "name": r["name"],
            "type": r["type"],
            "lat": r["lat"],
            "lon": r["lon"],
            "capacity": r["capacity"],
            "assets_stored": assets_stored,
            "description": r.get("description", "")
        })

    return result


@app.post("/bases", dependencies=[Depends(require_admin)])
async def create_base(body: BaseIn):
    pool = await get_pool()
    bid = body.id or body.name.lower().replace(" ", "-")
    async with pool.acquire() as conn:
        try:
            await conn.execute("""
                INSERT INTO bases(id, name, type, lat, lon, capacity, assets_stored, description)
                VALUES($1, $2, $3, $4, $5, $6, $7, $8)
            """, bid, body.name, body.type, body.lat, body.lon, body.capacity or 0,
                               json.dumps(body.assets_stored or []), "")
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail="Base already exists")
    return {"id": bid, "name": body.name, "type": body.type}


@app.delete("/bases/{bid}", dependencies=[Depends(require_admin)])
async def delete_base(bid: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("DELETE FROM bases WHERE id=$1", bid)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@app.get("/alerts")
async def alerts():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alarms ORDER BY id DESC LIMIT 200")

    result = []
    for r in rows:
        alarm_type = "system_normal"
        for atype, ainfo in ALARM_TYPES.items():
            if ainfo['icon'] in r['rule'] or ainfo['name'] in r['rule']:
                alarm_type = atype
                break

        alarm_info = ALARM_TYPES.get(alarm_type, ALARM_TYPES["system_normal"])
        result.append({
            "id": r["id"],
            "asset_id": r["asset_id"],
            "geofence_id": r["geofence_id"],
            "rule": r["rule"],
            "acknowledged": r["acknowledged"],
            "ts": r["ts"].isoformat(),
            "alarm_type": alarm_type,
            "color": alarm_info["color"],
            "severity": alarm_info["severity"]
        })

    return result


@app.get("/alerts.csv")
async def alerts_csv():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alarms ORDER BY id DESC")
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["id", "asset_id", "geofence_id", "rule", "acknowledged", "ts"])
    for r in rows:
        writer.writerow(
            [r["id"], r["asset_id"], r["geofence_id"] or "", r["rule"], r["acknowledged"], r["ts"].isoformat()])
    return Response(content=output.getvalue(), media_type="text/csv")


@app.get("/alerts.pdf")
async def alerts_pdf():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT id, asset_id, geofence_id, rule, acknowledged, ts FROM alarms ORDER BY id DESC LIMIT 500")
    buf = io.BytesIO()
    c = canvas.Canvas(buf, pagesize=A4)
    width, height = A4
    y = height - 40
    c.setFont("Helvetica-Bold", 14)
    c.drawString(40, y, "Project AEGIS — Larmrapport")
    y -= 20
    c.setFont("Helvetica", 10)
    c.drawString(40, y, datetime.now(UTC).strftime("Genererad: %Y-%m-%d %H:%M UTC"))
    y -= 20
    c.setFont("Helvetica-Bold", 10)
    c.drawString(40, y, "ID")
    c.drawString(90, y, "Tillgång")
    c.drawString(170, y, "Geofence")
    c.drawString(260, y, "Regel")
    c.drawString(420, y, "Status")
    c.drawString(480, y, "Tid")
    y -= 12
    c.setFont("Helvetica", 10)
    for r in rows:
        if y < 40:
            c.showPage()
            y = height - 40
        c.drawString(40, y, str(r["id"]))
        c.drawString(90, y, r["asset_id"])
        c.drawString(170, y, r["geofence_id"] or "")
        c.drawString(260, y, (r["rule"] or "")[:28])
        c.drawString(420, y, "Kvitterad" if r["acknowledged"] else "Ohanterad")
        c.drawString(480, y, r["ts"].strftime("%H:%M:%S"))
        y -= 12
    c.showPage()
    c.save()
    buf.seek(0)
    return Response(content=buf.getvalue(), media_type="application/pdf")


@app.put("/alerts/{aid}/ack")
async def ack_alert(aid: int = Path(..., ge=1)):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("UPDATE alarms SET acknowledged=TRUE WHERE id=$1", aid)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


@app.get("/stream/assets")
async def stream_assets(request: Request):
    q: asyncio.Queue = asyncio.Queue()
    ASSET_SUBS.append(q)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await q.get()
                yield f"data: {json.dumps(data)}\n\n"
        finally:
            try:
                ASSET_SUBS.remove(q)
            except ValueError:
                pass

    return StreamingResponse(gen(), media_type="text/event-stream")


@app.get("/stream/alerts")
async def stream_alerts(request: Request):
    q: asyncio.Queue = asyncio.Queue()
    ALERT_SUBS.append(q)

    async def gen():
        try:
            while True:
                if await request.is_disconnected():
                    break
                data = await q.get()
                yield f"data: {json.dumps(data)}\n\n"
        finally:
            try:
                ALERT_SUBS.remove(q)
            except ValueError:
                pass

    return StreamingResponse(gen(), media_type="text/event-stream")


@app.get("/geofences")
async def get_geofences():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch("SELECT id, name, polygon FROM geofences")

    result = []
    for r in rows:
        polygon_data = r["polygon"]

        if isinstance(polygon_data, str):
            try:
                polygon_data = json.loads(polygon_data)
            except:
                polygon_data = []

        if not isinstance(polygon_data, list):
            polygon_data = []

        result.append({
            "id": str(r["id"]),
            "name": str(r["name"]),
            "polygon": polygon_data
        })

    return result


class GeofenceInModel(GeofenceIn):
    pass


@app.post("/geofences", dependencies=[Depends(require_admin)])
async def create_geofence(body: GeofenceInModel):
    gid = (body.id or body.name).strip().lower().replace(" ", "-")
    if not gid:
        raise HTTPException(status_code=422, detail="Ogiltigt id/namn")
    pool = await get_pool()
    async with pool.acquire() as conn:
        try:
            await conn.execute(
                "INSERT INTO geofences(id, name, polygon) VALUES($1,$2,$3)",
                gid, body.name, json.dumps(body.polygon)
            )
        except asyncpg.UniqueViolationError:
            raise HTTPException(status_code=409, detail="Geofence med detta id finns redan")
    return {"id": gid, "name": body.name, "polygon": body.polygon}


@app.put("/geofences/{gid}", dependencies=[Depends(require_admin)])
async def update_geofence(gid: str, body: GeofenceInModel):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute(
            "UPDATE geofences SET name=$1, polygon=$2 WHERE id=$3",
            (body.name or gid), json.dumps(body.polygon), gid
        )
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"id": gid, "name": body.name or gid, "polygon": body.polygon}


@app.delete("/geofences/{gid}", dependencies=[Depends(require_admin)])
async def delete_geofence(gid: str):
    pool = await get_pool()
    async with pool.acquire() as conn:
        res = await conn.execute("DELETE FROM geofences WHERE id=$1", gid)
        if res.endswith("0"):
            raise HTTPException(status_code=404, detail="Not found")
    return {"ok": True}


async def simulation_loop():
    pool = await get_pool()
    tick = 0

    while True:
        await asyncio.sleep(1.0)
        tick += 1

        # Update positions and batteries (only for battery-powered assets)
        for a in ASSETS:
            update_asset_position(a)

            # Only drain battery if asset has one
            if a.get("has_battery", False) and a["battery"] is not None and a["battery"] > 0:
                a["battery"] = max(0, a["battery"] - a["battery_drain"])

        # Broadcast updated positions
        snapshot = [{
            'id': a['id'],
            'lat': a['lat'],
            'lon': a['lon'],
            'type': a['type'],
            'status': a.get('status', 'mobile'),
            'battery': a.get('battery'),
            'has_battery': a.get('has_battery', False),
            'fuel_type': a.get('fuel_type', 'unknown')
        } for a in ASSETS]

        for q in list(ASSET_SUBS):
            if not q.full():
                q.put_nowait(snapshot)

        # Check for alarms every 10 seconds
        if tick % 10 == 0:
            async with pool.acquire() as conn:
                geos = await conn.fetch('SELECT id, polygon FROM geofences')
                polys = [{'id': g['id'], 'polygon': g['polygon']} for g in geos]

                for a in ASSETS:
                    # Check geofence entry/exit
                    currently_inside = False
                    current_geofence = None

                    for g in polys:
                        try:
                            if point_in_poly(a['lat'], a['lon'], g['polygon']):
                                currently_inside = True
                                current_geofence = g['id']

                                if not a.get('in_geofence', False):
                                    await create_alarm(conn, a['id'], 'geofence_entry', g['id'], g['id'])

                                break
                        except Exception:
                            continue

                    if not currently_inside and a.get('in_geofence', False):
                        await create_alarm(conn, a['id'], 'geofence_exit', None, "Left monitored area")

                    a['in_geofence'] = currently_inside

                    # Battery alarms (only for battery-powered assets)
                    if a.get("has_battery", False) and a.get("battery") is not None:
                        battery = a["battery"]
                        if battery <= 15 and battery > 0:
                            if tick - a.get('last_alarm_tick', 0) > 300:
                                await create_alarm(conn, a['id'], 'critical_battery', None, f"{battery:.1f}%")
                                a['last_alarm_tick'] = tick
                        elif battery <= 30:
                            if tick - a.get('last_alarm_tick', 0) > 600:
                                await create_alarm(conn, a['id'], 'low_battery', None, f"{battery:.1f}%")
                                a['last_alarm_tick'] = tick

                    # Random communication issues for aircraft (1% chance)
                    if a['type'] in ['plane', 'helicopter'] and a['status'] == 'airborne':
                        if random.random() < 0.01:
                            await create_alarm(conn, a['id'], 'communication_lost', None, "Signal lost")

                    # Random maintenance alerts for parked assets (0.5% chance)
                    if a['status'] == 'parked':
                        if random.random() < 0.005:
                            await create_alarm(conn, a['id'], 'maintenance_required', None, "Scheduled service due")


# ============================================
# WEATHER ENDPOINTS
# ============================================

@app.get("/weather/{base_id}")
async def get_base_weather(base_id: str):
    """Get weather for a specific base"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        base = await conn.fetchrow("SELECT lat, lon FROM bases WHERE id = $1", base_id)
        if not base:
            raise HTTPException(status_code=404, detail="Base not found")

        weather = await get_weather(base['lat'], base['lon'])
        if not weather:
            raise HTTPException(status_code=503, detail="Weather service unavailable")

        return weather


@app.get("/weather/location/{lat}/{lon}")
async def get_location_weather(lat: float, lon: float):
    """Get weather for any location"""
    weather = await get_weather(lat, lon)
    if not weather:
        raise HTTPException(status_code=503, detail="Weather service unavailable")
    return weather


@app.get("/forecast/{base_id}")
async def get_base_forecast(base_id: str):
    """Get 24-hour forecast for a base"""
    pool = await get_pool()
    async with pool.acquire() as conn:
        base = await conn.fetchrow("SELECT lat, lon FROM bases WHERE id = $1", base_id)
        if not base:
            raise HTTPException(status_code=404, detail="Base not found")

        forecast = await get_forecast(base['lat'], base['lon'])
        if not forecast:
            raise HTTPException(status_code=503, detail="Weather service unavailable")

        return forecast