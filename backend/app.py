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

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000
    )