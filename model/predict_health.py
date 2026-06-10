"""
============================================================
Module 3 – Rolling Stock Health Prediction
============================================================
This module provides prediction logic for the Rolling Stock
Health Monitoring system.  It estimates wheel health,
bearing health, rake health score, failure probability, and
an overall status string from raw sensor readings.

Key design decisions
--------------------
* Health scores are calculated deterministically from
  sensor inputs so the hackathon demo always produces
  explainable, reproducible numbers.
* The XGBoost classifier is only used for failure
  probability (a learned, non-linear estimate), while
  the rule-based health formulas stay transparent.
============================================================
"""

import os
import pickle
import numpy as np


# PATH CONFIG

BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

HEALTH_MODEL_PATH = os.path.join(
    BASE_DIR, "model", "rolling_stock_health_model.pkl"
)


# ============================================================
# HEALTH CALCULATION HELPERS
# ============================================================

def _calculate_health(vibration_rms, temperature,
                      sound_level, maintenance_days):
    """
    Calculate wheel and bearing health from raw sensor data.

    Each parameter is scaled to a 0-100 penalty:
        0  = no degradation
        100 = maximum degradation

    Wheel health is most affected by vibration & sound.
    Bearing health is most affected by vibration & temperature.
    Maintenance days contribute a smaller ageing penalty to
    both components.
    """

    # --- normalise each sensor to a 0-100 penalty -----------
    vib_penalty = min(100, (vibration_rms / 1.0) * 100)

    temp_penalty = min(
        100,
        max(0, (temperature - 35) / 65) * 100
    )

    sound_penalty = min(
        100,
        max(0, (sound_level - 40) / 60) * 100
    )

    maint_penalty = min(100, (maintenance_days / 365) * 100)

    # --- composite penalties --------------------------------
    # Wheel: 40 % vibration, 40 % sound, 20 % maintenance
    wheel_health = max(
        0,
        min(
            100,
            100 - (
                0.4 * vib_penalty
                + 0.4 * sound_penalty
                + 0.2 * maint_penalty
            )
        )
    )

    # Bearing: 40 % vibration, 40 % temperature, 20 % maint.
    bearing_health = max(
        0,
        min(
            100,
            100 - (
                0.4 * vib_penalty
                + 0.4 * temp_penalty
                + 0.2 * maint_penalty
            )
        )
    )

    return round(wheel_health), round(bearing_health)


# ============================================================
# MODEL LOADER  (lazy – loaded once on first call)
# ============================================================

_health_model = None


def _load_model():
    """Load the trained XGBoost model from disk (once)."""
    global _health_model

    if _health_model is not None:
        return _health_model

    try:
        with open(HEALTH_MODEL_PATH, "rb") as f:
            _health_model = pickle.load(f)
    except FileNotFoundError:
        print(
            f"[WARNING] Health model not found at "
            f"{HEALTH_MODEL_PATH}.  "
            f"Run model/train_health_model.py first."
        )

    return _health_model


# ============================================================
# MAIN PREDICTION FUNCTION
# ============================================================

def predict_health(vibration_rms, temperature,
                   sound_level, maintenance_days):
    """
    Predict rolling-stock health metrics.

    Parameters
    ----------
    vibration_rms   : float  – RMS vibration reading
    temperature     : float  – sensor temperature (°C)
    sound_level     : float  – sound level (dB)
    maintenance_days: int    – days since last maintenance

    Returns
    -------
    dict with keys:
        wheel_health         (int, 0-100)
        bearing_health       (int, 0-100)
        rake_health_score    (int, 0-100)
        failure_probability  (int, 0-100 %)
        status               (str)
    """

    # 1. Deterministic health scores
    wheel_health, bearing_health = _calculate_health(
        vibration_rms, temperature,
        sound_level, maintenance_days
    )

    # 2. Rake Health Score formula
    rake_health_score = round(
        0.5 * wheel_health + 0.5 * bearing_health
    )

    # 3. Status rules
    if rake_health_score > 80:
        status = "Healthy"
    elif rake_health_score >= 50:
        status = "Warning"
    else:
        status = "Maintenance Required"

    # 4. Failure probability from the trained XGBoost model
    failure_probability = 0
    model = _load_model()

    if model is not None:
        features = np.array([[
            vibration_rms,
            temperature,
            sound_level,
            maintenance_days
        ]])

        # predict_proba → [P(class 0), P(class 1)]
        failure_probability = round(
            model.predict_proba(features)[0][1] * 100
        )

    return {
        "wheel_health": wheel_health,
        "bearing_health": bearing_health,
        "rake_health_score": rake_health_score,
        "failure_probability": failure_probability,
        "status": status
    }
