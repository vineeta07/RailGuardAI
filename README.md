# RailGuard AI

### AI-Powered Railway Safety, Predictive Maintenance & Operational Intelligence Platform

RailGuard AI is an intelligent railway monitoring and decision-support platform that combines Machine Learning, Computer Vision, IoT, and Real-Time Analytics to improve railway safety, optimize freight operations, and enable predictive maintenance.

The platform consists of four core AI modules:
* Intelligent Rake Reallocation Engine
* Track Health Monitoring
* Rolling Stock Health Monitoring
* Forward Vision Safety System

---

## Problem Statement

Railway operations face multiple challenges:
* Inefficient empty rake allocation
* Unexpected track failures
* Wheel and bearing breakdowns
* Collisions due to obstacles on tracks
* High maintenance costs
* Freight revenue loss
* Lack of predictive insights

**RailGuard AI addresses these challenges using data-driven intelligence and predictive analytics.**

---

##  System Architecture

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

## Quick Start & Setup Guide

Follow these steps to run the complete RailGuard AI stack on your local machine.

### 1. Prerequisites
- **Node.js** (v18 or higher)
- **Python** (v3.9 or higher)
- **PostgreSQL** (running locally or via Docker)

### 2. Database Setup

Create a local PostgreSQL database for the application to connect to.
```bash
# In your terminal (assuming you have Postgres installed):
psql -U postgres
CREATE DATABASE railguard_db;
```

### 3. Backend Setup (FastAPI + Machine Learning)

Open a terminal and navigate to the `backend` folder.

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv

# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment variables
# Create a .env file based on the provided configuration
echo "FRONTEND_URL=http://localhost:5173" > .env
echo "DATABASE_URL=postgresql://postgres:vineeta-007@localhost:5432/railguard_db" >> .env
echo "JWT_SECRET_KEY=your_super_secret_key_here" >> .env

# 5. Train the ML Models (required before starting the server)
cd ../model
python train_model.py
python train_health_model.py
python train_track_model.py
cd ../backend

# 6. Start the FastAPI Server (This will automatically seed the database on first run)
python -m uvicorn app:app --reload --port 8000
```
> **Note:** The backend will be running at `http://localhost:8000`. You can view the API documentation at `http://localhost:8000/docs`.

---

### 4. Frontend Setup (React + Vite PWA)

Open a new terminal window and navigate to the `frontend` folder.

```bash
# 1. Navigate to frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment variables
echo "VITE_API_URL=http://localhost:8000" > .env

# 4. Start the development server
npm run dev
```
> **Note:** The frontend will be running at `http://localhost:5173`. Open this URL in your browser to access the RailGuard AI dashboard.

---

## Core Architecture

The platform consists of four core AI modules:

### Module 1: Intelligent Rake Reallocation Engine
**Objective:** Optimize empty rake allocation to maximize revenue, reduce idle time, and minimize empty movement.
- **Model:** XGBoost Regressor
- **Impact:** Improved fleet utilization, Higher freight revenue, Reduced empty travel.

### Module 2: Track Health Monitoring
**Objective:** Detect potential track defects using vibration data collected from multiple trains.
- **Model:** XGBoost Classifier
- **Impact:** Early fault detection, Predictive maintenance, Reduced false positives.

### Module 3: Rolling Stock Health Monitoring
**Objective:** Predict wheel and bearing failures before they cause operational issues.
- **Model:** XGBoost Classifier
- **Impact:** Reduced breakdowns, Lower maintenance costs, Increased fleet availability.

### Module 4: Forward Vision Safety System
**Objective:** Detect obstacles ahead of the locomotive under various weather and visibility conditions.
- **Model:** YOLOv11
- **Impact:** Reduced collision risk, Enhanced night-time visibility.

---

## Technology Stack

**Frontend**
- React 19 + Vite
- Framer Motion (Animations)
- Recharts (Data Visualization)
- Vite PWA Plugin (Progressive Web App support)

**Backend & Machine Learning**
- FastAPI + Uvicorn
- PostgreSQL + SQLAlchemy
- XGBoost, Scikit-Learn, Pandas
- YOLOv11 & OpenCV (Computer Vision)

**IoT Hardware (Simulated/Supported)**
- ESP32 + MPU6050 Accelerometer
- Raspberry Pi 5 + RGB/Thermal Cameras

---

## Native Mobile Application

RailGuard AI is engineered as a fully cross-platform application. Using **Capacitor**, the frontend can be natively compiled and deployed to both Android and iOS devices.

1. Install Capacitor dependencies (already included in `package.json`).
2. Sync the web assets to the native Android/iOS projects:
   ```bash
   npx cap sync
   ```
3. Run natively on your device or emulator:
   ```bash
   npx cap run android
   # or
   npx cap run ios
   ```

*(The application also supports standard PWA installation directly from mobile browsers).*

---

## Future Enhancements
- Full Railway Digital Twin Implementation
- Real-Time GPS Integration
- Dynamic Route Optimization
- Thermal Vision Integration
- Predictive Congestion Forecasting
- Edge AI Deployment

---
*Building a safer, smarter, and more efficient railway ecosystem through AI, IoT, and predictive intelligence.*
