"""
RailGuard AI — FastAPI Backend

Main application entry point.

Registers all API routers, configures CORS,
loads data at startup, and starts the simulation engine.

Start with:
    cd backend
    python -m uvicorn app:app --reload --port 8000
    → Swagger UI at http://localhost:8000/docs
"""

import uvicorn
import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# Load .env
load_dotenv()

# Project Root for ML Model Imports 

import sys

PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)
sys.path.append(PROJECT_ROOT)

from model.predict import predict_allocation
from model.predict_health import predict_health
from model.predict_track import predict_track

# Import Routers 

from routers.rakes import router as rakes_router
from routers.cargo import router as cargo_router
from routers.routes import router as routes_router
from routers.track_health import router as track_health_router
from routers.decision_engine import router as decision_router
from routers.digital_twin import router as digital_twin_router
from routers.forward_vision import router as forward_vision_router

# Import Data & Simulation

from data_loader import load_all_data
from simulation import start_simulation


# Create App 

app = FastAPI(
    title="RailGuard AI API",
    description=(
        "AI-Powered Railway Safety, Predictive Maintenance "
        "& Operational Intelligence Platform"
    ),
    version="2.0.0",
)


# ── CORS Middleware ────────────────────────────────────────

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        "http://localhost:5173",
        "http://localhost:3000",
        "http://localhost:5174",
        # Add your Vercel URL here when deployed:
        # "https://railguard-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Register Routers ──────────────────────────────────────

app.include_router(rakes_router)
app.include_router(cargo_router)
app.include_router(routes_router)
app.include_router(track_health_router)
app.include_router(decision_router)
app.include_router(digital_twin_router)
app.include_router(forward_vision_router)


# ── Startup Event ──────────────────────────────────────────

@app.on_event("startup")
def on_startup():
    """Load data and start simulation when server boots."""
    print("\n" + "=" * 55)
    print("  RailGuard AI — Backend Starting")
    print("=" * 55 + "\n")

    # Load CSV datasets into memory
    load_all_data()

    # Start background simulation
    start_simulation()

    print("\n" + "=" * 55)
    print("  [SUCCESS] Backend ready!")
    print(f"  [INFO] CORS enabled for: {FRONTEND_URL}")
    print("  [INFO] Swagger UI: http://localhost:8000/docs")
    print("=" * 55 + "\n")


# ── Root Endpoint ──────────────────────────────────────────

@app.get("/")
def home():
    return {
        "message": "RailGuard AI API Running",
        "version": "2.0.0",
        "modules": [
            "Intelligent Rake Reallocation Engine",
            "Track Health Monitoring",
            "Rolling Stock Health Monitoring",
            "Forward Vision Safety System",
            "Digital Twin",
        ],
        "docs": "/docs",
    }


# ════════════════════════════════════════════════════════════
# MODULE 1 — CARGO REVENUE PREDICTION (Existing)
# ════════════════════════════════════════════════════════════

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


# ════════════════════════════════════════════════════════════
# MODULE 3 — ROLLING STOCK HEALTH MONITORING (Existing)
# ════════════════════════════════════════════════════════════

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
