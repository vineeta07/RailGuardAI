"""
RailGuard AI — Live Simulation Engine

Generates real-time events to make the Digital Twin feel
alive during the hackathon demo.

Tracks sustainability metrics and provides a reset()
function for the pitch "Reset Simulation" button.
"""

import random
import time
import threading
from datetime import datetime

from data_loader import (
    CITIES, CITY_COORDS, CARGO_TYPES,
    rakes, track_segments, forward_vision_alerts,
    get_available_cargo_for_city
)
import sys
import os
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.append(PROJECT_ROOT)

from model.predict import predict_allocation
from model.predict_track import predict_track
from Yolo_model.alert_system import AlertSystem

# Initialize YOLO Alert System for Simulation
yolo_alert = AlertSystem()


# Sustainability Metrics 

sustainability = {
    "revenue_saved": 12450000,
    "empty_km_avoided": 8520,
    "co2_reduced": 48.7,
    "decisions_made": 142,
    "alerts_generated": 38,
    "rakes_rerouted": 67,
    "start_time": datetime.now().isoformat(),
}

# Recent Events Log 

recent_events = []
MAX_EVENTS = 100


def add_event(event_type, message, severity="info", data=None):
    """Add an event to the recent events log."""
    event = {
        "id": len(recent_events) + 1,
        "type": event_type,
        "message": message,
        "severity": severity,
        "timestamp": datetime.now().isoformat(),
        "data": data or {},
    }
    recent_events.insert(0, event)
    if len(recent_events) > MAX_EVENTS:
        recent_events.pop()
    return event


# Simulation Tick Functions 

def tick_rake_positions():
    """Move rakes slightly to simulate movement."""
    for rake in rakes:
        if rake["status"] == "in_transit":
            # Move towards a random nearby city
            rake["lat"] += random.uniform(-0.05, 0.05)
            rake["lng"] += random.uniform(-0.05, 0.05)

        # Occasionally change status
        roll = random.random()
        if roll < 0.2 and rake["status"] == "loaded":
            # Delivery complete — rake becomes empty
            rake["status"] = "empty"
            rake["current_cargo"] = None
            add_event(
                "rake_empty",
                f"Rake {rake['rake_id']} completed delivery at "
                f"{rake['location']} — now empty",
                severity="warning",
                data={"rake_id": rake["rake_id"], "location": rake["location"]}
            )

        elif roll < 0.1 and rake["status"] == "empty":
            # Rake gets loaded with new cargo
            rake["status"] = "loaded"
            rake["current_cargo"] = random.choice(CARGO_TYPES)
            
            # --- REAL ML INTEGRATION ---
            try:
                dest = random.choice([c for c in list(CITY_COORDS.keys()) if c != rake["location"]])
                input_features = {
                    "Cargo_Type": rake["current_cargo"],
                    "Source": rake["location"],
                    "Destination": dest,
                    "Tons": rake["capacity_tons"],
                    "Distance_km": random.randint(300, 2500),
                    "Travel_Time_h": random.randint(10, 50),
                    "Congestion": random.choice(["Low", "Medium", "High"]),
                    "Risk_Score": random.uniform(0.1, 0.9)
                }
                predicted_revenue = predict_allocation(input_features)
            except Exception as e:
                predicted_revenue = random.randint(200000, 800000)

            sustainability["revenue_saved"] += int(predicted_revenue)
            sustainability["empty_km_avoided"] += random.randint(50, 400)
            sustainability["co2_reduced"] += round(random.uniform(0.3, 2.5), 1)
            sustainability["decisions_made"] += 1


def tick_track_health():
    """Predict track risk scores using XGBoost."""
    for segment in track_segments:
        # Feed realistic telemetry to the Track Health ML model
        vibration_mean = random.uniform(0.5, 5.0)
        vibration_rms = vibration_mean * random.uniform(1.1, 1.5)
        track_age = random.randint(5, 40)
        rainfall = random.uniform(0.0, 100.0)
        
        try:
            prediction = predict_track(
                vibration_mean=vibration_mean,
                vibration_rms=vibration_rms,
                consensus_count=random.randint(1, 5),
                historical_defects=random.randint(0, 10),
                track_age_years=track_age,
                rainfall=rainfall
            )
            risk_label = prediction["risk_label"].upper()
            prob = prediction["risk_probability"] / 100.0
        except Exception:
            risk_label = random.choice(["LOW", "MEDIUM", "HIGH", "CRITICAL"])
            prob = random.uniform(0.1, 0.99)

        segment["risk_score"] = round(prob, 2)
        segment["risk_level"] = "HIGH" if risk_label in ["HIGH", "CRITICAL"] else risk_label

        # Occasionally generate alerts for high-risk
        if prob > 0.85 and random.random() < 0.1:
            sustainability["alerts_generated"] += 1
            add_event(
                "track_alert",
                f"⚠ Track Risk Alert: {segment['source']} → "
                f"{segment['destination']} — Risk Score: "
                f"{int(prob * 100)}%",
                severity="critical",
                data={
                    "segment_id": segment["segment_id"],
                    "risk_score": prob,
                    "source": segment["source"],
                    "destination": segment["destination"],
                }
            )


def tick_forward_vision():
    """Generate random forward vision detection events."""
    if random.random() < 0.15:  # 15% chance per tick
        objects = [
            ("person", "HIGH"),
            ("cow", "HIGH"),
            ("dog", "HIGH"),
            ("car", "MEDIUM"),
            ("truck", "MEDIUM"),
            ("motorcycle", "MEDIUM"),
            ("bicycle", "LOW"),
            ("bird", "LOW"),
        ]
        obj, risk = random.choice(objects)
        distance = random.randint(100, 800)
        confidence = round(random.uniform(0.7, 0.99), 2)

        if not rakes:
            return

        rake = random.choice(rakes)

        alert = {
            "id": len(forward_vision_alerts) + 1,
            "object": obj,
            "confidence": confidence,
            "risk_level": risk,
            "distance_m": distance,
            "rake_id": rake["rake_id"],
            "location": rake["location"],
            "timestamp": datetime.now().isoformat(),
            "message": (
                f"{'⚠' if risk == 'HIGH' else '⚡' if risk == 'MEDIUM' else 'ℹ'} "
                f"{risk} RISK: {obj.upper()} detected "
                f"{distance}m ahead of {rake['rake_id']}"
            ),
        }

        # Log via actual YOLO AlertSystem
        yolo_alert.generate_alerts([{
            "object": obj,
            "confidence": confidence,
            "risk_level": risk,
            "distance": distance
        }])

        forward_vision_alerts.insert(0, alert)
        if len(forward_vision_alerts) > 50:
            forward_vision_alerts.pop()

        add_event(
            "vision_alert",
            alert["message"],
            severity="critical" if risk == "HIGH" else "warning",
            data=alert,
        )


# Main Simulation Loop

_simulation_running = False
_simulation_thread = None


def _simulation_loop():
    """Background thread that ticks the simulation."""
    global _simulation_running

    tick_count = 0

    while _simulation_running:
        try:
            tick_count += 1

            # Every 3 seconds: move rakes
            tick_rake_positions()

            # Every 5 seconds: update track health
            if tick_count % 2 == 0:
                tick_track_health()

            # Every 6 seconds: forward vision events
            if tick_count % 2 == 0:
                tick_forward_vision()
        except Exception as e:
            import traceback
            print(f"SIMULATION THREAD CRASHED: {e}", flush=True)
            traceback.print_exc()

        time.sleep(3)


def start_simulation():
    """Start the background simulation thread."""
    global _simulation_running, _simulation_thread

    if _simulation_running:
        return

    _simulation_running = True
    _simulation_thread = threading.Thread(
        target=_simulation_loop,
        daemon=True
    )
    _simulation_thread.start()
    print("[SIM] Simulation engine started")


def stop_simulation():
    """Stop the simulation thread."""
    global _simulation_running
    _simulation_running = False
    print("[SIM] Simulation engine stopped")


def reset_simulation():
    """Reset all simulation state for pitch demo."""
    global sustainability, recent_events

    sustainability = {
        "revenue_saved": 0,
        "empty_km_avoided": 0,
        "co2_reduced": 0.0,
        "decisions_made": 0,
        "alerts_generated": 0,
        "rakes_rerouted": 0,
        "start_time": datetime.now().isoformat(),
    }

    recent_events.clear()
    forward_vision_alerts.clear()

    # Reset rake statuses to initial mix
    for rake in rakes:
        rake["status"] = random.choice(
            ["loaded", "loaded", "empty", "in_transit"]
        )
        if rake["health_score"] < 40:
            rake["status"] = "maintenance"
            rake["current_cargo"] = None
        elif rake["status"] == "empty":
            rake["current_cargo"] = None
        else:
            rake["current_cargo"] = random.choice(CARGO_TYPES)

    add_event(
        "system",
        "🔄 Simulation reset — all counters cleared",
        severity="info"
    )

    print("[SIM] Simulation reset")


def get_sustainability():
    """Get current sustainability metrics."""
    return sustainability


def get_recent_events(limit=20):
    """Get recent events."""
    return recent_events[:limit]
