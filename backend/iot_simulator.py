"""
============================================================
RailGuard AI — IoT Data Simulator
============================================================
Standalone script that simulates the entire IoT edge layer:
  - ESP32 + MPU6050 accelerometer data (vibration)
  - DS18B20 temperature sensor data
  - MAX9814 microphone data (sound)
  - GPS module data (rake positions)
  - RGB camera detections (YOLO events)

Run this alongside the FastAPI backend:
  Terminal 1:  python -m uvicorn app:app --reload --port 8000
  Terminal 2:  python iot_simulator.py

The script continuously pings backend endpoints with
realistic sensor readings, making dashboard charts
update in real-time during the hackathon demo.
============================================================
"""

import time
import random
import requests
import sys

# ── Configuration ──────────────────────────────────────────

API_BASE = "http://localhost:8000"

CITIES = [
    "Mumbai", "Delhi", "Kolkata", "Chennai",
    "Ahmedabad", "Jaipur", "Surat", "Bangalore",
    "Lucknow", "Jharkhand"
]

OBJECTS_DETECTED = [
    ("person", "HIGH"),
    ("cow", "HIGH"),
    ("dog", "HIGH"),
    ("horse", "HIGH"),
    ("car", "MEDIUM"),
    ("truck", "MEDIUM"),
    ("motorcycle", "MEDIUM"),
    ("bicycle", "LOW"),
]

RAKE_IDS = [f"RK-{i:03d}" for i in range(1, 51)]


# ── Sensor Data Generators ────────────────────────────────

def generate_healthy_readings():
    """Simulate a healthy rolling stock sensor reading."""
    return {
        "vibration_rms": round(random.uniform(0.15, 0.40), 3),
        "temperature": round(random.uniform(35, 55), 1),
        "sound_level": round(random.uniform(40, 65), 1),
        "maintenance_days": random.randint(5, 60),
    }


def generate_warning_readings():
    """Simulate a warning-level sensor reading."""
    return {
        "vibration_rms": round(random.uniform(0.40, 0.70), 3),
        "temperature": round(random.uniform(60, 80), 1),
        "sound_level": round(random.uniform(70, 85), 1),
        "maintenance_days": random.randint(90, 180),
    }


def generate_critical_readings():
    """Simulate critical sensor readings (potential failure)."""
    return {
        "vibration_rms": round(random.uniform(0.70, 1.0), 3),
        "temperature": round(random.uniform(80, 100), 1),
        "sound_level": round(random.uniform(85, 100), 1),
        "maintenance_days": random.randint(200, 365),
    }


def generate_forward_vision_event():
    """Simulate a YOLO detection event."""
    obj, risk = random.choice(OBJECTS_DETECTED)
    return {
        "object": obj,
        "confidence": round(random.uniform(0.65, 0.99), 2),
        "risk_level": risk,
        "distance_m": random.randint(100, 800),
        "rake_id": random.choice(RAKE_IDS),
        "location": random.choice(CITIES),
    }


# ── API Callers ────────────────────────────────────────────

def send_health_reading():
    """Send a rolling stock health reading to the backend."""
    # 60% healthy, 30% warning, 10% critical
    roll = random.random()
    if roll < 0.60:
        data = generate_healthy_readings()
    elif roll < 0.90:
        data = generate_warning_readings()
    else:
        data = generate_critical_readings()

    try:
        resp = requests.post(
            f"{API_BASE}/predict-health",
            json=data,
            timeout=5,
        )
        result = resp.json()
        status = result.get("status", "?")
        health = result.get("rake_health_score", "?")
        print(
            f"  [HEALTH] vib={data['vibration_rms']:.2f} "
            f"temp={data['temperature']}°C "
            f"sound={data['sound_level']}dB → "
            f"Health: {health}% ({status})"
        )
    except Exception as e:
        print(f"  [HEALTH] Error: {e}")


def send_vision_event():
    """Send a forward vision detection to the backend."""
    data = generate_forward_vision_event()

    try:
        resp = requests.post(
            f"{API_BASE}/api/forward-vision/detect",
            json=data,
            timeout=5,
        )
        print(
            f"  [VISION] {data['risk_level']} — "
            f"{data['object'].upper()} detected "
            f"{data['distance_m']}m ahead of {data['rake_id']}"
        )
    except Exception as e:
        print(f"  [VISION] Error: {e}")


def check_backend():
    """Verify the backend is running."""
    try:
        resp = requests.get(f"{API_BASE}/", timeout=5)
        if resp.status_code == 200:
            return True
    except Exception:
        pass
    return False


# ── Main Loop ──────────────────────────────────────────────

def main():
    print("=" * 55)
    print("  RailGuard AI — IoT Simulator")
    print("=" * 55)
    print(f"  Target: {API_BASE}")
    print()

    # Check backend is up
    print("  Checking backend connection...")
    if not check_backend():
        print(
            f"\n  ❌ Backend not reachable at {API_BASE}"
            f"\n  Start the backend first:"
            f"\n    cd backend"
            f"\n    python -m uvicorn app:app --reload --port 8000"
        )
        sys.exit(1)

    print("  ✅ Backend connected!\n")
    print("  Sending simulated sensor data...\n")
    print("  Press Ctrl+C to stop\n")
    print("-" * 55)

    tick = 0

    try:
        while True:
            tick += 1
            timestamp = time.strftime("%H:%M:%S")
            print(f"\n[{timestamp}] Tick #{tick}")

            # Every tick (2 sec): rolling stock health
            send_health_reading()

            # Every 3rd tick (~6 sec): forward vision
            if tick % 3 == 0:
                send_vision_event()

            time.sleep(2)

    except KeyboardInterrupt:
        print("\n\n  IoT Simulator stopped.")
        print("=" * 55)


if __name__ == "__main__":
    main()
