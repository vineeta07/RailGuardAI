"""
RailGuard AI — Rakes API Router
Fleet management endpoints for the rake fleet.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional

from data_loader import get_rakes, get_rake_by_id, CITY_COORDS

router = APIRouter(prefix="/api/rakes", tags=["Rakes"])


@router.get("")
def list_rakes(
    status: Optional[str] = Query(None, description="Filter: loaded, empty, maintenance, in_transit"),
    location: Optional[str] = Query(None, description="Filter by city name"),
):
    """List all rakes with optional filters."""
    return {
        "rakes": get_rakes(status=status, location=location),
        "total": len(get_rakes(status=status, location=location)),
        "cities": list(CITY_COORDS.keys()),
    }


@router.get("/{rake_id}")
def get_rake(rake_id: str):
    """Get details for a single rake."""
    rake = get_rake_by_id(rake_id)
    if not rake:
        raise HTTPException(status_code=404, detail=f"Rake {rake_id} not found")
    return rake


@router.get("/stats/summary")
def rake_stats():
    """Get fleet-level statistics."""
    all_rakes = get_rakes()

    status_counts = {}
    for r in all_rakes:
        s = r["status"]
        status_counts[s] = status_counts.get(s, 0) + 1

    location_counts = {}
    for r in all_rakes:
        loc = r["location"]
        location_counts[loc] = location_counts.get(loc, 0) + 1

    health_scores = [r["health_score"] for r in all_rakes]
    avg_health = sum(health_scores) / len(health_scores) if health_scores else 0

    return {
        "total_rakes": len(all_rakes),
        "by_status": status_counts,
        "by_location": location_counts,
        "avg_health_score": round(avg_health, 1),
        "critical_rakes": len([r for r in all_rakes if r["health_score"] < 40]),
        "empty_rakes": status_counts.get("empty", 0),
    }
