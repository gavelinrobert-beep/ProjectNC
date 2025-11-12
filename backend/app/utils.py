"""
Utility functions for Project SYLON backend.
"""
import math

def point_in_poly(lat: float, lon: float, poly: list[list[float]]) -> bool:
    """Check if a point is inside a polygon."""
    inside = False
    n = len(poly)
    if n < 3:
        return False
    for i in range(n):
        j = (i - 1) % n
        xi, yi = poly[i][0], poly[i][1]
        xj, yj = poly[j][0], poly[j][1]
        intersect = ((yi > lon) != (yj > lon)) and (lat < (xj - xi) * (lon - yi) / (yj - yi + 1e-12) + xi)
        if intersect:
            inside = not inside
    return inside

def interpolate(start, end, t):
    """Linear interpolation between two points."""
    return start + (end - start) * t

def update_asset_position(asset, street_routes):
    """Update asset position along its route with smooth movement."""
    if asset["speed"] == 0.0 or asset["route"] == "stationary":
        return
    route_name = asset["route"]
    if route_name not in street_routes:
        return
    route = street_routes[route_name]
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

def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two points using Haversine formula (in km)."""
    R = 6371  # Earth's radius in km

    lat1_rad = math.radians(lat1)
    lat2_rad = math.radians(lat2)
    delta_lat = math.radians(lat2 - lat1)
    delta_lon = math.radians(lon2 - lon1)

    a = (math.sin(delta_lat / 2) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(delta_lon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def update_asset_on_mission(asset: dict, waypoints: list, mission_id: str) -> bool:
    """
    Update asset position along mission waypoints.
    Returns True if mission is completed (reached final waypoint).

    Speed interpretation: asset['speed'] is treated as km/h directly
    """
    if not waypoints or len(waypoints) < 2:
        return False

    # Initialize mission tracking if not present
    if not asset.get('mission_id') or asset.get('mission_id') != mission_id:
        asset['mission_id'] = mission_id
        asset['mission_waypoint_index'] = 0
        asset['mission_progress'] = 0.0
        # Set status to mobile/airborne
        if asset['type'] in ['plane', 'helicopter']:
            asset['status'] = 'airborne'
        else:
            asset['status'] = 'mobile'
        print(f"[MISSION] Asset {asset['id']} starting mission {mission_id} with speed {asset.get('speed')} km/h")

    current_wp_idx = int(asset.get('mission_waypoint_index', 0))
    progress = asset.get('mission_progress', 0.0)

    # Check if mission completed
    if current_wp_idx >= len(waypoints) - 1 and progress >= 0.99:
        asset['status'] = 'parked'
        asset['mission_id'] = None
        asset['mission_waypoint_index'] = 0
        asset['mission_progress'] = 0.0
        # Snap to final waypoint
        asset['lat'] = waypoints[-1]['lat']
        asset['lon'] = waypoints[-1]['lon']
        print(f"[MISSION] Asset {asset['id']} completed mission {mission_id}")
        return True  # Mission completed

    # Get current and next waypoint
    current_wp = waypoints[current_wp_idx]
    next_wp_idx = min(current_wp_idx + 1, len(waypoints) - 1)
    next_wp = waypoints[next_wp_idx]

    # Calculate distance between current and next waypoint
    distance_km = calculate_distance(current_wp['lat'], current_wp['lon'],
                                     next_wp['lat'], next_wp['lon'])

    print(f"[MISSION] Asset {asset['id']}: waypoint {current_wp_idx}->{next_wp_idx}, distance={distance_km:.2f}km, progress={progress:.3f}")

    # If waypoints are at the same location (distance ~0), skip to next
    if distance_km < 0.001:  # Less than 1 meter
        print(f"[MISSION] Waypoints too close, skipping to next")
        current_wp_idx += 1
        progress = 0.0
        asset['mission_waypoint_index'] = current_wp_idx
        asset['mission_progress'] = progress
        # Check if completed after skipping
        if current_wp_idx >= len(waypoints) - 1:
            asset['status'] = 'parked'
            asset['mission_id'] = None
            return True
        return False

    # Interpolate position between waypoints
    asset['lat'] = interpolate(current_wp['lat'], next_wp['lat'], progress)
    asset['lon'] = interpolate(current_wp['lon'], next_wp['lon'], progress)

    # Speed calculation: asset['speed'] is km/h
    # We update every second, so convert to km/s
    speed_kmh = float(asset.get('speed', 100.0))  # Default 100 km/h if not set
    speed_kmps = speed_kmh / 3600.0  # Convert km/h to km/s

    # Progress increment based on speed and distance
    progress_increment = speed_kmps / distance_km

    progress += progress_increment

    # Move to next waypoint if progress >= 1
    if progress >= 1.0:
        current_wp_idx += 1
        progress = 0.0
        print(f"[MISSION] Asset {asset['id']} reached waypoint {current_wp_idx}/{len(waypoints)}")

    asset['mission_waypoint_index'] = current_wp_idx
    asset['mission_progress'] = progress

    return False  # Mission not yet completed
