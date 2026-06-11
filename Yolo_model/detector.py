from ultralytics import YOLO
import cv2

class YOLODetector:
    def __init__(self, model_path: str, conf_threshold: float = 0.5):
        """
        Initialize YOLO detector.

        Args:
            model_path: Path to YOLO model (.pt file)
            conf_threshold: Minimum confidence threshold
        """
        self.model = YOLO(model_path)
        self.conf_threshold = conf_threshold

    def predict(self, frame):
        """
        Run object detection on a frame.

        Args:
            frame: OpenCV image (numpy array)

        Returns:
            List of detections
        """

        results = self.model(frame, verbose=False)

        detections = []

        for result in results:
            for box in result.boxes:

                confidence = float(box.conf[0])

                if confidence < self.conf_threshold:
                    continue

                class_id = int(box.cls[0])
                class_name = self.model.names[class_id]

                x1, y1, x2, y2 = map(int, box.xyxy[0])

                detections.append({
                    "class_id": class_id,
                    "class_name": class_name,
                    "confidence": round(confidence, 3),
                    "bbox": [x1, y1, x2, y2]
                })

        return detections

    def draw_boxes(self, frame, detections):
        """
        Draw bounding boxes on frame.

        Args:
            frame: OpenCV image
            detections: Output from predict()

        Returns:
            Annotated frame
        """

        for det in detections:

            x1, y1, x2, y2 = det["bbox"]

            label = (
                f"{det['class_name']} "
                f"{det['confidence']:.2f}"
            )

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                label,
                (x1, y1 - 10),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.5,
                (0, 255, 0),
                2
            )

        return frame