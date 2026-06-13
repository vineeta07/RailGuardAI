"""
============================================================
RailGuard AI — Decision Engine API Router
============================================================
The Intelligent Rake Reallocation Engine.

For a given empty rake, this endpoint:
1. Finds nearby cargo options
2. Checks route congestion & track risk
3. Checks rake health (deprioritize if unhealthy)
4. Scores each option using the formula:
   FinalScore = (Revenue + RakeHealth + CargoAvailability)
              − (EmptyDistance + Congestion + WaitPenalty)
5. Ranks options and returns AI recommendation
============================================================
"""

import random
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional

from data_loader import (
    get_rake_by_id, get_available_cargo_for_city,
    get_routes, get_rakes, CITY_COORDS, CARGO_TYPES,
    routes_df
)

router = APIRouter(prefix="/api/decide", tags=["Decision Engine"])


class DecisionRequest(BaseModel):
    rake_id: str = Field(..., description="ID of the empty rake")


class DecisionResponse(BaseModel):
    rake_id: str
    rake_location: str
    rake_health: int
    health_status: str
    options: list
    recommendation: dict
    sustainability_impact: dict
    ai_explanation: str


@router.post("")
def make_decision(req: DecisionRequest):
    """
    Generate scored allocation options for an empty rake.

    The AI evaluates all nearby cargo, considers route
    congestion, track risk, rake health, and potential
    future cargo to produce a ranked recommendation.
    """

    rake = get_rake_by_id(req.rake_id)
    if not rake:
        raise HTTPException(
            status_code=404,
            detail=f"Rake {req.rake_id} not found"
        )

    location = rake["location"]
    health = rake["health_score"]

    # ── Health Check ───────────────────────────────────
    if health < 30:
        return {
            "rake_id": req.rake_id,
            "rake_location": location,
            "rake_health": health,
            "health_status": "CRITICAL — Maintenance Required",
            "options": [],
            "recommendation": {
                "action": "SEND_TO_MAINTENANCE",
                "message": (
                    f"Rake {req.rake_id} has a health score of {health}%. "
                    f"Deprioritized for cargo allocation. "
                    f"Recommend immediate maintenance review."
                ),
            },
            "sustainability_impact": {
                "potential_accident_prevented": True,
                "maintenance_cost_saved": "₹2-5 Lakh (early detection)",
            },
            "ai_explanation": (
                f"🔴 Rake {req.rake_id} health is critically low ({health}%). "
                f"The AI has deprioritized this rake for any cargo allocation "
                f"to prevent potential wheel/bearing failure during transit. "
                f"Sending for maintenance review."
            ),
        }

    health_status = (
        "Healthy" if health > 80
        else "Warning — Monitor" if health > 50
        else "Poor — Limited Allocation"
    )

    # ── Find Nearby Cargo ──────────────────────────────
    nearby_cargo = get_available_cargo_for_city(location)

    # ── Build Options ──────────────────────────────────
    options = []

    for cargo in nearby_cargo[:5]:  # Top 5 cargo options
        dest = cargo.get("Destination", "Unknown")
        revenue = cargo.get("Revenue", 0)
        tons = cargo.get("Tons", 0)
        cargo_type = cargo.get("Cargo_Type", "Unknown")

        # Find route data
        route_info = _find_route(location, dest)
        distance = route_info.get("distance", random.randint(200, 1800))
        travel_time = route_info.get("travel_time", round(distance / 70, 1))
        congestion = route_info.get("congestion", "Medium")
        risk_score = route_info.get("risk_score", random.uniform(0.1, 0.8))

        # ── Score Calculation ──────────────────────────
        revenue_score = min(100, (revenue / 8000))  # Normalize to 0-100
        health_score_norm = health  # Already 0-100
        cargo_avail_score = random.uniform(40, 95)  # Simulated availability

        empty_distance_penalty = min(50, (distance * 0.02))
        congestion_penalty = (
            0 if congestion == "Low"
            else 15 if congestion == "Medium"
            else 35
        )
        wait_penalty = 0  # No wait for immediate cargo

        final_score = round(
            (revenue_score + health_score_norm + cargo_avail_score)
            - (empty_distance_penalty + congestion_penalty + wait_penalty),
            1
        )

        options.append({
            "cargo_id": cargo.get("Cargo_ID"),
            "action": f"Load {cargo_type}",
            "cargo_type": cargo_type,
            "destination": dest,
            "tons": tons,
            "revenue": revenue,
            "revenue_display": f"₹{revenue/100000:.1f}L",
            "distance_km": distance,
            "travel_time_h": travel_time,
            "congestion": congestion,
            "track_risk": round(risk_score, 2),
            "cargo_availability": round(cargo_avail_score, 1),
            "final_score": final_score,
            "scores_breakdown": {
                "revenue_score": round(revenue_score, 1),
                "health_score": health_score_norm,
                "cargo_availability_score": round(cargo_avail_score, 1),
                "empty_distance_penalty": round(-empty_distance_penalty, 1),
                "congestion_penalty": -congestion_penalty,
                "wait_penalty": -wait_penalty,
            },
        })

    # ── Add "Wait" Option ──────────────────────────────
    wait_revenue = random.randint(500000, 900000)
    wait_hours = random.choice([6, 8, 12, 18, 24])
    wait_cargo_type = random.choice(["Fertilizer", "Container", "Steel"])
    wait_availability = round(random.uniform(60, 95), 1)

    wait_score = round(
        (min(100, wait_revenue / 8000) + health + wait_availability)
        - (0 + 0 + (wait_hours * 2)),  # Wait penalty proportional to hours
        1
    )

    options.append({
        "cargo_id": None,
        "action": f"Wait {wait_hours}h for {wait_cargo_type}",
        "cargo_type": wait_cargo_type,
        "destination": random.choice([c for c in CITY_COORDS if c != location]),
        "tons": random.randint(2000, 4500),
        "revenue": wait_revenue,
        "revenue_display": f"₹{wait_revenue/100000:.1f}L",
        "distance_km": 0,
        "travel_time_h": 0,
        "wait_hours": wait_hours,
        "congestion": "Low",
        "track_risk": round(random.uniform(0.1, 0.4), 2),
        "cargo_availability": wait_availability,
        "final_score": wait_score,
        "scores_breakdown": {
            "revenue_score": round(min(100, wait_revenue / 8000), 1),
            "health_score": health,
            "cargo_availability_score": wait_availability,
            "empty_distance_penalty": 0,
            "congestion_penalty": 0,
            "wait_penalty": round(-(wait_hours * 2), 1),
        },
    })

    # ── Sort by Final Score (highest first) ────────────
    options.sort(key=lambda x: x["final_score"], reverse=True)

    # ── Build Recommendation ───────────────────────────
    best = options[0]

    recommendation = {
        "action": best["action"],
        "final_score": best["final_score"],
        "revenue": best["revenue"],
        "revenue_display": best["revenue_display"],
        "destination": best["destination"],
        "cargo_type": best["cargo_type"],
    }

    # ── Sustainability Impact ──────────────────────────
    worst_option_distance = max(
        (o.get("distance_km", 0) for o in options), default=0
    )
    sustainability_impact = {
        "empty_distance_avoided_km": max(0, worst_option_distance - best.get("distance_km", 0)),
        "revenue_gained": best["revenue_display"],
        "co2_reduced_tons": round(
            max(0, worst_option_distance - best.get("distance_km", 0)) * 0.006, 1
        ),
    }

    # ── AI Explanation ─────────────────────────────────
    if "Wait" in best["action"]:
        ai_explanation = (
            f"🧠 AI Recommendation: WAIT {best.get('wait_hours', '?')} hours. "
            f"A {best['cargo_type']} shipment is expected with "
            f"{best['revenue_display']} revenue and {best['cargo_availability']}% "
            f"availability probability. This creates the highest value "
            f"(Score: {best['final_score']}) compared to loading "
            f"immediately."
        )
    else:
        ai_explanation = (
            f"🧠 AI Recommendation: {best['action']} → "
            f"{best['destination']}. Revenue: {best['revenue_display']}, "
            f"Travel: {best['travel_time_h']}h, Congestion: {best['congestion']}. "
            f"Score: {best['final_score']} — highest among "
            f"{len(options)} evaluated options."
        )

    return {
        "rake_id": req.rake_id,
        "rake_location": location,
        "rake_health": health,
        "health_status": health_status,
        "options": options,
        "recommendation": recommendation,
        "sustainability_impact": sustainability_impact,
        "ai_explanation": ai_explanation,
    }


def _find_route(source, destination):
    """Find route data between two cities."""
    if routes_df.empty:
        return {}

    match = routes_df[
        (routes_df["Source"] == source) &
        (routes_df["Destination"] == destination)
    ]

    if match.empty:
        # Try reverse
        match = routes_df[
            (routes_df["Source"] == destination) &
            (routes_df["Destination"] == source)
        ]

    if match.empty:
        return {}

    row = match.iloc[0]
    return {
        "distance": int(row.get("Distance_km", 500)),
        "travel_time": float(row.get("Travel_Time_h", 8)),
        "congestion": row.get("Congestion", "Medium"),
        "risk_score": float(row.get("Risk_Score", 0.3)),
    }
