from sqlalchemy import Column, Integer, String, Float, DateTime, JSON
from database import Base
import datetime

class Rake(Base):
    __tablename__ = "rakes"

    id = Column(Integer, primary_key=True, index=True)
    rake_id = Column(String, unique=True, index=True)
    rake_type = Column(String)
    location = Column(String)
    lat = Column(Float)
    lng = Column(Float)
    capacity_tons = Column(Integer)
    health_score = Column(Float)
    days_since_maintenance = Column(Integer)
    status = Column(String)
    current_cargo = Column(String, nullable=True)

class Cargo(Base):
    __tablename__ = "cargo"

    id = Column(Integer, primary_key=True, index=True)
    Cargo_ID = Column(String, unique=True, index=True)
    Cargo_Type = Column(String)
    Source = Column(String)
    Destination = Column(String)
    Tons = Column(Float)
    Revenue = Column(Float)
    Distance_km = Column(Float)
    Travel_Time_h = Column(Float)

class Route(Base):
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    Source = Column(String)
    Destination = Column(String)
    Distance_km = Column(Float)
    Travel_Time_h = Column(Float)
    Risk_Score = Column(Float)
    Congestion = Column(String)

class TrackSegment(Base):
    __tablename__ = "track_segments"

    id = Column(Integer, primary_key=True, index=True)
    segment_id = Column(String, unique=True, index=True)
    source = Column(String)
    destination = Column(String)
    source_lat = Column(Float)
    source_lng = Column(Float)
    dest_lat = Column(Float)
    dest_lng = Column(Float)
    distance_km = Column(Integer)
    risk_score = Column(Float)
    risk_level = Column(String)
    congestion = Column(String)
    last_inspection = Column(String)

class Sustainability(Base):
    __tablename__ = "sustainability"

    id = Column(Integer, primary_key=True, index=True)
    revenue_saved = Column(Integer, default=0)
    empty_km_avoided = Column(Integer, default=0)
    co2_reduced = Column(Float, default=0.0)
    decisions_made = Column(Integer, default=0)
    alerts_generated = Column(Integer, default=0)
    rakes_rerouted = Column(Integer, default=0)
    start_time = Column(String, default=lambda: datetime.datetime.now().isoformat())

class EventLog(Base):
    __tablename__ = "event_logs"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String)
    message = Column(String)
    severity = Column(String)
    timestamp = Column(String)
    data = Column(JSON, default={})

class ForwardVisionAlert(Base):
    __tablename__ = "forward_vision_alerts"

    id = Column(Integer, primary_key=True, index=True)
    object_type = Column(String)
    confidence = Column(Float)
    risk_level = Column(String)
    distance_m = Column(Integer)
    rake_id = Column(String)
    location = Column(String)
    timestamp = Column(String)
    message = Column(String)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Integer, default=1)

