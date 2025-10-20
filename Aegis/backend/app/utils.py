"""
Utility functions for Aegis backend.
"""

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
