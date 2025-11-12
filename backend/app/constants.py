"""
Civilian constants for Project SYLON platform.
Sample data for municipalities, contractors, and civil logistics operations.
"""

ALARM_TYPES = {
    "geofence_entry": {
        "name": "Zone Entry",
        "color": "#d9b945",
        "severity": "medium",
        "icon": "⚠️"
    },
    "geofence_exit": {
        "name": "Zone Exit",
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
    "return_to_facility": {
        "name": "Return to Facility",
        "color": "#45b3d9",
        "severity": "low",
        "icon": "🏢"
    }
}

# Civilian facilities (distribution centers, warehouses, service centers)
DEFAULT_FACILITIES = [
    # Stockholm Region
    {"id": "FAC-STH-01", "name": "Stockholm Central Distribution Center", "type": "distribution_center", "lat": 59.3293, "lon": 18.0686, "capacity": 80, "assets_stored": [], "description": "Main logistics hub for Stockholm metropolitan area"},
    {"id": "FAC-STH-02", "name": "Stockholm North Warehouse", "type": "warehouse", "lat": 59.3826, "lon": 18.0649, "capacity": 60, "assets_stored": [], "description": "Northern Stockholm storage and distribution"},
    {"id": "FAC-STH-03", "name": "Stockholm Service Center", "type": "service_center", "lat": 59.2753, "lon": 18.0686, "capacity": 40, "assets_stored": [], "description": "Vehicle maintenance and service facility"},
    
    # Gothenburg Region
    {"id": "FAC-GOT-01", "name": "Gothenburg Logistics Hub", "type": "distribution_center", "lat": 57.7089, "lon": 11.9746, "capacity": 75, "assets_stored": [], "description": "West coast distribution center"},
    {"id": "FAC-GOT-02", "name": "Gothenburg Port Warehouse", "type": "warehouse", "lat": 57.6945, "lon": 11.9592, "capacity": 85, "assets_stored": [], "description": "Port area storage facility"},
    
    # Malmö Region
    {"id": "FAC-MAL-01", "name": "Malmö South Depot", "type": "warehouse", "lat": 55.6050, "lon": 13.0038, "capacity": 65, "assets_stored": [], "description": "Southern Sweden distribution center"},
    {"id": "FAC-MAL-02", "name": "Malmö Equipment Center", "type": "service_center", "lat": 55.5858, "lon": 13.0211, "capacity": 45, "assets_stored": [], "description": "Equipment storage and maintenance"},
    
    # Uppsala Region
    {"id": "FAC-UPP-01", "name": "Uppsala Regional Hub", "type": "distribution_center", "lat": 59.8586, "lon": 17.6389, "capacity": 55, "assets_stored": [], "description": "Central Sweden logistics center"},
    
    # Linköping Region
    {"id": "FAC-LIN-01", "name": "Linköping Distribution Center", "type": "distribution_center", "lat": 58.4108, "lon": 15.6214, "capacity": 50, "assets_stored": [], "description": "East region distribution hub"},
    
    # Örebro Region
    {"id": "FAC-ORE-01", "name": "Örebro Central Warehouse", "type": "warehouse", "lat": 59.2747, "lon": 15.2134, "capacity": 50, "assets_stored": [], "description": "Central Sweden storage facility"}
]

# Legacy alias for backward compatibility
DEFAULT_BASES = DEFAULT_FACILITIES

# Civilian assets (delivery trucks, service vehicles, equipment)
DEFAULT_ASSETS = [
    # Stockholm Fleet
    {"id": "TRUCK-STH-01", "type": "delivery_truck", "lat": 59.3293, "lon": 18.0686, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 200.0, "fuel_consumption_rate": 0.25, "fuel_type": "diesel", "has_battery": False, "operating_hours": 145.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-STH-01", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-STH-02", "type": "delivery_truck", "lat": 59.3300, "lon": 18.0690, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 88.0, "fuel_capacity": 200.0, "fuel_consumption_rate": 0.25, "fuel_type": "diesel", "has_battery": False, "operating_hours": 234.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-STH-01", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "VAN-STH-01", "type": "service_van", "lat": 59.3280, "lon": 18.0680, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 80.0, "fuel_consumption_rate": 0.15, "fuel_type": "diesel", "has_battery": False, "operating_hours": 312.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-STH-01", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "ELECTRIC-STH-01", "type": "electric_van", "lat": 59.3288, "lon": 18.0688, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 100.0, "battery_drain": 0.2, "has_battery": True, "fuel_type": "electric", "operating_hours": 89.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-STH-01", "in_geofence": False, "last_alarm_tick": 0},
    
    # Gothenburg Fleet
    {"id": "TRUCK-GOT-01", "type": "delivery_truck", "lat": 57.7089, "lon": 11.9746, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 200.0, "fuel_consumption_rate": 0.25, "fuel_type": "diesel", "has_battery": False, "operating_hours": 167.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-GOT-01", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-GOT-02", "type": "delivery_truck", "lat": 57.7095, "lon": 11.9750, "route": "route_got_mal", "route_index": 0.3, "speed": 0.6, "status": "mobile", "fuel_level": 67.0, "fuel_capacity": 200.0, "fuel_consumption_rate": 0.25, "fuel_type": "diesel", "has_battery": False, "operating_hours": 298.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-GOT-01", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "VAN-GOT-01", "type": "service_van", "lat": 57.7085, "lon": 11.9740, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 85.0, "fuel_capacity": 80.0, "fuel_consumption_rate": 0.15, "fuel_type": "diesel", "has_battery": False, "operating_hours": 401.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-GOT-01", "in_geofence": False, "last_alarm_tick": 0},
    
    # Malmö Fleet
    {"id": "TRUCK-MAL-01", "type": "delivery_truck", "lat": 55.6050, "lon": 13.0038, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 98.0, "fuel_capacity": 200.0, "fuel_consumption_rate": 0.25, "fuel_type": "diesel", "has_battery": False, "operating_hours": 456.0, "maintenance_hours": 500.0, "maintenance_status": "needs_maintenance", "home_facility_id": "FAC-MAL-01", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-MAL-02", "type": "delivery_truck", "lat": 55.6055, "lon": 13.0042, "route": "route_mal_got", "route_index": 0.6, "speed": 0.55, "status": "mobile", "fuel_level": 54.0, "fuel_capacity": 200.0, "fuel_consumption_rate": 0.25, "fuel_type": "diesel", "has_battery": False, "operating_hours": 389.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-MAL-01", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "VAN-MAL-01", "type": "service_van", "lat": 55.6048, "lon": 13.0035, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 76.0, "fuel_capacity": 80.0, "fuel_consumption_rate": 0.15, "fuel_type": "diesel", "has_battery": False, "operating_hours": 267.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-MAL-01", "in_geofence": False, "last_alarm_tick": 0},
    
    # Construction Equipment
    {"id": "EXCAVATOR-01", "type": "excavator", "lat": 59.2753, "lon": 18.0686, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 82.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 678.0, "maintenance_hours": 1000.0, "maintenance_status": "operational", "home_facility_id": "FAC-STH-03", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "FORKLIFT-01", "type": "forklift", "lat": 59.3295, "lon": 18.0688, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 85.0, "battery_drain": 0.3, "has_battery": True, "fuel_type": "electric", "operating_hours": 234.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_facility_id": "FAC-STH-01", "in_geofence": False, "last_alarm_tick": 0}
]

# Civilian geofences (delivery zones, restricted areas)
DEFAULT_GEOFENCES = [
    {"id": "ZONE-STH-CITY", "name": "Stockholm City Center Zone", "polygon": [[59.33, 18.08], [59.33, 18.05], [59.32, 18.05], [59.32, 18.08]]},
    {"id": "ZONE-STH-NORTH", "name": "Stockholm North District", "polygon": [[59.39, 18.10], [59.39, 18.00], [59.35, 18.00], [59.35, 18.10]]},
    {"id": "ZONE-GOT-PORT", "name": "Gothenburg Port Area", "polygon": [[57.72, 12.00], [57.72, 11.95], [57.68, 11.95], [57.68, 12.00]]},
    {"id": "ZONE-MAL-SOUTH", "name": "Malmö South District", "polygon": [[55.62, 13.05], [55.62, 12.95], [55.59, 12.95], [55.59, 13.05]]}
]
