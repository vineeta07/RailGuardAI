"""
============================================================
RailGuard AI — Live Simulation Engine
============================================================
Generates real-time events to make the Digital Twin feel
alive during the hackathon demo.

Tracks sustainability metrics and provides a reset()
function for the pitch "Reset Simulation" button.
============================================================
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


# ── Sustainability Metrics ─────────────────────────────────

sustainability = {
    "revenue_saved": 0,
    "empty_km_avoided": 0,
    "co2_reduced": 0.0,
    "decisions_made": 0,
    "alerts_generated": 0,
    "rakes_rerouted": 0,
    "start_time": datetime.now().isoformat(),
}

# ── Recent Events Log ──────────────────────────────────────

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


# ── Simulation Tick Functions ──────────────────────────────

def tick_rake_positions():
    """Move rakes slightly to simulate movement."""
    for rake in rakes:
        if rake["status"] == "in_transit":
            # Move towards a random nearby city
            rake["lat"] += random.uniform(-0.05, 0.05)
            rake["lng"] += random.uniform(-0.05, 0.05)

        # Occasionally change status
        roll = random.random()
        if roll < 0.02 and rake["status"] == "loaded":
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

        elif roll < 0.01 and rake["status"] == "empty":
            # Rake gets loaded with new cargo
            rake["status"] = "loaded"
            rake["current_cargo"] = random.choice(CARGO_TYPES)
            sustainability["revenue_saved"] += random.randint(200000, 800000)
            sustainability["empty_km_avoided"] += random.randint(50, 400)
            sustainability["co2_reduced"] += round(random.uniform(0.3, 2.5), 1)
            sustainability["decisions_made"] += 1


def tick_track_health():
    """Randomly fluctuate track risk scores."""
    for segment in track_segments:
        # Small random walk
        change = random.uniform(-0.03, 0.03)
        new_risk = max(0, min(1, segment["risk_score"] + change))
        segment["risk_score"] = round(new_risk, 2)
        segment["risk_level"] = (
            "HIGH" if new_risk > 0.7
            else "MEDIUM" if new_risk > 0.4
            else "LOW"
        )

        # Occasionally generate alerts for high-risk
        if new_risk > 0.85 and random.random() < 0.1:
            sustainability["alerts_generated"] += 1
            add_event(
                "track_alert",
                f"⚠ Track Risk Alert: {segment['source']} → "
                f"{segment['destination']} — Risk Score: "
                f"{int(new_risk * 100)}%",
                severity="critical",
                data={
                    "segment_id": segment["segment_id"],
                    "risk_score": new_risk,
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

        forward_vision_alerts.insert(0, alert)
        if len(forward_vision_alerts) > 50:
            forward_vision_alerts.pop()

        add_event(
            "vision_alert",
            alert["message"],
            severity="critical" if risk == "HIGH" else "warning",
            data=alert,
        )


# ── Main Simulation Loop ──────────────────────────────────

_simulation_running = False
_simulation_thread = None


def _simulation_loop():
    """Background thread that ticks the simulation."""
    global _simulation_running

    tick_count = 0

    while _simulation_running:
        tick_count += 1

        # Every 3 seconds: move rakes
        tick_rake_positions()

        # Every 5 seconds: update track health
        if tick_count % 2 == 0:
            tick_track_health()

        # Every 6 seconds: forward vision events
        if tick_count % 2 == 0:
            tick_forward_vision()

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
