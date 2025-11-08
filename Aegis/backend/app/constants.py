"""
Static data for Aegis backend (alarm types, bases, street routes, and asset definitions).
Swedish Armed Forces logistics simulation data.
"""

# Alarm types
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
        "color": "#d9b945",
        "severity": "medium",
        "icon": "🔋"
    },
    "critical_battery": {
        "name": "Critical Battery",
        "color": "#e24a4a",
        "severity": "high",
        "icon": "⚡"
    },
    "low_fuel": {
        "name": "Low Fuel",
        "color": "#d9b945",
        "severity": "medium",
        "icon": "⛽"
    },
    "critical_fuel": {
        "name": "Critical Fuel",
        "color": "#e24a4a",
        "severity": "high",
        "icon": "🚨"
    },
    "communication_lost": {
        "name": "Communication Lost",
        "color": "#e24a4a",
        "severity": "high",
        "icon": "📡"
    },
    "maintenance_required": {
        "name": "Maintenance Required",
        "color": "#d9b945",
        "severity": "medium",
        "icon": "🔧"
    },
    "return_to_base": {
        "name": "Returning to Base",
        "color": "#3aa86f",
        "severity": "low",
        "icon": "🏠"
    },
    "system_normal": {
        "name": "System Normal",
        "color": "#3aa86f",
        "severity": "low",
        "icon": "✅"
    }
}

# Swedish Military Bases
BASES = [
    {"id": "BASE-STOCKHOLM-HQ", "name": "Stockholm HQ", "type": "headquarters", "lat": 59.3293, "lon": 18.0686, "capacity": 100, "assets_stored": [], "description": "Main headquarters and command center"},
    {"id": "BASE-GOTLAND", "name": "Gotland Forward Base", "type": "forward_base", "lat": 57.6348, "lon": 18.2948, "capacity": 60, "assets_stored": [], "description": "Strategic forward operating base"},
    {"id": "BASE-MALMO", "name": "Malmö Supply Depot", "type": "supply_depot", "lat": 55.6050, "lon": 13.0038, "capacity": 80, "assets_stored": [], "description": "Southern supply and logistics hub"},
    {"id": "BASE-GOTEBORG", "name": "Göteborg Naval Base", "type": "naval_base", "lat": 57.7089, "lon": 11.9746, "capacity": 50, "assets_stored": [], "description": "West coast naval operations center"},
    {"id": "BASE-KIRUNA", "name": "Kiruna Arctic Base", "type": "forward_base", "lat": 67.8558, "lon": 20.2253, "capacity": 40, "assets_stored": [], "description": "Northern arctic operations base"},
    {"id": "BASE-KARLSKRONA", "name": "Karlskrona Naval HQ", "type": "naval_base", "lat": 56.1612, "lon": 15.5869, "capacity": 70, "assets_stored": [], "description": "Main naval headquarters"},
    {"id": "BASE-Uppsala", "name": "Uppsala Training Center", "type": "training", "lat": 59.8586, "lon": 17.6389, "capacity": 45, "assets_stored": [], "description": "Military training and education facility"},
    {"id": "BASE-SUNDSVALL", "name": "Sundsvall Logistics Center", "type": "logistics", "lat": 62.3908, "lon": 17.3069, "capacity": 55, "assets_stored": [], "description": "Central logistics coordination hub"},
    {"id": "BASE-LINKOPING", "name": "Linköping Air Base", "type": "air_base", "lat": 58.4108, "lon": 15.6214, "capacity": 65, "assets_stored": [], "description": "Primary air force operations base"},
    {"id": "BASE-OSTERSUND", "name": "Östersund Mountain Base", "type": "forward_base", "lat": 63.1792, "lon": 14.6357, "capacity": 35, "assets_stored": [], "description": "Mountain warfare training center"}
]

# Street routes
STREET_ROUTES = {
    "route_stockholm_gotland_ferry": [[59.3293, 18.0686], [59.2500, 18.3000], [58.9000, 18.5000], [58.5000, 18.6000], [58.1000, 18.5500], [57.6348, 18.2948]],
    "route_stockholm_malmo_e4": [[59.3293, 18.0686], [59.0000, 17.8000], [58.5000, 16.5000], [58.0000, 15.0000], [57.0000, 14.0000], [56.0000, 13.5000], [55.6050, 13.0038]],
    "route_stockholm_goteborg_e20": [[59.3293, 18.0686], [59.2000, 17.5000], [59.0000, 16.5000], [58.5000, 15.0000], [58.2000, 14.0000], [57.9000, 13.0000], [57.7089, 11.9746]],
    "route_stockholm_kiruna_e4": [[59.3293, 18.0686], [60.0000, 18.5000], [61.5000, 18.8000], [63.0000, 19.0000], [65.0000, 20.0000], [66.5000, 20.5000], [67.8558, 20.2253]],
    "route_goteborg_malmo_e6": [[57.7089, 11.9746], [57.5000, 12.0000], [57.0000, 12.3000], [56.5000, 12.7000], [56.0000, 12.9000], [55.6050, 13.0038]],
    "route_linkoping_stockholm_e4": [[58.4108, 15.6214], [58.6000, 16.0000], [58.9000, 16.5000], [59.1000, 17.2000], [59.3293, 18.0686]],
    "route_sundsvall_stockholm_e4": [[62.3908, 17.3069], [61.5000, 17.5000], [60.5000, 17.8000], [59.8000, 18.0000], [59.3293, 18.0686]],
    "route_ostersund_sundsvall_e14": [[63.1792, 14.6357], [62.9000, 15.5000], [62.6000, 16.5000], [62.3908, 17.3069]]
}

# Military Assets
ASSETS = [
    {"id": "TRUCK-01", "type": "truck", "lat": 59.3293, "lon": 18.0686, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 120.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-STOCKHOLM-HQ", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-02", "type": "truck", "lat": 59.35, "lon": 18.10, "route": "route_stockholm_gotland_ferry", "route_index": 0.5, "speed": 0.08, "status": "mobile", "fuel_level": 72.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 340.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-STOCKHOLM-HQ", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-03", "type": "truck", "lat": 57.6348, "lon": 18.2948, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 88.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 85.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-04", "type": "truck", "lat": 55.6050, "lon": 13.0038, "route": "route_goteborg_malmo_e6", "route_index": 0.8, "speed": 0.09, "status": "mobile", "fuel_level": 45.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 420.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-MALMO", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-01", "type": "apc", "lat": 59.8586, "lon": 17.6389, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 50.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-Uppsala", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-02", "type": "apc", "lat": 57.7089, "lon": 11.9746, "route": "route_goteborg_malmo_e6", "route_index": 0.3, "speed": 0.07, "status": "mobile", "fuel_level": 68.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 280.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTEBORG", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "HELI-01", "type": "helicopter", "lat": 59.4, "lon": 18.2, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 1200.0, "fuel_consumption_rate": 3.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 150.0, "maintenance_hours": 300.0, "maintenance_status": "operational", "home_base_id": "BASE-STOCKHOLM-HQ", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "HELI-02", "type": "helicopter", "lat": 58.2, "lon": 16.8, "route": "route_linkoping_stockholm_e4", "route_index": 0.4, "speed": 0.25, "status": "airborne", "fuel_level": 58.0, "fuel_capacity": 1200.0, "fuel_consumption_rate": 3.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 220.0, "maintenance_hours": 300.0, "maintenance_status": "operational", "home_base_id": "BASE-LINKOPING", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "HELI-03", "type": "helicopter", "lat": 57.6348, "lon": 18.2948, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 1200.0, "fuel_consumption_rate": 3.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 45.0, "maintenance_hours": 300.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "FIGHTER-01", "type": "fighter", "lat": 58.4108, "lon": 15.6214, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 80.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-LINKOPING", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "FIGHTER-02", "type": "fighter", "lat": 59.5, "lon": 17.5, "route": "route_linkoping_stockholm_e4", "route_index": 0.7, "speed": 0.8, "status": "airborne", "fuel_level": 62.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 145.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-LINKOPING", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "DRONE-01", "type": "drone", "lat": 59.35, "lon": 18.08, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 100.0, "battery_drain": 0.15, "has_battery": True, "fuel_type": "electric", "operating_hours": 25.0, "maintenance_hours": 100.0, "maintenance_status": "operational", "home_base_id": "BASE-STOCKHOLM-HQ", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "DRONE-02", "type": "drone", "lat": 57.7, "lon": 18.32, "route": "route_stockholm_gotland_ferry", "route_index": 0.9, "speed": 0.15, "status": "airborne", "battery": 42.0, "battery_drain": 0.15, "has_battery": True, "fuel_type": "electric", "operating_hours": 68.0, "maintenance_hours": 100.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "DRONE-03", "type": "drone", "lat": 67.8558, "lon": 20.2253, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 95.0, "battery_drain": 0.15, "has_battery": True, "fuel_type": "electric", "operating_hours": 12.0, "maintenance_hours": 100.0, "maintenance_status": "operational", "home_base_id": "BASE-KIRUNA", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "DRONE-04", "type": "drone", "lat": 55.65, "lon": 13.05, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 88.0, "battery_drain": 0.15, "has_battery": True, "fuel_type": "electric", "operating_hours": 35.0, "maintenance_hours": 100.0, "maintenance_status": "operational", "home_base_id": "BASE-MALMO", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "SHIP-01", "type": "ship", "lat": 56.1612, "lon": 15.5869, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 5000.0, "fuel_consumption_rate": 2.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 240.0, "maintenance_hours": 600.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "SHIP-02", "type": "ship", "lat": 57.7089, "lon": 11.9746, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 5000.0, "fuel_consumption_rate": 2.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 180.0, "maintenance_hours": 600.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTEBORG", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "SHIP-03", "type": "ship", "lat": 57.5, "lon": 18.1, "route": "stationary", "route_index": 0.0, "speed": 0.03, "status": "mobile", "fuel_level": 78.0, "fuel_capacity": 5000.0, "fuel_consumption_rate": 2.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 320.0, "maintenance_hours": 600.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "SUPPORT-01", "type": "truck", "lat": 62.3908, "lon": 17.3069, "route": "route_sundsvall_stockholm_e4", "route_index": 0.2, "speed": 0.08, "status": "mobile", "fuel_level": 85.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 195.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-SUNDSVALL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "SUPPORT-02", "type": "truck", "lat": 63.1792, "lon": 14.6357, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 75.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-OSTERSUND", "in_geofence": False, "last_alarm_tick": 0}
]

# Geofences
GEOFENCES = [
    {"id": "ZONE-RESTRICTED-STOCKHOLM", "name": "Stockholm Restricted Airspace", "polygon": [[59.4, 18.2], [59.4, 18.0], [59.3, 18.0], [59.3, 18.2]]},
    {"id": "ZONE-SAFE-GOTLAND", "name": "Gotland Safe Zone", "polygon": [[57.7, 18.4], [57.7, 18.1], [57.5, 18.1], [57.5, 18.4]]},
    {"id": "ZONE-TRAINING-KIRUNA", "name": "Kiruna Training Area", "polygon": [[68.0, 20.5], [68.0, 20.0], [67.7, 20.0], [67.7, 20.5]]},
    {"id": "ZONE-NAVAL-KARLSKRONA", "name": "Karlskrona Naval Zone", "polygon": [[56.3, 15.7], [56.3, 15.4], [56.0, 15.4], [56.0, 15.7]]},
    {"id": "ZONE-ALERT-MALMO", "name": "Malmö High Alert Zone", "polygon": [[55.7, 13.2], [55.7, 12.9], [55.5, 12.9], [55.5, 13.2]]}
]
