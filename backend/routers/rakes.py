"""
RailGuard AI — Rakes API Router
Fleet management endpoints for the rake fleet.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
import models
import data_loader

router = APIRouter(prefix="/api/rakes", tags=["Rakes"])


@router.get("")
def list_rakes(
    status: Optional[str] = Query(None, description="Filter: loaded, empty, maintenance, in_transit"),
    location: Optional[str] = Query(None, description="Filter by city name"),
    db: Session = Depends(get_db)
):
    """List all rakes with optional filters."""
    query = db.query(models.Rake)
    if status:
        query = query.filter(models.Rake.status == status)
    if location:
        query = query.filter(models.Rake.location == location)
    
    rakes = query.all()
    return {
        "rakes": rakes,
        "total": len(rakes),
        "cities": list(data_loader.CITY_COORDS.keys()),
    }


@router.get("/{rake_id}")
def get_rake(rake_id: str, db: Session = Depends(get_db)):
    """Get details for a single rake."""
    rake = db.query(models.Rake).filter(models.Rake.rake_id == rake_id).first()
    if not rake:
        raise HTTPException(status_code=404, detail=f"Rake {rake_id} not found")
    return rake


@router.get("/stats/summary")
def rake_stats(db: Session = Depends(get_db)):
    """Get fleet-level statistics."""
    all_rakes = db.query(models.Rake).all()

    status_counts = {}
    for r in all_rakes:
        s = r.status
        status_counts[s] = status_counts.get(s, 0) + 1

    location_counts = {}
    for r in all_rakes:
        loc = r.location
        location_counts[loc] = location_counts.get(loc, 0) + 1

    health_scores = [r.health_score for r in all_rakes]
    avg_health = sum(health_scores) / len(health_scores) if health_scores else 0

    return {
        "total_rakes": len(all_rakes),
        "by_status": status_counts,
        "by_location": location_counts,
        "avg_health_score": round(avg_health, 1),
        "critical_rakes": len([r for r in all_rakes if r.health_score < 40]),
        "empty_rakes": status_counts.get("empty", 0),
    }
