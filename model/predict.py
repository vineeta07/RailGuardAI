import os
import joblib
import pandas as pd

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

MODEL_PATH = os.path.join(BASE_DIR, "model", "model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "model", "encoders.pkl")

# Load model
model = joblib.load(MODEL_PATH)

# Load encoders
encoders = joblib.load(ENCODER_PATH)

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

CATEGORICAL_COLUMNS = [
    "Cargo_Type",
    "Source",
    "Destination",
    "Congestion"
]

def _prepare_dataframe(input_dict):
    df = pd.DataFrame([input_dict])

    for col in CATEGORICAL_COLUMNS:

        if col not in df.columns:
            raise ValueError(f"Missing column: {col}")

        encoder = encoders[col]

        try:
            df[col] = encoder.transform(
                df[col].astype(str)
            )

        except ValueError:
            raise ValueError(
                f"Unknown value '{df[col].iloc[0]}' "
                f"for column '{col}'"
            )

    return df[FEATURE_COLUMNS]

def predict_allocation(input_features):
    df = _prepare_dataframe(input_features)

    prediction = model.predict(df)

    return float(prediction[0])