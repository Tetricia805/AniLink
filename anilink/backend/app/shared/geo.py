from math import radians, sin, cos, sqrt, atan2
from typing import Tuple, Optional


def haversine_distance(
    lat1: float, lon1: float, lat2: float, lon2: float
) -> float:
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees).
    
    Returns distance in kilometers.
    """
    # Convert latitude and longitude from degrees to radians
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = sin(dlat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2) ** 2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    # Earth radius in kilometers
    R = 6371.0
    
    distance = R * c
    return distance


def filter_by_radius(
    lat: float,
    lon: float,
    radius_km: float,
    items: list,
    get_lat_lon: callable,
) -> list:
    """
    Filter items by distance from a point.
    
    Args:
        lat: Center latitude
        lon: Center longitude
        radius_km: Radius in kilometers
        items: List of items to filter
        get_lat_lon: Function to extract (lat, lon) from each item
    
    Returns:
        List of items within radius, sorted by distance
    """
    results = []
    for item in items:
        item_lat, item_lon = get_lat_lon(item)
        distance = haversine_distance(lat, lon, item_lat, item_lon)
        if distance <= radius_km:
            results.append((item, distance))
    
    # Sort by distance
    results.sort(key=lambda x: x[1])
    
    return [item for item, _ in results], [dist for _, dist in results]
