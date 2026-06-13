"""
RailGuard AI — Cargo API Router
Freight cargo data and statistics endpoints.
"""

from fastapi import APIRouter, Query
from typing import Optional

from data_loader import get_cargo, get_cargo_stats, CARGO_TYPES, CITIES

router = APIRouter(prefix="/api/cargo", tags=["Cargo"])


@router.get("")
def list_cargo(
    source: Optional[str] = Query(None, description="Filter by source city"),
    destination: Optional[str] = Query(None, description="Filter by destination city"),
    cargo_type: Optional[str] = Query(None, description="Filter by cargo type"),
    limit: int = Query(100, ge=1, le=500),
):
    """List available cargo requests with optional filters."""
    records = get_cargo(
        source=source,
        destination=destination,
        cargo_type=cargo_type,
        limit=limit,
    )
    return {
        "cargo": records,
        "total": len(records),
        "filters": {
            "cargo_types": CARGO_TYPES,
            "cities": CITIES,
        },
    }


@router.get("/stats")
def cargo_statistics():
    """Get cargo distribution statistics."""
    return get_cargo_stats()
