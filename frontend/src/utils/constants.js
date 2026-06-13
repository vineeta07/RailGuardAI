// ─── Indian City Coordinates ──────────────────────────────
export const CITY_COORDS = {
  Mumbai:    { lat: 19.0760, lng: 72.8777 },
  Delhi:     { lat: 28.7041, lng: 77.1025 },
  Kolkata:   { lat: 22.5726, lng: 88.3639 },
  Chennai:   { lat: 13.0827, lng: 80.2707 },
  Ahmedabad: { lat: 23.0225, lng: 72.5714 },
  Jaipur:    { lat: 26.9124, lng: 75.7873 },
  Surat:     { lat: 21.1702, lng: 72.8311 },
  Bangalore: { lat: 12.9716, lng: 77.5946 },
  Lucknow:   { lat: 26.8467, lng: 80.9462 },
  Jharkhand: { lat: 23.3441, lng: 85.3096 },
};

// ─── Map Configuration ────────────────────────────────────
export const MAP_CONFIG = {
  center: [22.5, 78.5],
  zoom: 5,
  defaultBounds: [[12.5, 68.0], [30.0, 90.0]],
  focusCorridor: {
    name: 'Delhi–Mumbai Freight Corridor',
    bounds: [[18.9, 72.8], [28.7, 77.2]],
  },
  tileUrl: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
  tileAttribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
};

// ─── Colors ───────────────────────────────────────────────
export const COLORS = {
  primary: '#1a56db',
  primaryLight: '#3b82f6',
  danger: '#ef4444',
  warning: '#f97316',
  success: '#10b981',
  info: '#06b6d4',
  chartColors: ['#3b82f6', '#10b981', '#f97316', '#ef4444', '#8b5cf6', '#06b6d4'],
};

// ─── Cargo Types ──────────────────────────────────────────
export const CARGO_TYPES = ['Coal', 'Steel', 'Cement', 'Fertilizer', 'Limestone', 'Container'];

// ─── Rake Statuses ────────────────────────────────────────
export const RAKE_STATUSES = ['loaded', 'empty', 'maintenance', 'in_transit'];

// ─── API Polling Interval (ms) ────────────────────────────
export const POLL_INTERVAL = 4000;

// ─── Status Color Map ─────────────────────────────────────
export const STATUS_COLORS = {
  loaded: '#3b82f6',
  empty: '#f97316',
  in_transit: '#10b981',
  maintenance: '#ef4444',
  HIGH: '#ef4444',
  MEDIUM: '#f97316',
  LOW: '#10b981',
  healthy: '#10b981',
  warning: '#f97316',
  critical: '#ef4444',
};
