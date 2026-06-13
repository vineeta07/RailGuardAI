import os
import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from xgboost import XGBClassifier

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_PATH = os.path.join(BASE_DIR, "data", "track_health.csv")
MODEL_PATH = os.path.join(BASE_DIR, "model", "track_health_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "model", "track_label_encoder.pkl")

def train_model():
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    
    FEATURE_COLUMNS = [
        "Vibration_Mean",
        "Vibration_RMS",
        "Consensus_Count",
        "Historical_Defects",
        "Track_Age_Years",
        "Rainfall"
    ]
    TARGET_COLUMN = "Risk_Label"
    
    X = df[FEATURE_COLUMNS]
    y = df[TARGET_COLUMN]
    
    target_encoder = LabelEncoder()
    y_encoded = target_encoder.fit_transform(y)
    
    # Save encoder
    joblib.dump(target_encoder, ENCODER_PATH)
    print(f"Encoder saved to: {ENCODER_PATH}")
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.20, random_state=42, stratify=y_encoded
    )
    
    print("Training XGBoost classifier...")
    model = XGBClassifier(
        objective="multi:softprob",
        num_class=4,
        n_estimators=350,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.85,
        colsample_bytree=0.85,
        min_child_weight=3,
        gamma=0.2,
        reg_lambda=2,
        random_state=42,
        eval_metric="mlogloss"
    )
    
    model.fit(X_train, y_train)
    
    print("Evaluating model...")
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Accuracy: {accuracy:.4f}")
    
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, target_names=target_encoder.classes_))
    
    print("\nConfusion Matrix:")
    print(confusion_matrix(y_test, y_pred))
    
    joblib.dump(model, MODEL_PATH)
    print(f"\nModel saved to: {MODEL_PATH}")
    print("Training complete.")

if __name__ == "__main__":
    train_model()
