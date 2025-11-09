
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

# Real Swedish Armed Forces Bases (2025)
BASES = [
    # AIR BASES
    {"id": "BASE-F21-LULEA", "name": "F 21 Luleå (Norrbottens flygflottilj)", "type": "air_base", "lat": 67.885, "lon": 20.286, "capacity": 80, "assets_stored": [], "description": "Northern Air Force Wing - Gripen fighters and arctic operations"},
    {"id": "BASE-F7-SATENAS", "name": "F 7 Såtenäs (Skaraborgs flygflottilj)", "type": "air_base", "lat": 58.426, "lon": 12.907, "capacity": 75, "assets_stored": [], "description": "Skaraborg Air Wing - Primary Gripen operations center"},
    {"id": "BASE-F17-KALLINGE", "name": "F 17 Kallinge (Blekinge flygflottilj)", "type": "air_base", "lat": 56.267, "lon": 15.265, "capacity": 70, "assets_stored": [], "description": "Blekinge Air Wing - Multi-role air operations"},
    {"id": "BASE-UPPSALA-AIR", "name": "Uppsala Air Base", "type": "air_base", "lat": 59.897, "lon": 17.590, "capacity": 60, "assets_stored": [], "description": "Transport aviation hub - C-390 Millennium base"},

    # NAVAL BASES
    {"id": "BASE-KARLSKRONA-NAVAL", "name": "Karlskrona Marinbasen", "type": "naval_base", "lat": 56.161, "lon": 15.587, "capacity": 90, "assets_stored": [], "description": "Main Swedish Naval Base - Submarines and corvettes"},
    {"id": "BASE-BERGA-NAVAL", "name": "Berga Örlogsbas", "type": "naval_base", "lat": 59.333, "lon": 18.267, "capacity": 65, "assets_stored": [], "description": "Stockholm archipelago naval base - Amphibious operations"},
    {"id": "BASE-GOTEBORG-NAVAL", "name": "Göteborg Naval Station", "type": "naval_base", "lat": 57.709, "lon": 11.975, "capacity": 55, "assets_stored": [], "description": "West coast naval operations - Mine warfare"},

    # ARMY BASES
    {"id": "BASE-P18-GOTLAND", "name": "Gotlands Regemente (P 18)", "type": "army_base", "lat": 57.635, "lon": 18.295, "capacity": 85, "assets_stored": [], "description": "Strategic island defense regiment - Baltic security"},
    {"id": "BASE-I19-BODEN", "name": "I 19 Boden (Norrbottens regemente)", "type": "army_base", "lat": 65.825, "lon": 21.689, "capacity": 80, "assets_stored": [], "description": "Northern regiment - Arctic warfare specialists"},
    {"id": "BASE-P4-SKOVDE", "name": "P 4 Skövde (Skaraborgs regemente)", "type": "army_base", "lat": 58.391, "lon": 13.846, "capacity": 75, "assets_stored": [], "description": "Armor and mechanized infantry regiment"},
    {"id": "BASE-ENKOPING-LED", "name": "Ledningsregementet Enköping", "type": "command_center", "lat": 59.636, "lon": 17.078, "capacity": 50, "assets_stored": [], "description": "Command and control regiment - Strategic communications"},
    {"id": "BASE-ING2-EKSJO", "name": "Ing 2 Eksjö (Göta ingenjörregemente)", "type": "support_base", "lat": 57.666, "lon": 14.971, "capacity": 45, "assets_stored": [], "description": "Engineering regiment - Infrastructure and support"}
]

# Realistic Swedish Military Routes
STREET_ROUTES = {
    # E4 - Main north-south highway
    "route_stockholm_lulea_e4": [[59.333, 18.267], [60.675, 17.141], [62.391, 17.307], [63.825, 20.263], [65.584, 22.155], [67.885, 20.286]],
    "route_stockholm_karlskrona_e22": [[59.333, 18.267], [58.757, 17.009], [57.781, 16.630], [56.878, 16.351], [56.161, 15.587]],
    "route_stockholm_gotland_ferry": [[59.333, 18.267], [59.200, 18.400], [58.800, 18.600], [58.200, 18.550], [57.635, 18.295]],

    # E6 - West coast
    "route_goteborg_oslo_e6": [[57.709, 11.975], [58.280, 11.501], [58.970, 11.186], [59.329, 11.073], [59.911, 10.757]],
    "route_malmo_goteborg_e6": [[55.605, 13.004], [56.046, 12.694], [56.662, 12.858], [57.103, 12.254], [57.709, 11.975]],

    # E20 - Stockholm to Göteborg
    "route_stockholm_goteborg_e20": [[59.333, 18.267], [59.278, 16.547], [58.754, 15.164], [58.391, 13.846], [58.111, 13.054], [57.709, 11.975]],

    # E14 - East-west through central Sweden
    "route_sundsvall_ostersund_e14": [[62.391, 17.307], [62.630, 16.200], [62.990, 15.100], [63.179, 14.636]],

    # Internal strategic routes
    "route_satenas_skovde": [[58.426, 12.907], [58.391, 13.846]],
    "route_kallinge_karlskrona": [[56.267, 15.265], [56.161, 15.587]],
    "route_enkoping_uppsala": [[59.636, 17.078], [59.897, 17.590]],
    "route_boden_lulea": [[65.825, 21.689], [67.885, 20.286]]
}

# Realistic Swedish Armed Forces Assets (50 assets)
ASSETS = [
    # === F 21 LULEÅ AIR BASE (Arctic operations) ===
    {"id": "GRIPEN-21A", "type": "fighter", "lat": 67.885, "lon": 20.286, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 145.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-F21-LULEA", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "GRIPEN-21B", "type": "fighter", "lat": 67.890, "lon": 20.290, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 88.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 178.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-F21-LULEA", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "HELI-21A", "type": "helicopter", "lat": 67.880, "lon": 20.280, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 1200.0, "fuel_consumption_rate": 3.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 234.0, "maintenance_hours": 300.0, "maintenance_status": "operational", "home_base_id": "BASE-F21-LULEA", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "DRONE-21A", "type": "drone", "lat": 67.888, "lon": 20.288, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 100.0, "battery_drain": 0.15, "has_battery": True, "fuel_type": "electric", "operating_hours": 45.0, "maintenance_hours": 100.0, "maintenance_status": "operational", "home_base_id": "BASE-F21-LULEA", "in_geofence": False, "last_alarm_tick": 0},

    # === F 7 SÅTENÄS (Primary Gripen base) ===
    {"id": "GRIPEN-7A", "type": "fighter", "lat": 58.426, "lon": 12.907, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 89.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-F7-SATENAS", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "GRIPEN-7B", "type": "fighter", "lat": 58.430, "lon": 12.910, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 94.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 123.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-F7-SATENAS", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "GRIPEN-7C", "type": "fighter", "lat": 58.422, "lon": 12.912, "route": "route_satenas_skovde", "route_index": 0.3, "speed": 0.8, "status": "airborne", "fuel_level": 67.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 156.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-F7-SATENAS", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "HELI-7A", "type": "helicopter", "lat": 58.428, "lon": 12.905, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 85.0, "fuel_capacity": 1200.0, "fuel_consumption_rate": 3.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 267.0, "maintenance_hours": 300.0, "maintenance_status": "operational", "home_base_id": "BASE-F7-SATENAS", "in_geofence": False, "last_alarm_tick": 0},

    # === F 17 KALLINGE (Blekinge Air Wing) ===
    {"id": "GRIPEN-17A", "type": "fighter", "lat": 56.267, "lon": 15.265, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 98.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 201.0, "maintenance_hours": 200.0, "maintenance_status": "needs_maintenance", "home_base_id": "BASE-F17-KALLINGE", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "GRIPEN-17B", "type": "fighter", "lat": 56.270, "lon": 15.268, "route": "route_kallinge_karlskrona", "route_index": 0.6, "speed": 0.75, "status": "airborne", "fuel_level": 54.0, "fuel_capacity": 3000.0, "fuel_consumption_rate": 8.0, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 178.0, "maintenance_hours": 200.0, "maintenance_status": "operational", "home_base_id": "BASE-F17-KALLINGE", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "HELI-17A", "type": "helicopter", "lat": 56.265, "lon": 15.270, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 76.0, "fuel_capacity": 1200.0, "fuel_consumption_rate": 3.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 189.0, "maintenance_hours": 300.0, "maintenance_status": "operational", "home_base_id": "BASE-F17-KALLINGE", "in_geofence": False, "last_alarm_tick": 0},

    # === UPPSALA AIR BASE (Transport aviation) ===
    {"id": "C390-UPP-01", "type": "airplane", "lat": 59.897, "lon": 17.590, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 4500.0, "fuel_consumption_rate": 5.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 112.0, "maintenance_hours": 250.0, "maintenance_status": "operational", "home_base_id": "BASE-UPPSALA-AIR", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "C390-UPP-02", "type": "airplane", "lat": 59.900, "lon": 17.595, "route": "route_enkoping_uppsala", "route_index": 0.8, "speed": 0.6, "status": "airborne", "fuel_level": 68.0, "fuel_capacity": 4500.0, "fuel_consumption_rate": 5.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 145.0, "maintenance_hours": 250.0, "maintenance_status": "operational", "home_base_id": "BASE-UPPSALA-AIR", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "HELI-UPP-01", "type": "helicopter", "lat": 59.895, "lon": 17.588, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 91.0, "fuel_capacity": 1200.0, "fuel_consumption_rate": 3.5, "fuel_type": "jet_fuel", "has_battery": False, "operating_hours": 223.0, "maintenance_hours": 300.0, "maintenance_status": "operational", "home_base_id": "BASE-UPPSALA-AIR", "in_geofence": False, "last_alarm_tick": 0},

    # === KARLSKRONA NAVAL BASE (Main naval HQ) ===
    {"id": "SUB-GOTLAND-1", "type": "submarine", "lat": 56.161, "lon": 15.587, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 2000.0, "fuel_consumption_rate": 1.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 456.0, "maintenance_hours": 600.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "SUB-GOTLAND-2", "type": "submarine", "lat": 56.165, "lon": 15.590, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 88.0, "fuel_capacity": 2000.0, "fuel_consumption_rate": 1.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 523.0, "maintenance_hours": 600.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "CORVETTE-VISBY-1", "type": "corvette", "lat": 56.160, "lon": 15.585, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 3500.0, "fuel_consumption_rate": 2.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 234.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "CORVETTE-VISBY-2", "type": "corvette", "lat": 56.158, "lon": 15.582, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 3500.0, "fuel_consumption_rate": 2.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 189.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "PATROL-KA-01", "type": "patrol_boat", "lat": 56.163, "lon": 15.589, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "mobile", "fuel_level": 67.0, "fuel_capacity": 1500.0, "fuel_consumption_rate": 2.0, "fuel_type": "diesel", "has_battery": False, "operating_hours": 312.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
{"id": "CARRIER-01", "type": "aircraft_carrier", "lat": 56.161, "lon": 15.587, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 10000.0, "fuel_consumption_rate": 4.0, "fuel_type": "diesel", "has_battery": False, "operating_hours": 1200.0, "maintenance_hours": 800.0, "maintenance_status": "operational", "home_base_id": "BASE-KARLSKRONA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    # === BERGA NAVAL BASE (Amphibious ops) ===
{"id": "BATTLESHIP-01", "type": "battleship", "lat": 57.709, "lon": 11.975, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 8000.0, "fuel_consumption_rate": 3.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 890.0, "maintenance_hours": 700.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTEBORG-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "AMPHIBIOUS-BG-01", "type": "ship", "lat": 59.333, "lon": 18.267, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 85.0, "fuel_capacity": 4000.0, "fuel_consumption_rate": 3.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 278.0, "maintenance_hours": 550.0, "maintenance_status": "operational", "home_base_id": "BASE-BERGA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "PATROL-BG-01", "type": "patrol_boat", "lat": 59.330, "lon": 18.265, "route": "route_stockholm_gotland_ferry", "route_index": 0.4, "speed": 0.05, "status": "mobile", "fuel_level": 72.0, "fuel_capacity": 1500.0, "fuel_consumption_rate": 2.0, "fuel_type": "diesel", "has_battery": False, "operating_hours": 456.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-BERGA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "PATROL-BG-02", "type": "patrol_boat", "lat": 59.335, "lon": 18.270, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 94.0, "fuel_capacity": 1500.0, "fuel_consumption_rate": 2.0, "fuel_type": "diesel", "has_battery": False, "operating_hours": 198.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-BERGA-NAVAL", "in_geofence": False, "last_alarm_tick": 0},

    # === GÖTEBORG NAVAL STATION (West coast) ===
    {"id": "MINE-GB-01", "type": "ship", "lat": 57.709, "lon": 11.975, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 90.0, "fuel_capacity": 2000.0, "fuel_consumption_rate": 2.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 345.0, "maintenance_hours": 450.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTEBORG-NAVAL", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "CORVETTE-GB-01", "type": "corvette", "lat": 57.712, "lon": 11.978, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 87.0, "fuel_capacity": 3500.0, "fuel_consumption_rate": 2.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 267.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-GOTEBORG-NAVAL", "in_geofence": False, "last_alarm_tick": 0},

    # === GOTLAND REGIMENT P18 (Strategic island defense) ===
    {"id": "TANK-P18-01", "type": "tank", "lat": 57.635, "lon": 18.295, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 500.0, "fuel_consumption_rate": 1.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 234.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-P18-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TANK-P18-02", "type": "tank", "lat": 57.638, "lon": 18.298, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 88.0, "fuel_capacity": 500.0, "fuel_consumption_rate": 1.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 289.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-P18-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-P18-01", "type": "apc", "lat": 57.632, "lon": 18.292, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 178.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-P18-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-P18-02", "type": "apc", "lat": 57.640, "lon": 18.300, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 123.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-P18-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "DRONE-P18-01", "type": "drone", "lat": 57.637, "lon": 18.297, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 95.0, "battery_drain": 0.15, "has_battery": True, "fuel_type": "electric", "operating_hours": 67.0, "maintenance_hours": 100.0, "maintenance_status": "operational", "home_base_id": "BASE-P18-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-P18-01", "type": "truck", "lat": 57.633, "lon": 18.293, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 85.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 456.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-P18-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},

    # === I 19 BODEN (Northern Regiment) ===
    {"id": "TANK-I19-01", "type": "tank", "lat": 65.825, "lon": 21.689, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 90.0, "fuel_capacity": 500.0, "fuel_consumption_rate": 1.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 312.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-I19-BODEN", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-I19-01", "type": "apc", "lat": 65.828, "lon": 21.692, "route": "route_boden_lulea", "route_index": 0.2, "speed": 0.08, "status": "mobile", "fuel_level": 76.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 267.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-I19-BODEN", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-I19-02", "type": "apc", "lat": 65.822, "lon": 21.686, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 94.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 198.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-I19-BODEN", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-I19-01", "type": "truck", "lat": 65.826, "lon": 21.690, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 88.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 389.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-I19-BODEN", "in_geofence": False, "last_alarm_tick": 0},
{"id": "ARTILLERY-P18-01", "type": "artillery", "lat": 57.636, "lon": 18.296, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.0, "fuel_type": "diesel", "has_battery": False, "operating_hours": 345.0, "maintenance_hours": 450.0, "maintenance_status": "operational", "home_base_id": "BASE-P18-GOTLAND", "in_geofence": False, "last_alarm_tick": 0},

    # === P 4 SKÖVDE (Skaraborg Regiment) ===
    {"id": "TANK-P4-01", "type": "tank", "lat": 58.391, "lon": 13.846, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 100.0, "fuel_capacity": 500.0, "fuel_consumption_rate": 1.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 145.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-P4-SKOVDE", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TANK-P4-02", "type": "tank", "lat": 58.394, "lon": 13.849, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 92.0, "fuel_capacity": 500.0, "fuel_consumption_rate": 1.5, "fuel_type": "diesel", "has_battery": False, "operating_hours": 223.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-P4-SKOVDE", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-P4-01", "type": "apc", "lat": 58.388, "lon": 13.843, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 87.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 334.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-P4-SKOVDE", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-P4-02", "type": "apc", "lat": 58.393, "lon": 13.848, "route": "route_stockholm_goteborg_e20", "route_index": 0.5, "speed": 0.08, "status": "mobile", "fuel_level": 64.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 412.0, "maintenance_hours": 400.0, "maintenance_status": "needs_maintenance", "home_base_id": "BASE-P4-SKOVDE", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "TRUCK-P4-01", "type": "truck", "lat": 58.390, "lon": 13.845, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 79.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 467.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-P4-SKOVDE", "in_geofence": False, "last_alarm_tick": 0},

    # === ENKÖPING COMMAND REGIMENT ===
    {"id": "CMD-ENK-01", "type": "truck", "lat": 59.636, "lon": 17.078, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 350.0, "fuel_consumption_rate": 0.7, "fuel_type": "diesel", "has_battery": False, "operating_hours": 289.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-ENKOPING-LED", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "CMD-ENK-02", "type": "truck", "lat": 59.638, "lon": 17.080, "route": "route_enkoping_uppsala", "route_index": 0.3, "speed": 0.08, "status": "mobile", "fuel_level": 71.0, "fuel_capacity": 350.0, "fuel_consumption_rate": 0.7, "fuel_type": "diesel", "has_battery": False, "operating_hours": 356.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-ENKOPING-LED", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "DRONE-ENK-01", "type": "drone", "lat": 59.637, "lon": 17.079, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "battery": 88.0, "battery_drain": 0.15, "has_battery": True, "fuel_type": "electric", "operating_hours": 112.0, "maintenance_hours": 100.0, "maintenance_status": "operational", "home_base_id": "BASE-ENKOPING-LED", "in_geofence": False, "last_alarm_tick": 0},

    # === EKSJÖ ENGINEERING REGIMENT ===
    {"id": "ENG-EKS-01", "type": "truck", "lat": 57.666, "lon": 14.971, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 90.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 378.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-ING2-EKSJO", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "ENG-EKS-02", "type": "truck", "lat": 57.668, "lon": 14.973, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 83.0, "fuel_capacity": 300.0, "fuel_consumption_rate": 0.8, "fuel_type": "diesel", "has_battery": False, "operating_hours": 423.0, "maintenance_hours": 500.0, "maintenance_status": "operational", "home_base_id": "BASE-ING2-EKSJO", "in_geofence": False, "last_alarm_tick": 0},
    {"id": "APC-EKS-01", "type": "apc", "lat": 57.664, "lon": 14.969, "route": "stationary", "route_index": 0.0, "speed": 0.0, "status": "parked", "fuel_level": 95.0, "fuel_capacity": 400.0, "fuel_consumption_rate": 1.2, "fuel_type": "diesel", "has_battery": False, "operating_hours": 256.0, "maintenance_hours": 400.0, "maintenance_status": "operational", "home_base_id": "BASE-ING2-EKSJO", "in_geofence": False, "last_alarm_tick": 0}
]

# Strategic Geofences
GEOFENCES = [
    {"id": "ZONE-GOTLAND-DEFENSE", "name": "Gotland Defense Zone", "polygon": [[57.8, 18.5], [57.8, 18.0], [57.4, 18.0], [57.4, 18.5]]},
    {"id": "ZONE-STOCKHOLM-AIRSPACE", "name": "Stockholm Restricted Airspace", "polygon": [[59.5, 18.4], [59.5, 18.0], [59.2, 18.0], [59.2, 18.4]]},
    {"id": "ZONE-KARLSKRONA-NAVAL", "name": "Karlskrona Naval Security Zone", "polygon": [[56.3, 15.8], [56.3, 15.4], [56.0, 15.4], [56.0, 15.8]]},
    {"id": "ZONE-NORTHERN-TRAINING", "name": "Northern Training Area (Boden-Luleå)", "polygon": [[68.0, 21.0], [68.0, 20.0], [65.5, 20.0], [65.5, 21.0]]},
    {"id": "ZONE-BALTIC-PATROL", "name": "Baltic Sea Patrol Zone", "polygon": [[57.0, 19.0], [57.0, 17.5], [55.5, 17.5], [55.5, 19.0]]},
    {"id": "ZONE-WEST-COAST", "name": "West Coast Naval Operations", "polygon": [[58.0, 12.5], [58.0, 11.5], [57.5, 11.5], [57.5, 12.5]]},
    {"id": "ZONE-SATENAS-RESTRICTED", "name": "Såtenäs Air Operations Zone", "polygon": [[58.6, 13.2], [58.6, 12.6], [58.2, 12.6], [58.2, 13.2]]}
]