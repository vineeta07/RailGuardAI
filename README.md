# 🚆 RailGuard AI
### AI-Powered Railway Safety, Predictive Maintenance & Operational Intelligence Platform

RailGuard AI is an intelligent railway monitoring and decision-support platform that combines Machine Learning, Computer Vision, IoT, and Real-Time Analytics to improve railway safety, optimize freight operations, and enable predictive maintenance.

The platform consists of four core AI modules:

- Intelligent Rake Reallocation Engine
- Track Health Monitoring
- Rolling Stock Health Monitoring
- Forward Vision Safety System

---

# Problem Statement

Railway operations face multiple challenges:

- Inefficient empty rake allocation
- Unexpected track failures
- Wheel and bearing breakdowns
- Collisions due to obstacles on tracks
- High maintenance costs
- Freight revenue loss
- Lack of predictive insights

RailGuard AI addresses these challenges using data-driven intelligence and predictive analytics.

---

# System Architecture

```text
Track Sensors
+
Rolling Stock Sensors
+
Forward Vision Cameras
+
GPS Tracking
          ↓
   Data Collection Layer
          ↓
        Backend
          ↓
      AI Models
          ↓
   Decision Engine
          ↓
Dashboard & Visualization
          ↓
 Alerts & Recommendations
```

---

# Module 1: Intelligent Rake Reallocation Engine

## Objective

Optimize empty rake allocation to maximize revenue, reduce idle time, and minimize empty movement.

## Model

**XGBoost Regressor**

## Inputs

- Rake Location
- Capacity
- Health Score
- Cargo Requests
- Route Information
- Distance
- Congestion Level
- Risk Score

## Outputs

- Cargo Availability Probability
- Expected Revenue
- Expected Wait Time
- Best Allocation Recommendation

## Example

### Input

```json
{
  "Cargo_Type": "Coal",
  "Source": "Mumbai",
  "Destination": "Delhi",
  "Tons": 4000,
  "Distance_km": 1200,
  "Travel_Time_h": 20,
  "Congestion": "Medium",
  "Risk_Score": 25
}
```

### Output

```json
{
  "predicted_revenue": 452000
}
```

## Model Performance

- R² Score: **0.9753**
- MAE: **₹21,863**

## Impact

- Improved fleet utilization
- Higher freight revenue
- Reduced empty travel
- Lower carbon emissions

---

# Module 2: Track Health Monitoring

## Objective

Detect potential track defects using vibration data collected from multiple trains.

## Model

**XGBoost Classifier**

## Inputs

- Vibration Severity
- GPS Location
- Historical Defect Records
- Weather Conditions
- Train Consensus

## Outputs

- Track Risk Score
- Inspection Recommendations
- High-Risk Segment Alerts

## Workflow

```text
Train A detects anomaly
          ↓
GPS location logged

Train B detects anomaly
          ↓
Same location confirmed

Train C detects anomaly
          ↓
Same location confirmed
          ↓
Track Risk Model
          ↓
Track Risk Score
```

## Impact

- Early fault detection
- Predictive maintenance
- Reduced false positives
- Improved railway safety

---

# Module 3: Rolling Stock Health Monitoring

## Objective

Predict wheel and bearing failures before they cause operational issues.

## Model

**XGBoost Classifier**

## Inputs

- Vibration Data
- Temperature Data
- Acoustic Data
- Maintenance History

## Outputs

- Wheel Health Score
- Bearing Health Score
- Rake Health Score
- Failure Probability
- Maintenance Recommendation

## Example

### Input

```json
{
  "vibration_rms": 0.25,
  "temperature": 40,
  "sound_level": 50,
  "maintenance_days": 10
}
```

### Output

```json
{
  "wheel_health": 83,
  "bearing_health": 86,
  "rake_health_score": 84,
  "failure_probability": 0,
  "status": "Healthy"
}
```

## Model Performance

- Accuracy: **99.00%**
- Precision: **98.87%**
- Recall: **98.31%**
- F1 Score: **98.59%**

## Impact

- Reduced breakdowns
- Lower maintenance costs
- Increased fleet availability
- Improved operational reliability

---

# Module 4: Forward Vision Safety System

## Objective

Detect obstacles ahead of the locomotive under various weather and visibility conditions.

## Model

**YOLOv11**

## Inputs

- RGB Camera Feed
- Thermal Camera Feed

## Outputs

- Human Detection
- Animal Detection
- Vehicle Detection
- Obstacle Alerts
- Risk Assessment

## Workflow

```text
Camera Feed
      ↓
 YOLOv11
      ↓
Object Detection
      ↓
Risk Assessment
      ↓
Alert Generation
```

## Detectable Objects

- Humans
- Animals
- Cars
- Trucks
- Buses
- Motorcycles
- Other obstacles

## Impact

- Reduced collision risk
- Enhanced night-time visibility
- Improved operational safety

---

# Technology Stack

## Machine Learning

- XGBoost
- Scikit-Learn
- Pandas
- NumPy

## Computer Vision

- YOLOv11
- OpenCV

## Backend

- FastAPI
- Uvicorn

## IoT Hardware

### Track Monitoring

- ESP32
- MPU6050 Accelerometer
- GPS Module (NEO-6M)

### Rolling Stock Monitoring

- ESP32
- MPU6050
- DS18B20 Temperature Sensor
- MAX9814 Microphone

### Forward Vision System

- Raspberry Pi 5 / Jetson Nano
- RGB Camera
- Thermal Camera

## Communication

- MQTT
- REST APIs

---

# Dashboard Features

## Live Railway Map

- Real-Time Rake Tracking
- Route Monitoring
- Track Risk Visualization

## Track Health Layer

- Track Risk Score
- High-Risk Segments
- Inspection Alerts

## Rolling Stock Health Layer

- Wheel Health
- Bearing Health
- Rake Health Score
- Maintenance Alerts

## Intelligent Rake Reallocation Layer

- Recommended Cargo
- Revenue Prediction
- Empty Distance Saved
- AI Decision Explanation

## Forward Vision Layer

- Live Camera Feed
- Obstacle Detection Alerts
- Risk Notifications

## Sustainability Metrics

- Revenue Saved
- Empty Distance Avoided
- CO₂ Emissions Reduced

---

# Project Structure

```text
Far_away/
│
├── backend/
│   ├── app.py
│   └── requirements.txt
│
├── data/
│   ├── cargo.csv
│   ├── routes.csv
│   ├── health.csv
│   └── rolling_stock_health.csv
│
├── model/
│   ├── train_model.py
│   ├── predict.py
│   ├── train_health_model.py
│   ├── predict_health.py
│   ├── model.pkl
│   ├── encoders.pkl
│   └── rolling_stock_health_model.pkl
│
└── README.md
```

---

# Future Enhancements

- Railway Digital Twin
- Real-Time GPS Integration
- Dynamic Route Optimization
- Thermal Vision Integration
- ETA Prediction
- Affected Rake Analysis
- Predictive Congestion Forecasting
- Edge AI Deployment

---


# Vision

**Building a safer, smarter, and more efficient railway ecosystem through AI, IoT, and predictive intelligence.**
