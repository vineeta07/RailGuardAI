// ────────────────────────────────────────────────────────
// RailGuard AI — API Service Layer
// ────────────────────────────────────────────────────────

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API Error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ── Digital Twin ──────────────────────────────────────────
export const fetchDigitalTwinState = () => request('/api/digital-twin/state');
export const fetchSustainability   = () => request('/api/digital-twin/sustainability');
export const resetSimulation       = () => request('/api/digital-twin/reset', { method: 'POST' });

// ── Rakes ─────────────────────────────────────────────────
export const fetchRakes     = (params = '') => request(`/api/rakes${params ? '?' + params : ''}`);
export const fetchRake      = (id) => request(`/api/rakes/${id}`);
export const fetchRakeStats = () => request('/api/rakes/stats/summary');

// ── Cargo ─────────────────────────────────────────────────
export const fetchCargo      = (params = '') => request(`/api/cargo${params ? '?' + params : ''}`);
export const fetchCargoStats = () => request('/api/cargo/stats');

// ── Routes ────────────────────────────────────────────────
export const fetchRoutes     = () => request('/api/routes');
export const fetchCongestion = () => request('/api/routes/congestion');

// ── Track Health ──────────────────────────────────────────
export const fetchTrackHealth    = () => request('/api/track-health');
export const fetchTrackAlerts    = () => request('/api/track-health/alerts');
export const fetchAffectedRakes  = () => request('/api/track-health/affected-rakes');
export const fetchTrackMapData   = () => request('/api/track-health/map-data');
export const predictTrack        = (data) =>
  request('/predict-track', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Decision Engine ───────────────────────────────────────
export const fetchDecision = (rakeId) =>
  request('/api/decide', {
    method: 'POST',
    body: JSON.stringify({ rake_id: rakeId }),
  });

// ── Forward Vision ────────────────────────────────────────
export const fetchVisionAlerts = () => request('/api/forward-vision/alerts');

// ── Rolling Stock Health (Existing ML endpoint) ───────────
export const predictHealth = (data) =>
  request('/predict-health', {
    method: 'POST',
    body: JSON.stringify(data),
  });

// ── Cargo Revenue Prediction (Existing ML endpoint) ──────
export const predictRevenue = (data) =>
  request('/predict', {
    method: 'POST',
    body: JSON.stringify(data),
  });
