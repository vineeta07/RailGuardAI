"""
RailGuard AI — Routes API Router
Route data and congestion endpoints.
"""

from fastapi import APIRouter, Query
from typing import Optional

from data_loader import get_routes, CITIES, CITY_COORDS

router = APIRouter(prefix="/api/routes", tags=["Routes"])


@router.get("")
def list_routes(
    source: Optional[str] = Query(None),
    destination: Optional[str] = Query(None),
):
    """List all routes with congestion and risk data."""
    records = get_routes(source=source, destination=destination)
    return {
        "routes": records,
        "total": len(records),
    }


@router.get("/congestion")
def congestion_data():
    """Get congestion summary for heatmap visualization."""
    routes = get_routes()

    congestion_counts = {"Low": 0, "Medium": 0, "High": 0}
    city_congestion = {}

    for r in routes:
        level = r.get("Congestion", "Low")
        congestion_counts[level] = congestion_counts.get(level, 0) + 1

        src = r.get("Source", "")
        if src not in city_congestion:
            city_congestion[src] = {"Low": 0, "Medium": 0, "High": 0}
        city_congestion[src][level] += 1

    return {
        "summary": congestion_counts,
        "by_city": city_congestion,
        "city_coords": CITY_COORDS,
    }
