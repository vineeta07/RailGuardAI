"""
============================================================
Module 3 – Train Rolling Stock Health XGBoost Model
============================================================
This script:
  1. Loads the synthetic rolling-stock health dataset
     (data/rolling_stock_health.csv).
  2. Trains an XGBoost classifier to predict the binary
     `failure` target from four sensor features.
  3. Prints Accuracy, Precision, Recall, F1, and a
     Confusion Matrix for the hackathon demo.
  4. Saves the trained model to
     model/rolling_stock_health_model.pkl

Run from the project root:
    python model/train_health_model.py
============================================================
"""

import os
import pickle

import pandas as pd
import xgboost as xgb

from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
)


# ============================================================
# PATH CONFIG
# ============================================================

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

DATA_PATH = os.path.join(
    BASE_DIR, "data", "rolling_stock_health.csv"
)

MODEL_PATH = os.path.join(
    BASE_DIR, "model", "rolling_stock_health_model.pkl"
)


# ============================================================
# LOAD DATA
# ============================================================

print("Loading dataset...")

try:
    df = pd.read_csv(DATA_PATH)
except FileNotFoundError:
    raise SystemExit(
        f"Dataset not found at {DATA_PATH}.\n"
        "Run  python data/generate_synthetic_data.py  first "
        "to generate all datasets (including rolling stock)."
    )

print(f"Total records : {len(df)}")
print(f"Failure count : {df['failure'].sum()}")
print(f"Healthy count : {(df['failure'] == 0).sum()}")


# ============================================================
# FEATURES & TARGET
# ============================================================

# We use ONLY raw sensor data + maintenance history.
# The model learns the non-linear relationship to failure.
FEATURE_COLUMNS = [
    "vibration_rms",
    "temperature",
    "sound_level",
    "maintenance_days",
]

TARGET = "failure"

X = df[FEATURE_COLUMNS]
y = df[TARGET]


# ============================================================
# TRAIN / TEST SPLIT
# ============================================================

# stratify=y keeps the same failure ratio in both splits
X_train, X_test, y_train, y_test = train_test_split(
    X, y,
    test_size=0.2,
    random_state=42,
    stratify=y,
)

print(f"\nTraining set : {len(X_train)}")
print(f"Testing  set : {len(X_test)}")


# ============================================================
# TRAIN XGBOOST CLASSIFIER
# ============================================================

print("\nTraining XGBoost classifier...")

model = xgb.XGBClassifier(
    n_estimators=200,
    max_depth=5,
    learning_rate=0.1,
    eval_metric="logloss",
    random_state=42,
)

model.fit(X_train, y_train)


# ============================================================
# EVALUATE
# ============================================================

y_pred = model.predict(X_test)

accuracy  = accuracy_score(y_test, y_pred)
precision = precision_score(y_test, y_pred, zero_division=0)
recall    = recall_score(y_test, y_pred, zero_division=0)
f1        = f1_score(y_test, y_pred, zero_division=0)
cm        = confusion_matrix(y_test, y_pred)

print("\n" + "=" * 40)
print("  Rolling Stock Health – Model Metrics")
print("=" * 40)
print(f"  Accuracy  : {accuracy:.4f}")
print(f"  Precision : {precision:.4f}")
print(f"  Recall    : {recall:.4f}")
print(f"  F1 Score  : {f1:.4f}")
print("\n  Confusion Matrix:")
print(f"  {cm}")
print("=" * 40)


# ============================================================
# SAVE MODEL
# ============================================================

with open(MODEL_PATH, "wb") as f:
    pickle.dump(model, f)

print(f"\nModel saved to: {MODEL_PATH}")
print("Training complete.")
