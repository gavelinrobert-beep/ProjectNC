"""
Static data for Aegis backend (alarm types, bases, street routes, and asset definitions).
"""

# Alarm types (add all entries from your original ALARM_TYPES)
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
    # ... (copy all alarm types)
}

# Bases (add all entries from your original BASES)
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
    # ... (copy all other bases)
]

# Street routes (add all entries from your original STREET_ROUTES)
STREET_ROUTES = {
    "route_sundsvall_e4_north": [
        [62.390, 17.305], [62.391, 17.306], [62.392, 17.307]
        # ... (add all route points)
    ],
    # ... (copy all other routes)
}

# Assets (add all entries from your original ASSETS)
ASSETS = [
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
    # ... (copy all other assets)
]
