import os
import joblib
import pandas as pd

from xgboost import XGBRegressor
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

DATA_DIR = os.path.join(BASE_DIR, "data")
MODEL_DIR = os.path.join(BASE_DIR, "model")

os.makedirs(MODEL_DIR, exist_ok=True)

CARGO_PATH = os.path.join(DATA_DIR, "cargo.csv")
ROUTE_PATH = os.path.join(DATA_DIR, "routes.csv")

MODEL_PATH = os.path.join(MODEL_DIR, "model.pkl")
ENCODER_PATH = os.path.join(MODEL_DIR, "encoders.pkl")

print("Loading datasets...")

cargo_df = pd.read_csv(CARGO_PATH)
route_df = pd.read_csv(ROUTE_PATH)

print(f"Cargo Records : {len(cargo_df)}")
print(f"Route Records : {len(route_df)}")

merged = pd.merge(
    cargo_df,
    route_df,
    on=["Source", "Destination"],
    how="left"
)

merged["Distance_km"] = merged["Distance_km"].fillna(
    merged["Distance_km"].median()
)

merged["Travel_Time_h"] = merged["Travel_Time_h"].fillna(
    merged["Travel_Time_h"].median()
)

merged["Congestion"] = merged["Congestion"].fillna("Medium")

merged["Risk_Score"] = merged["Risk_Score"].fillna(
    merged["Risk_Score"].median()
)

categorical_cols = [
    "Cargo_Type",
    "Source",
    "Destination",
    "Congestion"
]

encoders = {}

for col in categorical_cols:
    encoder = LabelEncoder()

    merged[col] = encoder.fit_transform( # type: ignore
        merged[col].astype(str)
    )

    encoders[col] = encoder

# Save encoders
joblib.dump(encoders, ENCODER_PATH)

print(f"Encoders saved to: {ENCODER_PATH}")

FEATURE_COLUMNS = [
    "Cargo_Type",
    "Source",
    "Destination",
    "Tons",
    "Distance_km",
    "Travel_Time_h",
    "Congestion",
    "Risk_Score"
]

TARGET_COLUMN = "Revenue"

X = merged[FEATURE_COLUMNS]
y = merged[TARGET_COLUMN]

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)

print("Training XGBoost model...")

model = XGBRegressor(
    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,
    objective="reg:squarederror",
    random_state=42
)

model.fit(X_train, y_train)

preds = model.predict(X_test)

mae = mean_absolute_error(y_test, preds)
r2 = r2_score(y_test, preds)

print("\nModel Performance")
print(f"MAE : {mae:.2f}")
print(f"R2  : {r2:.4f}")

joblib.dump(model, MODEL_PATH)

print(f"\nModel saved to: {MODEL_PATH}")
print("Training complete.")
