import pandas as pd
import numpy as np
import os

def generate_track_data():
    np.random.seed(42)
    NUM_ROWS = 20000

    track_types = ["Mainline", "Freight", "Branch"]
    seasons = ["Summer", "Monsoon", "Winter"]

    data = []

    for i in range(NUM_ROWS):
        track_id = f"TRK_{i+1:05d}"
        latitude = np.random.uniform(28.40, 28.95)
        longitude = np.random.uniform(76.90, 77.60)
        track_type = np.random.choice(track_types, p=[0.5, 0.3, 0.2])
        season = np.random.choice(seasons, p=[0.35, 0.35, 0.30])

        if season == "Summer":
            rainfall = np.random.uniform(0, 5)
            temperature = np.random.uniform(30, 45)
            humidity = np.random.uniform(25, 60)
        elif season == "Monsoon":
            rainfall = np.random.uniform(5, 25)
            temperature = np.random.uniform(22, 35)
            humidity = np.random.uniform(60, 95)
        else:
            rainfall = np.random.uniform(0, 8)
            temperature = np.random.uniform(10, 25)
            humidity = np.random.uniform(35, 80)

        track_age = np.random.randint(1, 50)
        days_since_inspection = np.random.randint(1, 365)
        maintenance_quality = np.random.uniform(0, 1)
        historical_defects = np.random.poisson(1 + track_age / 8)
        daily_train_frequency = np.random.randint(5, 100)

        if track_type == "Freight":
            axle_load = np.random.uniform(20, 35)
        else:
            axle_load = np.random.uniform(15, 30)

        train_speed = np.random.uniform(40, 120)

        vibration_mean = (
            0.8 + track_age * 0.06 + rainfall * 0.06 +
            daily_train_frequency * 0.015 + axle_load * 0.04 +
            (1 - maintenance_quality) * 2
        )

        if track_type == "Branch":
            vibration_mean += 0.5
        elif track_type == "Freight":
            vibration_mean += 0.3

        vibration_mean += np.random.normal(0, 0.35)
        vibration_mean = max(0.2, vibration_mean)

        vibration_std = vibration_mean * 0.18 + track_age * 0.03 + np.random.normal(0, 0.25)
        vibration_std = max(0.1, vibration_std)
        vibration_max = vibration_mean + np.random.uniform(1, 5)
        vibration_rms = vibration_mean + np.random.uniform(-0.2, 1)
        jerk = vibration_mean * 0.3 + vibration_std * 0.2 + np.random.uniform(0, 1)

        anomaly_strength = vibration_mean + vibration_std + jerk + historical_defects * 0.2
        consensus_count = int(np.clip(anomaly_strength / 3 + np.random.normal(0, 0.5), 1, 6))

        risk_score = (
            vibration_mean * 2 + vibration_max * 1.2 + vibration_rms * 1.5 +
            vibration_std + jerk * 1.5 + consensus_count * 3 +
            historical_defects * 1 + track_age * 0.3 + rainfall * 0.2 +
            days_since_inspection * 0.015 + (1 - maintenance_quality) * 6 +
            daily_train_frequency * 0.1 + axle_load * 0.2
        )

        if rainfall > 15 and track_age > 30:
            risk_score += 8
        if consensus_count >= 5:
            risk_score += 6
        if historical_defects > 10:
            risk_score += 5

        risk_score += np.random.normal(0, 5)
        risk_score = max(0, risk_score)

        if risk_score < 35:
            defect_type = "Normal"
        elif risk_score < 60:
            defect_type = np.random.choice(["Normal", "Loose Joint"], p=[0.6, 0.4])
        elif risk_score < 90:
            defect_type = np.random.choice(["Loose Joint", "Misalignment", "Track Wear"])
        else:
            defect_type = np.random.choice(["Track Wear", "Crack"], p=[0.4, 0.6])

        maintenance_cost = int(10000 + risk_score * 1800 + np.random.normal(0, 8000))
        maintenance_cost = max(maintenance_cost, 10000)

        estimated_failure_days = int(np.clip(365 - risk_score * 2 + np.random.normal(0, 20), 1, 365))

        data.append([
            track_id, latitude, longitude, vibration_mean, vibration_max,
            vibration_rms, vibration_std, jerk, train_speed, consensus_count,
            rainfall, temperature, humidity, historical_defects,
            days_since_inspection, track_age, daily_train_frequency,
            axle_load, maintenance_quality, track_type, season,
            defect_type, risk_score, maintenance_cost, estimated_failure_days
        ])

    columns = [
        "Track_ID", "Latitude", "Longitude", "Vibration_Mean", "Vibration_Max",
        "Vibration_RMS", "Vibration_STD", "Jerk", "Train_Speed",
        "Consensus_Count", "Rainfall", "Temperature", "Humidity",
        "Historical_Defects", "Days_Since_Last_Inspection", "Track_Age_Years",
        "Daily_Train_Frequency", "Axle_Load", "Maintenance_Quality",
        "Track_Type", "Season", "Defect_Type", "Risk_Score",
        "Maintenance_Cost", "Estimated_Failure_Days"
    ]

    df = pd.DataFrame(data, columns=columns)

    df["Risk_Label"] = pd.qcut(
        df["Risk_Score"],
        q=[0, 0.25, 0.55, 0.80, 1],
        labels=["Safe", "Medium", "High", "Critical"]
    )
    df["Risk_Label"] = df["Risk_Label"].astype(str)

    # Save to data directory
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out_path = os.path.join(BASE_DIR, "data", "track_health.csv")
    
    df.to_csv(out_path, index=False)
    print(f"Dataset Generated Successfully at {out_path}!")
    print("Shape:", df.shape)

if __name__ == "__main__":
    generate_track_data()
