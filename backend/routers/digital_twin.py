"""
RailGuard AI — Digital Twin API Router
Full system state for the Digital Twin map visualization.
"""

from fastapi import APIRouter

from data_loader import (
    get_rakes, get_track_segments, get_track_alerts,
    get_affected_rakes, get_cargo_stats,
    CITY_COORDS, forward_vision_alerts
)
from simulation import (
    get_sustainability, get_recent_events,
    reset_simulation
)

router = APIRouter(prefix="/api/digital-twin", tags=["Digital Twin"])


@router.get("/state")
def get_system_state():
    """
    Full system snapshot for the Digital Twin map.

    Returns everything needed to render the complete
    Digital Twin visualization in a single API call.
    """

    all_rakes = get_rakes()
    track_alerts = get_track_alerts()
    sustainability = get_sustainability()
    events = get_recent_events(limit=10)

    # Rake summary
    status_counts = {}
    for r in all_rakes:
        s = r["status"]
        status_counts[s] = status_counts.get(s, 0) + 1

    return {
        # Rake fleet
        "rakes": all_rakes,
        "rake_summary": {
            "total": len(all_rakes),
            "by_status": status_counts,
        },

        # Track health
        "track_alerts": track_alerts,
        "track_alert_count": len(track_alerts),

        # Affected rakes
        "affected_rakes": get_affected_rakes()[:10],

        # Forward vision alerts
        "vision_alerts": forward_vision_alerts[:5],

        # Sustainability
        "sustainability": sustainability,

        # Recent events
        "recent_events": events,

        # Map config
        "cities": CITY_COORDS,
        "default_bounds": {
            "south_west": [12.5, 68.0],
            "north_east": [30.0, 90.0],
            "center": [22.5, 78.5],
            "zoom": 5,
        },
        "focus_corridor": {
            "name": "Delhi–Mumbai Freight Corridor",
            "bounds": [[18.9, 72.8], [28.7, 77.2]],
        },
    }


@router.get("/sustainability")
def sustainability_metrics():
    """Get aggregated sustainability metrics."""
    return get_sustainability()


@router.post("/reset")
def reset_demo():
    """
    Reset simulation for pitch demo.

    Clears all counters, resets rake positions,
    and removes all alerts. Call this before
    judges arrive to let them watch metrics
    build up from zero.
    """
    reset_simulation()
    return {
        "message": "Simulation reset — all counters cleared",
        "sustainability": get_sustainability(),
    }
