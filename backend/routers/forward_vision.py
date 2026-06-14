"""
RailGuard AI — Forward Vision API Router
Obstacle detection alerts (simulated for demo).
"""

import cv2
import numpy as np
import base64
from fastapi import APIRouter, File, UploadFile, HTTPException
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

from data_loader import forward_vision_alerts
from simulation import add_event

# Import YOLO modules
from Yolo_model.detector import YOLODetector
from Yolo_model.risk_assessment import RiskAssessment
from Yolo_model.alert_system import AlertSystem
import os

router = APIRouter(prefix="/api/forward-vision", tags=["Forward Vision"])

# Global model instances
_yolo_detector = None
_risk_assessor = None
_alert_system = None

def get_models():
    global _yolo_detector, _risk_assessor, _alert_system
    if _yolo_detector is None:
        model_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../Yolo_model/yolo11n.pt"))
        print(f"[INFO] Loading YOLO model from {model_path}...")
        _yolo_detector = YOLODetector(model_path, conf_threshold=0.4)
        _risk_assessor = RiskAssessment()
        log_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../outputs/logs"))
        _alert_system = AlertSystem(log_dir=log_dir)
    return _yolo_detector, _risk_assessor, _alert_system


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

@router.post("/analyze-frame")
async def analyze_frame(file: UploadFile = File(...)):
    """
    Accepts an image file (e.g. from IoT camera on train), runs YOLO object
    detection, assesses risk, and logs alerts if hazardous objects are found.
    Returns the annotated image in base64.
    """
    try:
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if frame is None:
            raise HTTPException(status_code=400, detail="Invalid image file")

        detector, assessor, alert_system = get_models()

        # Run YOLO detection
        detections = detector.predict(frame)
        
        # Assess risk for detected objects
        risks = assessor.assess_risk(detections)

        # Log alerts using the YOLO alert system
        alert_system.generate_alerts(risks)

        # Draw bounding boxes
        annotated_frame = detector.draw_boxes(frame, detections)
        _, buffer = cv2.imencode('.jpg', annotated_frame)
        encoded_image = base64.b64encode(buffer).decode('utf-8')

        # Generate system alerts for HIGH/MEDIUM risk
        recorded_alerts = []
        for risk, det in zip(risks, detections):
            if risk["risk_level"] in ["HIGH", "MEDIUM"]:
                # Estimated distance (simulated for demo, normally derived from depth map)
                distance = max(10, int(100 - (det["confidence"] * 50)))
                
                alert = {
                    "id": len(forward_vision_alerts) + 1,
                    "object": risk["object"],
                    "confidence": risk["confidence"],
                    "risk_level": risk["risk_level"],
                    "distance_m": distance,
                    "rake_id": "RK-CAMERA-01",
                    "location": "Loco Cam 1",
                    "timestamp": datetime.now().isoformat(),
                    "message": risk["message"] + f" ({distance}m)",
                    "image_base64": encoded_image
                }

                forward_vision_alerts.insert(0, alert)
                if len(forward_vision_alerts) > 50:
                    forward_vision_alerts.pop()

                add_event(
                    "vision_detection",
                    alert["message"],
                    severity="critical" if risk["risk_level"] == "HIGH" else "warning",
                    data=alert,
                )
                recorded_alerts.append(alert)

        return {
            "detections": detections,
            "risks": risks,
            "annotated_image": f"data:image/jpeg;base64,{encoded_image}",
            "recorded_alerts": len(recorded_alerts)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/detect")
def report_detection(event: DetectionEvent):
    """
    Legacy IoT fallback endpoint for direct metadata injection.
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
        "image_base64": event.image_base64
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
