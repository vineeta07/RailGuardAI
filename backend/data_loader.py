"""
============================================================
RailGuard AI — Data Loader
============================================================
Loads CSV datasets at application startup and provides
in-memory data access for all API routers.

Also contains Indian city GPS coordinates and helper
utilities for generating simulated rake fleet state.
============================================================
"""

import os
import random
import pandas as pd
from datetime import datetime, timedelta


# ── Path Configuration ─────────────────────────────────────

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

DATA_DIR = os.path.join(BASE_DIR, "data")


# ── Indian City Coordinates ────────────────────────────────

CITY_COORDS = {
    "Mumbai":    {"lat": 19.0760, "lng": 72.8777},
    "Delhi":     {"lat": 28.7041, "lng": 77.1025},
    "Kolkata":   {"lat": 22.5726, "lng": 88.3639},
    "Chennai":   {"lat": 13.0827, "lng": 80.2707},
    "Ahmedabad": {"lat": 23.0225, "lng": 72.5714},
    "Jaipur":    {"lat": 26.9124, "lng": 75.7873},
    "Surat":     {"lat": 21.1702, "lng": 72.8311},
    "Bangalore": {"lat": 12.9716, "lng": 77.5946},
    "Lucknow":   {"lat": 26.8467, "lng": 80.9462},
    "Jharkhand":  {"lat": 23.3441, "lng": 85.3096},
}

CITIES = list(CITY_COORDS.keys())

CARGO_TYPES = [
    "Coal", "Steel", "Cement",
    "Fertilizer", "Limestone", "Container"
]

RAKE_TYPES = [
    "BOXN", "BCNA", "BTPN", "BOBR", "BOST"
]

RAKE_STATUSES = ["loaded", "empty", "maintenance", "in_transit"]


# ── In-Memory Data Stores ──────────────────────────────────

cargo_df: pd.DataFrame = pd.DataFrame()
routes_df: pd.DataFrame = pd.DataFrame()
health_df: pd.DataFrame = pd.DataFrame()
rakes: list = []
track_segments: list = []
forward_vision_alerts: list = []


# ── Load CSVs ──────────────────────────────────────────────

def load_all_data():
    """Load all CSV datasets into memory. Called at startup."""

    global cargo_df, routes_df, health_df
    global rakes, track_segments

    # Load cargo data
    cargo_path = os.path.join(DATA_DIR, "cargo.csv")
    if os.path.exists(cargo_path):
        cargo_df = pd.read_csv(cargo_path)
        print(f"[DATA] Loaded {len(cargo_df)} cargo records")
    else:
        print(f"[WARN] cargo.csv not found at {cargo_path}")

    # Load route data
    route_path = os.path.join(DATA_DIR, "routes.csv")
    if os.path.exists(route_path):
        routes_df = pd.read_csv(route_path)
        print(f"[DATA] Loaded {len(routes_df)} route records")
    else:
        print(f"[WARN] routes.csv not found at {route_path}")

    # Load basic rake health data
    health_path = os.path.join(DATA_DIR, "health.csv")
    if os.path.exists(health_path):
        health_df = pd.read_csv(health_path)
        print(f"[DATA] Loaded {len(health_df)} health records")
    else:
        print(f"[WARN] health.csv not found at {health_path}")

    # Generate simulated rakes from health data
    _generate_rakes()

    # Generate simulated track segments
    _generate_track_segments()

    print("[DATA] All data loaded successfully")


# ── Generate Simulated Rake Fleet ──────────────────────────

def _generate_rakes():
    """Create a simulated rake fleet from health.csv data."""

    global rakes
    rakes = []

    if health_df.empty:
        # Fallback: generate 50 rakes manually
        for i in range(1, 51):
            rakes.append(_make_rake(i))
        return

    for _, row in health_df.iterrows():
        rake_id = row.get("Rake_ID", f"RK-{len(rakes)+1:03d}")
        health_score = int(row.get("Health_Score", random.randint(40, 98)))
        maint_days = int(row.get("Days_Since_Maintenance", random.randint(1, 60)))

        city = random.choice(CITIES)
        coords = CITY_COORDS[city]

        # Add small random offset so rakes don't stack on map
        lat = coords["lat"] + random.uniform(-0.3, 0.3)
        lng = coords["lng"] + random.uniform(-0.3, 0.3)

        # Determine status from health
        if health_score < 40:
            status = "maintenance"
        elif random.random() < 0.3:
            status = "empty"
        elif random.random() < 0.5:
            status = "in_transit"
        else:
            status = "loaded"

        rakes.append({
            "rake_id": rake_id,
            "rake_type": random.choice(RAKE_TYPES),
            "location": city,
            "lat": round(lat, 4),
            "lng": round(lng, 4),
            "capacity_tons": random.choice([3200, 3500, 3800, 4000, 4200]),
            "health_score": health_score,
            "days_since_maintenance": maint_days,
            "status": status,
            "current_cargo": None if status in ["empty", "maintenance"]
                else random.choice(CARGO_TYPES),
        })


def _make_rake(index):
    """Create a single simulated rake."""

    city = random.choice(CITIES)
    coords = CITY_COORDS[city]
    health = random.randint(25, 98)

    return {
        "rake_id": f"RK-{index:03d}",
        "rake_type": random.choice(RAKE_TYPES),
        "location": city,
        "lat": round(coords["lat"] + random.uniform(-0.3, 0.3), 4),
        "lng": round(coords["lng"] + random.uniform(-0.3, 0.3), 4),
        "capacity_tons": random.choice([3200, 3500, 3800, 4000, 4200]),
        "health_score": health,
        "days_since_maintenance": random.randint(1, 60),
        "status": "maintenance" if health < 40
            else random.choice(["loaded", "empty", "in_transit"]),
        "current_cargo": random.choice(CARGO_TYPES)
            if health >= 40 else None,
    }


# ── Generate Track Segments ────────────────────────────────

def _generate_track_segments():
    """Create simulated track segments with risk scores."""

    global track_segments
    track_segments = []

    if not routes_df.empty:
        # Use unique source-destination pairs from routes
        seen = set()
        for _, row in routes_df.iterrows():
            src = row["Source"]
            dst = row["Destination"]
            key = f"{src}-{dst}"
            if key in seen:
                continue
            seen.add(key)

            src_coords = CITY_COORDS.get(src, {"lat": 20, "lng": 78})
            dst_coords = CITY_COORDS.get(dst, {"lat": 20, "lng": 78})

            risk = round(float(row.get("Risk_Score", random.uniform(0, 1))), 2)

            track_segments.append({
                "segment_id": f"TRK-{len(track_segments)+1:03d}",
                "source": src,
                "destination": dst,
                "source_lat": src_coords["lat"],
                "source_lng": src_coords["lng"],
                "dest_lat": dst_coords["lat"],
                "dest_lng": dst_coords["lng"],
                "distance_km": int(row.get("Distance_km", random.randint(100, 2000))),
                "risk_score": risk,
                "risk_level": "HIGH" if risk > 0.7
                    else "MEDIUM" if risk > 0.4 else "LOW",
                "congestion": row.get("Congestion", "Low"),
                "last_inspection": (
                    datetime.now() - timedelta(days=random.randint(1, 30))
                ).strftime("%Y-%m-%d"),
            })
    else:
        # Generate from city pairs
        for i, src in enumerate(CITIES):
            for dst in CITIES[i+1:]:
                risk = round(random.uniform(0, 1), 2)
                track_segments.append({
                    "segment_id": f"TRK-{len(track_segments)+1:03d}",
                    "source": src,
                    "destination": dst,
                    "source_lat": CITY_COORDS[src]["lat"],
                    "source_lng": CITY_COORDS[src]["lng"],
                    "dest_lat": CITY_COORDS[dst]["lat"],
                    "dest_lng": CITY_COORDS[dst]["lng"],
                    "distance_km": random.randint(200, 2200),
                    "risk_score": risk,
                    "risk_level": "HIGH" if risk > 0.7
                        else "MEDIUM" if risk > 0.4 else "LOW",
                    "congestion": random.choice(["Low", "Medium", "High"]),
                    "last_inspection": (
                        datetime.now() - timedelta(days=random.randint(1, 30))
                    ).strftime("%Y-%m-%d"),
                })


# ── Data Access Functions ──────────────────────────────────

def get_rakes(status=None, location=None):
    """Get all rakes, optionally filtered."""
    result = rakes
    if status:
        result = [r for r in result if r["status"] == status]
    if location:
        result = [r for r in result if r["location"] == location]
    return result


def get_rake_by_id(rake_id):
    """Find a single rake by ID."""
    for r in rakes:
        if r["rake_id"] == rake_id:
            return r
    return None


def get_cargo(source=None, destination=None, cargo_type=None, limit=100):
    """Get available cargo requests, optionally filtered."""
    df = cargo_df.copy()
    if source:
        df = df[df["Source"] == source]
    if destination:
        df = df[df["Destination"] == destination]
    if cargo_type:
        df = df[df["Cargo_Type"] == cargo_type]
    return df.head(limit).to_dict(orient="records")


def get_cargo_stats():
    """Get cargo distribution statistics."""
    if cargo_df.empty:
        return {"by_type": {}, "by_source": {}, "by_destination": {}}

    return {
        "by_type": cargo_df["Cargo_Type"].value_counts().to_dict(),
        "by_source": cargo_df["Source"].value_counts().to_dict(),
        "by_destination": cargo_df["Destination"].value_counts().to_dict(),
        "total_cargo": len(cargo_df),
        "total_tonnage": int(cargo_df["Tons"].sum()),
        "total_revenue": int(cargo_df["Revenue"].sum()),
        "avg_revenue": int(cargo_df["Revenue"].mean()),
    }


def get_routes(source=None, destination=None):
    """Get route data."""
    df = routes_df.copy()
    if source:
        df = df[df["Source"] == source]
    if destination:
        df = df[df["Destination"] == destination]
    return df.to_dict(orient="records")


def get_track_segments(min_risk=None):
    """Get track segments, optionally filtered by minimum risk."""
    result = track_segments
    if min_risk is not None:
        result = [s for s in result if s["risk_score"] >= min_risk]
    return result


def get_track_alerts():
    """Get high-risk track segments (risk > 0.7)."""
    return [s for s in track_segments if s["risk_score"] > 0.7]


def get_affected_rakes():
    """Find rakes near high-risk track zones."""
    alerts = get_track_alerts()
    affected = []

    for alert in alerts:
        for rake in rakes:
            # Check if rake is at source or destination of risky segment
            if rake["location"] in [alert["source"], alert["destination"]]:
                # Calculate approximate distance (simplified)
                distance = abs(rake["lat"] - alert["source_lat"]) * 111  # rough km
                priority = "Critical" if distance < 15 else \
                           "High" if distance < 30 else "Medium"

                affected.append({
                    "rake_id": rake["rake_id"],
                    "rake_location": rake["location"],
                    "segment": f"{alert['source']} → {alert['destination']}",
                    "risk_score": alert["risk_score"],
                    "distance_km": round(distance, 1),
                    "priority": priority,
                })

    # Sort by distance (closest first)
    affected.sort(key=lambda x: x["distance_km"])
    return affected[:20]  # Top 20


def get_available_cargo_for_city(city):
    """Get cargo requests originating from a given city."""
    if cargo_df.empty:
        return []
    filtered = cargo_df[cargo_df["Source"] == city]
    return filtered.head(20).to_dict(orient="records")
