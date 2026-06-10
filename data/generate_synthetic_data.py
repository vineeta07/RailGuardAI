import pandas as pd
import numpy as np
import os

# ============================================================
# CONFIG
# ============================================================

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


# ============================================================
# ROUTES
# ============================================================

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
# HEALTH
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


# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":

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

    print("\nGenerated Successfully!")
    print(f"Cargo Records  : {len(cargo_df)}")
    print(f"Route Records  : {len(routes_df)}")
    print(f"Health Records : {len(health_df)}")

    print("\nFiles saved:")
    print(cargo_path)
    print(route_path)
    print(health_path)