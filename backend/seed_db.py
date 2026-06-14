import os
import sys
import random

# Ensure backend directory is in path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, SessionLocal
import models
import data_loader

def seed_database():
    print("Seeding database...")
    # Create all tables
    models.Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Check if we already have data
    if db.query(models.Rake).first():
        print("Database already seeded. Skipping.")
        db.close()
        return

    print("Loading data from CSVs...")
    data_loader.load_all_data()

    # 1. Seed Cargo
    print(f"Seeding {len(data_loader.cargo_df)} Cargo records...")
    for _, row in data_loader.cargo_df.iterrows():
        distance = random.randint(100, 2000)
        cargo = models.Cargo(
            Cargo_ID=row["Cargo_ID"],
            Cargo_Type=row["Cargo_Type"],
            Source=row["Source"],
            Destination=row["Destination"],
            Tons=row["Tons"],
            Revenue=row["Revenue"],
            Distance_km=distance,
            Travel_Time_h=distance / 50.0
        )
        db.add(cargo)

    # 2. Seed Routes
    print(f"Seeding {len(data_loader.routes_df)} Routes...")
    for _, row in data_loader.routes_df.iterrows():
        route = models.Route(
            Source=row["Source"],
            Destination=row["Destination"],
            Distance_km=row["Distance_km"],
            Travel_Time_h=row["Travel_Time_h"],
            Risk_Score=row["Risk_Score"],
            Congestion=row["Congestion"]
        )
        db.add(route)

    # 3. Seed Rakes (using the generated list)
    print(f"Seeding {len(data_loader.rakes)} Rakes...")
    for r in data_loader.rakes:
        rake = models.Rake(
            rake_id=r["rake_id"],
            rake_type=r["rake_type"],
            location=r["location"],
            lat=r["lat"],
            lng=r["lng"],
            capacity_tons=r["capacity_tons"],
            health_score=r["health_score"],
            days_since_maintenance=r["days_since_maintenance"],
            status=r["status"],
            current_cargo=r["current_cargo"]
        )
        db.add(rake)

    # 4. Seed Track Segments (using the generated list)
    print(f"Seeding {len(data_loader.track_segments)} Track Segments...")
    for t in data_loader.track_segments:
        track = models.TrackSegment(
            segment_id=t["segment_id"],
            source=t["source"],
            destination=t["destination"],
            source_lat=t["source_lat"],
            source_lng=t["source_lng"],
            dest_lat=t["dest_lat"],
            dest_lng=t["dest_lng"],
            distance_km=t["distance_km"],
            risk_score=t["risk_score"],
            risk_level=t["risk_level"],
            congestion=t["congestion"],
            last_inspection=t["last_inspection"]
        )
        db.add(track)

    # 5. Seed Sustainability
    print("Seeding initial Sustainability record...")
    sust = models.Sustainability(
        revenue_saved=12450000,
        empty_km_avoided=8520,
        co2_reduced=48.7,
        decisions_made=142,
        alerts_generated=38,
        rakes_rerouted=67
    )
    db.add(sust)

    db.commit()
    db.close()
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
