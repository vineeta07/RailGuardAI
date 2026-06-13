"""
RailGuard AI — Track Health API Router
Track monitoring, risk scores, and affected rake analysis.
"""

from fastapi import APIRouter, Query
from typing import Optional

from data_loader import (
    get_track_segments, get_track_alerts,
    get_affected_rakes, CITY_COORDS
)

router = APIRouter(prefix="/api/track-health", tags=["Track Health"])


@router.get("")
def list_track_segments(
    min_risk: Optional[float] = Query(None, ge=0, le=1, description="Minimum risk score filter"),
):
    """Get all track segments with risk scores."""
    segments = get_track_segments(min_risk=min_risk)
    return {
        "segments": segments,
        "total": len(segments),
        "high_risk_count": len([s for s in segments if s["risk_level"] == "HIGH"]),
    }


@router.get("/alerts")
def track_alerts():
    """Get high-risk track segments (risk > 70%)."""
    alerts = get_track_alerts()
    return {
        "alerts": alerts,
        "total": len(alerts),
        "message": f"{len(alerts)} high-risk track segments detected",
    }


@router.get("/affected-rakes")
def affected_rakes():
    """
    Find rakes near high-risk track zones.

    Returns rakes sorted by proximity to dangerous track
    segments, with priority classification.
    """
    affected = get_affected_rakes()
    return {
        "affected_rakes": affected,
        "total": len(affected),
        "critical_count": len([a for a in affected if a["priority"] == "Critical"]),
    }


@router.get("/map-data")
def track_health_map():
    """Get track segment data formatted for map visualization."""
    segments = get_track_segments()

    lines = []
    for seg in segments:
        lines.append({
            "id": seg["segment_id"],
            "from": [seg["source_lat"], seg["source_lng"]],
            "to": [seg["dest_lat"], seg["dest_lng"]],
            "risk_score": seg["risk_score"],
            "risk_level": seg["risk_level"],
            "label": f"{seg['source']} → {seg['destination']}",
            "color": (
                "#ef4444" if seg["risk_level"] == "HIGH"
                else "#f97316" if seg["risk_level"] == "MEDIUM"
                else "#10b981"
            ),
        })

    return {
        "lines": lines,
        "cities": CITY_COORDS,
    }
