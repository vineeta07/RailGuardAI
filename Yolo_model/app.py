import cv2

from detector import YOLODetector
from risk_assessment import RiskAssessment
from alert_system import AlertSystem

# ==========================
# Configuration
# ==========================

MODEL_PATH = "yolo11n.pt"
VIDEO_SOURCE = 0
CONFIDENCE_THRESHOLD = 0.5

# ==========================
# Initialize Components
# ==========================

detector = YOLODetector(
    model_path=MODEL_PATH,
    conf_threshold=CONFIDENCE_THRESHOLD
)

risk_engine = RiskAssessment()

alert_system = AlertSystem()

# ==========================
# Start Video Stream
# ==========================

cap = cv2.VideoCapture(VIDEO_SOURCE)

if not cap.isOpened():
    raise RuntimeError(
        f"Unable to open video source: {VIDEO_SOURCE}"
    )

print("Forward Vision Safety System Started")

# ==========================
# Main Loop
# ==========================

while True:

    success, frame = cap.read()

    if not success:
        print("Video stream ended.")
        break

    # ----------------------
    # Object Detection
    # ----------------------

    detections = detector.predict(frame)

    # ----------------------
    # Risk Assessment
    # ----------------------

    risk_results = risk_engine.assess_risk(
        detections
    )

    # ----------------------
    # Alert Generation
    # ----------------------

    alert_system.generate_alerts(
        risk_results
    )

    # ----------------------
    # Draw Bounding Boxes
    # ----------------------

    annotated_frame = detector.draw_boxes(
        frame.copy(),
        detections
    )

    # ----------------------
    # Show Risk Level
    # ----------------------

    y_position = 30

    for risk in risk_results:

        text = (
            f"{risk['object']} : "
            f"{risk['risk_level']}"
        )

        cv2.putText(
            annotated_frame,
            text,
            (10, y_position),
            cv2.FONT_HERSHEY_SIMPLEX,
            0.7,
            (0, 0, 255),
            2
        )

        y_position += 30

    # ----------------------
    # Display Window
    # ----------------------

    cv2.imshow(
        "Forward Vision Safety System",
        annotated_frame
    )

    key = cv2.waitKey(1)

    if key & 0xFF == ord("q"):
        print("Stopping system...")
        break

# ==========================
# Cleanup
# ==========================

cap.release()
cv2.destroyAllWindows()

print("System shutdown complete.")