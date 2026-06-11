from datetime import datetime
import os

class AlertSystem:

    def __init__(self, log_dir="outputs/logs"):
        """
        Initialize alert system.
        """

        self.log_dir = log_dir
        os.makedirs(self.log_dir, exist_ok=True)

        self.log_file = os.path.join(
            self.log_dir,
            "alerts.log"
        )
        
        self.previous_alerts = set()

    def generate_alerts(self, risk_results):
        """
        Process all detected risks and generate alerts.

        Args:
            risk_results: Output from RiskAssessment.assess_risk()
        """

        current_alerts = set()
        
        for risk in risk_results:

            alert_key = (
                risk['object'],
                risk['risk_level']
            )

            current_alerts.add(alert_key)

            if alert_key in self.previous_alerts:
                continue

            if risk["risk_level"] == "HIGH":
                self.high_risk_alert(risk)

            elif risk["risk_level"] == "MEDIUM":
                self.medium_risk_alert(risk)

            else:
                self.low_risk_alert(risk)
        self.previous_alerts = current_alerts

    def high_risk_alert(self, risk):
        """
        Handle high-risk alerts.
        """

        message = (
            f"[HIGH] "
            f"{risk['object'].upper()} detected "
            f"(confidence={risk['confidence']:.2f})"
        )

        print(f" {message}")

        self.log_alert(message)

    def medium_risk_alert(self, risk):
        """
        Handle medium-risk alerts.
        """

        message = (
            f"[MEDIUM] "
            f"{risk['object'].upper()} detected "
            f"(confidence={risk['confidence']:.2f})"
        )

        print(f" {message}")

        self.log_alert(message)

    def low_risk_alert(self, risk):
        """
        Handle low-risk alerts.
        """

        message = (
            f"[LOW] "
            f"{risk['object'].upper()} detected "
            f"(confidence={risk['confidence']:.2f})"
        )

        print(f" {message}")

        self.log_alert(message)

    def log_alert(self, message):
        """
        Save alert to log file.
        """

        timestamp = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        with open(
            self.log_file,
            "a",
            encoding="utf-8"
        ) as f:

            f.write(
                f"[{timestamp}] {message}\n"
            )