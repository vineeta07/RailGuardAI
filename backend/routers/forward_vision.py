"""
RailGuard AI — Forward Vision API Router
Obstacle detection alerts (simulated for demo).
"""

from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

from data_loader import forward_vision_alerts
from simulation import add_event

router = APIRouter(prefix="/api/forward-vision", tags=["Forward Vision"])


class DetectionEvent(BaseModel):
    object: str = Field(..., description="Detected object type")
    confidence: float = Field(..., ge=0, le=1)
    risk_level: str = Field(..., description="HIGH, MEDIUM, or LOW")
    distance_m: int = Field(..., gt=0)
    rake_id: Optional[str] = None
    location: Optional[str] = None
    image_base64: Optional[str] = None


@router.get("/alerts")
def get_alerts(limit: int = 20):
    """Get recent forward vision detection alerts."""
    alerts = forward_vision_alerts[:limit]

    # Stats
    risk_counts = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
    object_counts = {}

    for a in forward_vision_alerts:
        risk = a.get("risk_level", "LOW")
        risk_counts[risk] = risk_counts.get(risk, 0) + 1
        obj = a.get("object", "unknown")
        object_counts[obj] = object_counts.get(obj, 0) + 1

    return {
        "alerts": alerts,
        "total": len(forward_vision_alerts),
        "stats": {
            "by_risk": risk_counts,
            "by_object": object_counts,
        },
    }


@router.post("/detect")
def report_detection(event: DetectionEvent):
    """
    Accept a detection event from the YOLO system.

    In production, the Raspberry Pi / Jetson Nano sends
    detection results here. For the hackathon, the
    IoT simulator or Capacitor camera sends events.
    """

    alert = {
        "id": len(forward_vision_alerts) + 1,
        "object": event.object,
        "confidence": event.confidence,
        "risk_level": event.risk_level,
        "distance_m": event.distance_m,
        "rake_id": event.rake_id or "Unknown",
        "location": event.location or "Unknown",
        "timestamp": datetime.now().isoformat(),
        "message": (
            f"{'⚠' if event.risk_level == 'HIGH' else '⚡'} "
            f"{event.risk_level} RISK: {event.object.upper()} "
            f"detected {event.distance_m}m ahead"
        ),
    }

    forward_vision_alerts.insert(0, alert)
    if len(forward_vision_alerts) > 50:
        forward_vision_alerts.pop()

    add_event(
        "vision_detection",
        alert["message"],
        severity="critical" if event.risk_level == "HIGH" else "warning",
        data=alert,
    )

    return {
        "status": "recorded",
        "alert": alert,
    }
