// ────────────────────────────────────────────────────────
// RailGuard AI — Mock Data (Hackathon Wi-Fi Fallback)
// ────────────────────────────────────────────────────────
// Hardcoded realistic data so dashboards render perfectly
// even when the backend is unreachable.
// ────────────────────────────────────────────────────────

import { CITY_COORDS } from '../utils/constants';

const cities = Object.keys(CITY_COORDS);

function rng(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ── Rakes ─────────────────────────────────────────────────
const mockRakes = Array.from({ length: 20 }, (_, i) => {
  const city = cities[i % cities.length];
  const health = rng(25, 98);
  const status = health < 40 ? 'maintenance' : ['loaded', 'empty', 'in_transit'][i % 3];
  return {
    rake_id: `RK-${String(i + 1).padStart(3, '0')}`,
    rake_type: ['BOXN', 'BCNA', 'BTPN', 'BOBR', 'BOST'][i % 5],
    location: city,
    lat: CITY_COORDS[city].lat + (Math.random() - 0.5) * 0.4,
    lng: CITY_COORDS[city].lng + (Math.random() - 0.5) * 0.4,
    capacity_tons: [3200, 3500, 3800, 4000, 4200][i % 5],
    health_score: health,
    days_since_maintenance: rng(5, 60),
    status,
    current_cargo: status === 'empty' || status === 'maintenance'
      ? null : ['Coal', 'Steel', 'Cement', 'Fertilizer', 'Limestone', 'Container'][i % 6],
  };
});

// ── Cargo ─────────────────────────────────────────────────
const cargoTypes = ['Coal', 'Steel', 'Cement', 'Fertilizer', 'Limestone', 'Container'];
const mockCargo = Array.from({ length: 50 }, (_, i) => ({
  Cargo_ID: `CG-${String(i + 1).padStart(4, '0')}`,
  Cargo_Type: cargoTypes[i % 6],
  Source: cities[i % cities.length],
  Destination: cities[(i + 3) % cities.length],
  Tons: rng(1500, 4500),
  Revenue: rng(200000, 800000),
  Distance_km: rng(200, 2000),
  Travel_Time_h: rng(4, 36),
}));

// ── Track Segments ────────────────────────────────────────
const mockTrackSegments = [
  { segment_id: 'TRK-001', source: 'Delhi', destination: 'Mumbai', risk_score: 0.82, risk_level: 'HIGH', congestion: 'High', distance_km: 1400 },
  { segment_id: 'TRK-002', source: 'Delhi', destination: 'Jaipur', risk_score: 0.45, risk_level: 'MEDIUM', congestion: 'Medium', distance_km: 280 },
  { segment_id: 'TRK-003', source: 'Mumbai', destination: 'Ahmedabad', risk_score: 0.31, risk_level: 'LOW', congestion: 'Low', distance_km: 530 },
  { segment_id: 'TRK-004', source: 'Kolkata', destination: 'Chennai', risk_score: 0.88, risk_level: 'HIGH', congestion: 'High', distance_km: 1660 },
  { segment_id: 'TRK-005', source: 'Delhi', destination: 'Kolkata', risk_score: 0.65, risk_level: 'MEDIUM', congestion: 'Medium', distance_km: 1450 },
  { segment_id: 'TRK-006', source: 'Jaipur', destination: 'Ahmedabad', risk_score: 0.72, risk_level: 'HIGH', congestion: 'Medium', distance_km: 660 },
  { segment_id: 'TRK-007', source: 'Chennai', destination: 'Bangalore', risk_score: 0.22, risk_level: 'LOW', congestion: 'Low', distance_km: 350 },
  { segment_id: 'TRK-008', source: 'Surat', destination: 'Mumbai', risk_score: 0.55, risk_level: 'MEDIUM', congestion: 'Medium', distance_km: 280 },
].map(s => ({
  ...s,
  source_lat: CITY_COORDS[s.source]?.lat || 20,
  source_lng: CITY_COORDS[s.source]?.lng || 78,
  dest_lat: CITY_COORDS[s.destination]?.lat || 20,
  dest_lng: CITY_COORDS[s.destination]?.lng || 78,
  last_inspection: '2026-06-10',
}));

// ── Forward Vision Alerts ─────────────────────────────────
const mockVisionAlerts = [
  { id: 1, object: 'cow', confidence: 0.94, risk_level: 'HIGH', distance_m: 350, rake_id: 'RK-003', location: 'Jaipur', timestamp: new Date().toISOString(), message: '⚠ HIGH RISK: COW detected 350m ahead of RK-003' },
  { id: 2, object: 'person', confidence: 0.91, risk_level: 'HIGH', distance_m: 200, rake_id: 'RK-007', location: 'Delhi', timestamp: new Date().toISOString(), message: '⚠ HIGH RISK: PERSON detected 200m ahead of RK-007' },
  { id: 3, object: 'truck', confidence: 0.87, risk_level: 'MEDIUM', distance_m: 500, rake_id: 'RK-012', location: 'Mumbai', timestamp: new Date().toISOString(), message: '⚡ MEDIUM RISK: TRUCK detected 500m ahead of RK-012' },
  { id: 4, object: 'dog', confidence: 0.82, risk_level: 'HIGH', distance_m: 280, rake_id: 'RK-005', location: 'Chennai', timestamp: new Date().toISOString(), message: '⚠ HIGH RISK: DOG detected 280m ahead of RK-005' },
  { id: 5, object: 'bicycle', confidence: 0.78, risk_level: 'LOW', distance_m: 600, rake_id: 'RK-001', location: 'Kolkata', timestamp: new Date().toISOString(), message: 'ℹ LOW RISK: BICYCLE detected 600m ahead of RK-001' },
  { id: 6, object: 'car', confidence: 0.89, risk_level: 'MEDIUM', distance_m: 400, rake_id: 'RK-015', location: 'Ahmedabad', timestamp: new Date().toISOString(), message: '⚡ MEDIUM RISK: CAR detected 400m ahead of RK-015' },
  { id: 7, object: 'horse', confidence: 0.92, risk_level: 'HIGH', distance_m: 180, rake_id: 'RK-009', location: 'Lucknow', timestamp: new Date().toISOString(), message: '⚠ HIGH RISK: HORSE detected 180m ahead of RK-009' },
  { id: 8, object: 'motorcycle', confidence: 0.85, risk_level: 'MEDIUM', distance_m: 320, rake_id: 'RK-018', location: 'Surat', timestamp: new Date().toISOString(), message: '⚡ MEDIUM RISK: MOTORCYCLE detected 320m ahead of RK-018' },
  { id: 9, object: 'bird', confidence: 0.72, risk_level: 'LOW', distance_m: 700, rake_id: 'RK-002', location: 'Bangalore', timestamp: new Date().toISOString(), message: 'ℹ LOW RISK: BIRD detected 700m ahead of RK-002' },
  { id: 10, object: 'person', confidence: 0.96, risk_level: 'HIGH', distance_m: 150, rake_id: 'RK-011', location: 'Jharkhand', timestamp: new Date().toISOString(), message: '⚠ HIGH RISK: PERSON detected 150m ahead of RK-011' },
];

// ── Sustainability ────────────────────────────────────────
const mockSustainability = {
  revenue_saved: 12450000,
  empty_km_avoided: 8520,
  co2_reduced: 48.7,
  decisions_made: 142,
  alerts_generated: 38,
  rakes_rerouted: 67,
  start_time: new Date(Date.now() - 3600000).toISOString(),
};

// ── Recent Events ─────────────────────────────────────────
const mockEvents = [
  { id: 1, type: 'rake_empty', message: 'Rake RK-003 completed delivery at Mumbai — now empty', severity: 'warning', timestamp: new Date().toISOString() },
  { id: 2, type: 'track_alert', message: '⚠ Track Risk Alert: Delhi → Mumbai — Risk Score: 85%', severity: 'critical', timestamp: new Date().toISOString() },
  { id: 3, type: 'vision_alert', message: '⚠ HIGH RISK: COW detected 350m ahead of RK-003', severity: 'critical', timestamp: new Date().toISOString() },
  { id: 4, type: 'rake_empty', message: 'Rake RK-012 completed delivery at Kolkata — now empty', severity: 'warning', timestamp: new Date().toISOString() },
  { id: 5, type: 'system', message: '✅ AI Decision: RK-003 allocated to Steel shipment → Delhi', severity: 'info', timestamp: new Date().toISOString() },
];

// ── Decision Engine Sample ────────────────────────────────
const mockDecision = {
  rake_id: 'RK-003',
  rake_location: 'Mumbai',
  rake_health: 87,
  health_status: 'Healthy',
  options: [
    { cargo_id: 'CG-0001', action: 'Load Steel', cargo_type: 'Steel', destination: 'Delhi', tons: 3500, revenue: 420000, revenue_display: '₹4.2L', distance_km: 1400, travel_time_h: 18, congestion: 'Medium', track_risk: 0.45, final_score: 182.3, scores_breakdown: { revenue_score: 52.5, health_score: 87, cargo_availability_score: 78.2, empty_distance_penalty: -28.0, congestion_penalty: -15, wait_penalty: 0 } },
    { cargo_id: 'CG-0002', action: 'Load Limestone', cargo_type: 'Limestone', destination: 'Ahmedabad', tons: 4000, revenue: 510000, revenue_display: '₹5.1L', distance_km: 530, travel_time_h: 8, congestion: 'Low', track_risk: 0.31, final_score: 197.8, scores_breakdown: { revenue_score: 63.8, health_score: 87, cargo_availability_score: 65.4, empty_distance_penalty: -10.6, congestion_penalty: 0, wait_penalty: 0 } },
    { cargo_id: null, action: 'Wait 12h for Fertilizer', cargo_type: 'Fertilizer', destination: 'Kolkata', tons: 3800, revenue: 780000, revenue_display: '₹7.8L', distance_km: 0, travel_time_h: 0, wait_hours: 12, congestion: 'Low', track_risk: 0.25, final_score: 224.5, scores_breakdown: { revenue_score: 97.5, health_score: 87, cargo_availability_score: 88.0, empty_distance_penalty: 0, congestion_penalty: 0, wait_penalty: -24 } },
  ],
  recommendation: { action: 'Wait 12h for Fertilizer', final_score: 224.5, revenue: 780000, revenue_display: '₹7.8L', destination: 'Kolkata', cargo_type: 'Fertilizer' },
  sustainability_impact: { empty_distance_avoided_km: 1400, revenue_gained: '₹7.8L', co2_reduced_tons: 8.4 },
  ai_explanation: '🧠 AI Recommendation: WAIT 12 hours. A Fertilizer shipment is expected with ₹7.8L revenue and 88.0% availability probability. This creates the highest value (Score: 224.5) compared to loading immediately.',
};

// ── Cargo Stats ───────────────────────────────────────────
const mockCargoStats = {
  by_type: { Coal: 1850, Steel: 1620, Cement: 1480, Fertilizer: 1720, Limestone: 1330, Container: 2000 },
  by_source: { Mumbai: 1200, Delhi: 1500, Kolkata: 800, Chennai: 700, Ahmedabad: 600, Jaipur: 500, Surat: 400, Bangalore: 900, Lucknow: 700, Jharkhand: 700 },
  by_destination: { Mumbai: 1100, Delhi: 1400, Kolkata: 900, Chennai: 800, Ahmedabad: 700, Jaipur: 600, Surat: 500, Bangalore: 800, Lucknow: 600, Jharkhand: 600 },
  total_cargo: 10000,
  total_tonnage: 32500000,
  total_revenue: 4250000000,
  avg_revenue: 425000,
};

// ── Export All Mock Responses ─────────────────────────────
export const MOCK = {
  digitalTwinState: {
    rakes: mockRakes,
    rake_summary: {
      total: 20,
      by_status: { loaded: 7, empty: 6, in_transit: 4, maintenance: 3 },
    },
    track_alerts: mockTrackSegments.filter(s => s.risk_level === 'HIGH'),
    track_alert_count: 3,
    affected_rakes: [],
    vision_alerts: mockVisionAlerts.slice(0, 5),
    sustainability: mockSustainability,
    recent_events: mockEvents,
    cities: CITY_COORDS,
    default_bounds: { south_west: [12.5, 68.0], north_east: [30.0, 90.0], center: [22.5, 78.5], zoom: 5 },
    focus_corridor: { name: 'Delhi–Mumbai Freight Corridor', bounds: [[18.9, 72.8], [28.7, 77.2]] },
  },

  rakes: { rakes: mockRakes, total: 20, cities },
  rakeStats: {
    total_rakes: 20, by_status: { loaded: 7, empty: 6, in_transit: 4, maintenance: 3 },
    by_location: {}, avg_health_score: 72.4, critical_rakes: 3, empty_rakes: 6,
  },

  cargo: { cargo: mockCargo.slice(0, 20), total: 20, filters: { cargo_types: cargoTypes, cities } },
  cargoStats: mockCargoStats,

  routes: { routes: [], total: 0 },
  congestion: { summary: { Low: 120, Medium: 95, High: 45 }, by_city: {}, city_coords: CITY_COORDS },

  trackHealth: { segments: mockTrackSegments, total: mockTrackSegments.length, high_risk_count: 3 },
  trackAlerts: { alerts: mockTrackSegments.filter(s => s.risk_level === 'HIGH'), total: 3 },
  affectedRakes: { affected_rakes: [], total: 0, critical_count: 0 },
  trackMapData: {
    lines: mockTrackSegments.map(s => ({
      id: s.segment_id, from: [s.source_lat, s.source_lng], to: [s.dest_lat, s.dest_lng],
      risk_score: s.risk_score, risk_level: s.risk_level, label: `${s.source} → ${s.destination}`,
      color: s.risk_level === 'HIGH' ? '#ef4444' : s.risk_level === 'MEDIUM' ? '#f97316' : '#10b981',
    })),
    cities: CITY_COORDS,
  },

  decision: mockDecision,

  visionAlerts: {
    alerts: mockVisionAlerts, total: mockVisionAlerts.length,
    stats: { by_risk: { HIGH: 5, MEDIUM: 3, LOW: 2 }, by_object: { cow: 1, person: 2, truck: 1, dog: 1, bicycle: 1, car: 1, horse: 1, motorcycle: 1, bird: 1 } },
  },

  sustainability: mockSustainability,

  healthPrediction: {
    wheel_health: 'Good', bearing_health: 'Good', rake_health_score: 82,
    failure_probability: 0.08, status: 'Healthy',
    recommendations: ['Continue normal operations', 'Schedule routine inspection in 15 days'],
  },
};
