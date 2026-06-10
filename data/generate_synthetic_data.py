import pandas as pd
import numpy as np
import os

# CONFIG

np.random.seed(42)

DATA_DIR = os.path.dirname(__file__)
os.makedirs(DATA_DIR, exist_ok=True)

CITIES = [
    "Mumbai",
    "Delhi",
    "Kolkata",
    "Chennai",
    "Ahmedabad",
    "Jaipur",
    "Surat",
    "Bangalore",
    "Lucknow",
    "Jharkhand"
]

CARGO_TYPES = [
    "Coal",
    "Steel",
    "Cement",
    "Fertilizer",
    "Limestone",
    "Container"
]

CARGO_RATES = {
    "Coal": 90,
    "Steel": 140,
    "Cement": 80,
    "Fertilizer": 110,
    "Limestone": 95,
    "Container": 160
}


# ROUTES

def generate_routes(num_routes=300):

    routes = []

    for route_id in range(1, num_routes + 1):

        source = np.random.choice(CITIES)

        destination = np.random.choice(
            [city for city in CITIES if city != source]
        )

        distance = np.random.randint(100, 2500)

        avg_speed = np.random.uniform(50, 90)

        travel_time = distance / avg_speed

        congestion = np.random.choice(
            ["Low", "Medium", "High"],
            p=[0.5, 0.3, 0.2]
        )

        risk_score = round(
            np.random.uniform(0.0, 1.0),
            3
        )

        routes.append(
            {
                "Route_ID": route_id,
                "Source": source,
                "Destination": destination,
                "Distance_km": distance,
                "Travel_Time_h": round(travel_time, 2),
                "Congestion": congestion,
                "Risk_Score": risk_score
            }
        )

    return pd.DataFrame(routes)


# ============================================================
# CARGO
# ============================================================

def generate_cargo(routes_df, num_cargo=10000):

    cargo_records = []

    for cargo_id in range(1, num_cargo + 1):

        route = routes_df.sample(1).iloc[0]

        cargo_type = np.random.choice(CARGO_TYPES)

        tons = np.random.randint(500, 5000)

        distance = route["Distance_km"]

        congestion = route["Congestion"]

        risk_score = route["Risk_Score"]

        # ----------------------------------------------------
        # Revenue Calculation
        # ----------------------------------------------------

        base_revenue = tons * CARGO_RATES[cargo_type]

        distance_bonus = distance * 25

        congestion_penalty = {
            "Low": 0,
            "Medium": 15000,
            "High": 35000
        }[congestion]

        risk_penalty = risk_score * 50000

        noise = np.random.normal(0, 15000)

        revenue = (
            base_revenue
            + distance_bonus
            - congestion_penalty
            - risk_penalty
            + noise
        )

        revenue = max(10000, int(revenue))

        cargo_records.append(
            {
                "Cargo_ID": cargo_id,
                "Cargo_Type": cargo_type,
                "Source": route["Source"],
                "Destination": route["Destination"],
                "Tons": tons,
                "Revenue": revenue
            }
        )

    return pd.DataFrame(cargo_records)


# ============================================================
# HEALTH  (basic rake health for Module 1/2)
# ============================================================

def generate_health(num_rakes=300):

    health_records = []

    for i in range(1, num_rakes + 1):

        health_records.append(
            {
                "Rake_ID": f"RK-{i:03d}",
                "Health_Score": np.random.randint(20, 100),
                "Days_Since_Maintenance": np.random.randint(1, 60)
            }
        )

    return pd.DataFrame(health_records)


# MODULE 3 – ROLLING STOCK HEALTH DATASET
# Generates 5 000 rows of synthetic sensor data with
# wheel / bearing health scores and a binary failure flag.
#
# Data-generation rules (from the hackathon spec):
#   Healthy  – vibration 0.2-0.4, temp 35-60, sound 40-70
#   Warning  – vibration 0.4-0.7, temp 60-80, sound 70-85
#   Critical – vibration 0.7-1.0, temp 80-100, sound 85-100
#
# Health scores decrease as sensor values and maintenance_days
# increase.
#
# failure = 1 when wheel_health < 50 OR bearing_health < 50

def _calc_health_for_dataset(vibration_rms, temperature,
                             sound_level, maintenance_days):
    """
    Deterministic health formula (duplicated here so the
    data generator has zero cross-module imports and can run
    standalone).  Kept in sync with model/predict_health.py.
    """
    vib_p   = min(100, (vibration_rms / 1.0) * 100)
    temp_p  = min(100, max(0, (temperature - 35) / 65) * 100)
    sound_p = min(100, max(0, (sound_level - 40) / 60) * 100)
    maint_p = min(100, (maintenance_days / 365) * 100)

    wheel  = max(0, min(100, 100 - (0.4*vib_p + 0.4*sound_p + 0.2*maint_p)))
    bearing = max(0, min(100, 100 - (0.4*vib_p + 0.4*temp_p + 0.2*maint_p)))

    return round(wheel), round(bearing)


def generate_rolling_stock_health(num_samples=5000):
    """Generate the rolling_stock_health.csv dataset."""

    records = []

    for _ in range(num_samples):

        # Pick a random operating regime
        state = np.random.rand()

        if state < 0.60:            # 60 % Healthy
            vib   = np.random.uniform(0.2, 0.4)
            temp  = np.random.uniform(35, 60)
            sound = np.random.uniform(40, 70)
            maint = np.random.randint(0, 90)

        elif state < 0.90:          # 30 % Warning
            vib   = np.random.uniform(0.4, 0.7)
            temp  = np.random.uniform(60, 80)
            sound = np.random.uniform(70, 85)
            maint = np.random.randint(90, 200)

        else:                       # 10 % Critical
            vib   = np.random.uniform(0.7, 1.0)
            temp  = np.random.uniform(80, 100)
            sound = np.random.uniform(85, 100)
            maint = np.random.randint(200, 365)

        wheel_h, bearing_h = _calc_health_for_dataset(
            vib, temp, sound, maint
        )

        # failure = 1 when wheel_health < 50 OR bearing_health < 50
        failure = 1 if (wheel_h < 50 or bearing_h < 50) else 0

        records.append({
            "vibration_rms":   round(vib, 3),
            "temperature":     round(temp, 1),
            "sound_level":     round(sound, 1),
            "maintenance_days": maint,
            "wheel_health":    wheel_h,
            "bearing_health":  bearing_h,
            "failure":         failure,
        })

    return pd.DataFrame(records)


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

    # --- Module 1/2 datasets --------------------------------
    print("Generating routes...")
    routes_df = generate_routes(300)

    print("Generating cargo...")
    cargo_df = generate_cargo(routes_df, 10000)

    print("Generating health data...")
    health_df = generate_health(300)

    cargo_path = os.path.join(DATA_DIR, "cargo.csv")
    route_path = os.path.join(DATA_DIR, "routes.csv")
    health_path = os.path.join(DATA_DIR, "health.csv")

    cargo_df.to_csv(cargo_path, index=False)
    routes_df.to_csv(route_path, index=False)
    health_df.to_csv(health_path, index=False)

    print(f"Cargo Records  : {len(cargo_df)}")
    print(f"Route Records  : {len(routes_df)}")
    print(f"Health Records : {len(health_df)}")

    #  Module 3 dataset 
    print("\nGenerating rolling stock health dataset (5 000 rows)...")
    rs_health_df = generate_rolling_stock_health(5000)

    rs_health_path = os.path.join(
        DATA_DIR, "rolling_stock_health.csv"
    )
    rs_health_df.to_csv(rs_health_path, index=False)

    print(f"Rolling Stock Health Records : {len(rs_health_df)}")
    print(f"  - Failures : {rs_health_df['failure'].sum()}")
    print(f"  - Healthy  : {(rs_health_df['failure'] == 0).sum()}")

    # summary 
    print("\nAll datasets generated successfully!")
    print("\nFiles saved:")
    print(f"  {cargo_path}")
    print(f"  {route_path}")
    print(f"  {health_path}")
    print(f"  {rs_health_path}")