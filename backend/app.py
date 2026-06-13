import uvicorn
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
import os
import sys

PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

sys.path.append(PROJECT_ROOT)

from model.predict import predict_allocation
from model.predict_health import predict_health
from model.predict_track import predict_track

app = FastAPI(
    title="RailGuard AI Prediction API",
    description="Predict railway cargo revenue using trained XGBoost model",
    version="1.0.0"
)

class AllocationRequest(BaseModel):
    Cargo_Type: str = Field(
        ...,
        description="Cargo type (Coal, Steel, Cement, Fertilizer, Limestone, Container)"
    )

    Source: str = Field(
        ...,
        description="Source city"
    )

    Destination: str = Field(
        ...,
        description="Destination city"
    )

    Tons: float = Field(
        ...,
        gt=0,
        description="Cargo weight in tons"
    )

    Distance_km: float = Field(
        ...,
        gt=0,
        description="Route distance in kilometers"
    )

    Travel_Time_h: float = Field(
        ...,
        gt=0,
        description="Travel time in hours"
    )

    Congestion: str = Field(
        ...,
        description="Congestion level (Low, Medium, High)"
    )

    Risk_Score: float = Field(
        ...,
        ge=0,
        le=1,
        description="Route risk score between 0 and 1"
    )

@app.get("/")
def home():
    return {
        "message": "RailGuard AI API Running"
    }

@app.post("/predict")
def predict(req: AllocationRequest):

    try:

        features = req.model_dump()

        prediction = predict_allocation(features)

        return {
            "predicted_revenue": round(prediction, 2)
        }

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

# MODULE 3 – ROLLING STOCK HEALTH MONITORING

class HealthRequest(BaseModel):
    vibration_rms: float = Field(
        ...,
        description="RMS vibration reading"
    )

    temperature: float = Field(
        ...,
        description="Sensor temperature in °C"
    )

    sound_level: float = Field(
        ...,
        description="Sound level in dB"
    )

    maintenance_days: int = Field(
        ...,
        ge=0,
        description="Days since last maintenance"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "vibration_rms": 0.35,
                "temperature": 55,
                "sound_level": 60,
                "maintenance_days": 30
            }
        }
    }


@app.post("/predict-health")
def predict_health_endpoint(req: HealthRequest):
    """
    Predict wheel & bearing health, rake health score,
    failure probability, and overall status from sensor data.
    """

    try:

        result = predict_health(
            vibration_rms=req.vibration_rms,
            temperature=req.temperature,
            sound_level=req.sound_level,
            maintenance_days=req.maintenance_days,
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# MODULE 2 – TRACK HEALTH MONITORING

class TrackRequest(BaseModel):
    vibration_mean: float = Field(..., description="Mean vibration reading")
    vibration_rms: float = Field(..., description="RMS vibration reading")
    consensus_count: int = Field(..., description="Number of consensus reports")
    historical_defects: int = Field(..., description="Number of historical defects")
    track_age_years: int = Field(..., description="Age of the track in years")
    rainfall: float = Field(..., description="Rainfall amount")

@app.post("/predict-track")
def predict_track_endpoint(req: TrackRequest):
    """
    Predict track health risk label and probability.
    """
    try:
        result = predict_track(
            vibration_mean=req.vibration_mean,
            vibration_rms=req.vibration_rms,
            consensus_count=req.consensus_count,
            historical_defects=req.historical_defects,
            track_age_years=req.track_age_years,
            rainfall=req.rainfall
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )