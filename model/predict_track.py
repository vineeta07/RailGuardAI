import os
import joblib
import numpy as np

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(BASE_DIR, "model", "track_health_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "model", "track_label_encoder.pkl")

_model = None
_encoder = None

def _load_artifacts():
    global _model, _encoder
    if _model is None or _encoder is None:
        try:
            _model = joblib.load(MODEL_PATH)
            _encoder = joblib.load(ENCODER_PATH)
        except FileNotFoundError:
            print(f"[WARNING] Model or encoder not found. Run model/train_track_model.py first.")
    return _model, _encoder

def predict_track(vibration_mean: float, vibration_rms: float, consensus_count: int,
                  historical_defects: int, track_age_years: int, rainfall: float):
    """
    Predict track risk label and probability.
    """
    model, encoder = _load_artifacts()
    if model is None or encoder is None:
        return {
            "risk_label": "Unknown",
            "risk_probability": 0,
            "inspection_required": False
        }
        
    features = np.array([[
        vibration_mean,
        vibration_rms,
        consensus_count,
        historical_defects,
        track_age_years,
        rainfall
    ]])
    
    # Get probabilities for all classes
    probs = model.predict_proba(features)[0]
    
    # Get max probability and its corresponding class index
    max_prob_idx = np.argmax(probs)
    max_prob = probs[max_prob_idx]
    
    # Map back to string label
    predicted_label = encoder.inverse_transform([max_prob_idx])[0]
    
    inspection_required = True if predicted_label in ["High", "Critical"] else False
    
    return {
        "risk_label": predicted_label,
        "risk_probability": round(max_prob * 100),
        "inspection_required": inspection_required
    }
