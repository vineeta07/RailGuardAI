class RiskAssessment:

    def __init__(self):

        # High-priority obstacles on railway tracks
        self.high_risk_objects = {
            "person",
            "cow",
            "dog",
            "horse",
            "sheep",
            "elephant",
            "bear"
        }

        # Potential crossing obstacles
        self.medium_risk_objects = {
            "car",
            "truck",
            "bus",
            "motorcycle",
            "bicycle"
        }

    def assess_risk(self, detections):
        """
        Assess risk for detected objects.

        Args:
            detections (list):
            [
                {
                    "class_name": "cow",
                    "confidence": 0.91,
                    "bbox": [...]
                }
            ]

        Returns:
            List of risk assessments
        """

        risk_results = []

        for detection in detections:

            object_name = detection["class_name"]
            confidence = detection["confidence"]

            # Determine risk level
            if object_name in self.high_risk_objects:
                risk_level = "HIGH"

            elif object_name in self.medium_risk_objects:
                risk_level = "MEDIUM"

            else:
                risk_level = "LOW"

            risk_results.append({
                "object": object_name,
                "confidence": confidence,
                "risk_level": risk_level,
                "message": self.generate_message(
                    object_name,
                    risk_level
                )
            })

        return risk_results

    def generate_message(
        self,
        object_name,
        risk_level
    ):
        """
        Generate alert message.
        """

        if risk_level == "HIGH":
            return (
                f"⚠ HIGH RISK: "
                f"{object_name.upper()} detected ahead."
            )

        elif risk_level == "MEDIUM":
            return (
                f" MEDIUM RISK: "
                f"{object_name.upper()} detected nearby."
            )

        return (
            f"LOW RISK: "
            f"{object_name.upper()} detected."
        )