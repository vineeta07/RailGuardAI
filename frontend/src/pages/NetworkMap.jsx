import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip as LTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import { fetchDigitalTwinState, fetchTrackMapData, fetchDecision } from '../services/api';
import { MOCK } from '../services/mockData';
import { healthLabel } from '../utils/formatters';

function createDotIcon(health) {
  const cls = health >= 80 ? 'healthy' : health >= 50 ? 'warning' : 'critical';
  return L.divIcon({ className: '', html: `<div class="map-marker ${cls}"></div>`, iconSize: [14, 14], iconAnchor: [7, 7] });
}

export default function NetworkMap() {
  const { theme } = useTheme();
  const { data: twin, loading } = useApi(fetchDigitalTwinState, MOCK.digitalTwinState, 4000);
  const { data: trackMap } = useApi(fetchTrackMapData, MOCK.trackMapData, 8000);
  const [selected, setSelected] = useState(null);
  const [decision, setDecision] = useState(null);
  const [deciding, setDeciding] = useState(false);

  if (loading || !twin) return <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">Loading Digital Twin...</div></div>;

  const rakes = twin.rakes || [];
  const lines = trackMap?.lines || [];

  const handleClick = async (rake) => {
    setSelected(rake);
    setDecision(null);
    if (rake.status === 'empty') {
      setDeciding(true);
      try { setDecision(await fetchDecision(rake.rake_id)); }
      catch { setDecision(MOCK.decision); }
      setDeciding(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 340px' : '1fr', gap: 16, height: 'calc(100vh - 120px)' }}>
      {/* Full Map */}
      <motion.div className="g-card" style={{ padding: 0, overflow: 'hidden' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="g-card-title">🗺️ Digital Twin — Live System State</div>
          <span className="g-card-sub">{rakes.length} rakes • {lines.length} segments</span>
        </div>
        <div className="map-wrap" style={{ position: 'relative' }}>
          <MapContainer center={[23.5, 78.5]} zoom={5} style={{ width: '100%', height: '100%' }}>
            <TileLayer 
              url={`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`} 
              attribution="CARTO" 
            />
            {lines.map((l) => (
              <Polyline key={l.id} positions={[l.from, l.to]} pathOptions={{ color: l.color, weight: l.risk_level === 'HIGH' ? 4 : 2.5, opacity: l.risk_level === 'HIGH' ? 0.85 : 0.4, dashArray: l.risk_level === 'HIGH' ? '8 4' : null }}>
                <LTooltip sticky><span style={{ fontSize: 11 }}>{l.label} — Risk: {Math.round(l.risk_score * 100)}%</span></LTooltip>
              </Polyline>
            ))}
            {rakes.filter(r => r.lat && r.lng).map((r) => (
              <Marker key={r.rake_id} position={[r.lat, r.lng]} icon={createDotIcon(r.health_score)} eventHandlers={{ click: () => handleClick(r) }}>
                <LTooltip direction="top" offset={[0, -8]}><span style={{ fontSize: 11 }}><strong>{r.rake_id}</strong> • {r.health_score}% • {Math.round(30 + Math.random() * 50)} km/h</span></LTooltip>
              </Marker>
            ))}
          </MapContainer>
          {/* Map Legend */}
          <div className="map-legend">
            <div className="map-legend-title">Track Segments</div>
            <div className="map-legend-item">
              <div className="map-legend-color high" />
              <div>
                <div>High Risk</div>
                <div className="map-legend-desc">Risk ≥ 70% — Inspection needed</div>
              </div>
            </div>
            <div className="map-legend-item">
              <div className="map-legend-color medium" />
              <div>
                <div>Medium Risk</div>
                <div className="map-legend-desc">Risk 40–70% — Monitor</div>
              </div>
            </div>
            <div className="map-legend-item">
              <div className="map-legend-color low" />
              <div>
                <div>Low Risk</div>
                <div className="map-legend-desc">Risk &lt; 40% — Normal</div>
              </div>
            </div>
            <div className="map-legend-title" style={{ marginTop: 10 }}>Rake Health</div>
            <div className="map-legend-item">
              <div className="map-legend-dot healthy" />
              <div>Healthy (≥ 80%)</div>
            </div>
            <div className="map-legend-item">
              <div className="map-legend-dot warning" />
              <div>Warning (50–79%)</div>
            </div>
            <div className="map-legend-item">
              <div className="map-legend-dot critical" />
              <div>Critical (&lt; 50%)</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Detail Panel */}
      {selected && (
        <motion.div className="g-card" style={{ overflowY: 'auto' }} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="g-card-head">
            <div>
              <div className="g-card-title">🚂 {selected.rake_id}</div>
              <div className="g-card-sub">{selected.rake_type} • {selected.location}</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
          </div>

          <div style={{ display: 'grid', gap: 10, fontSize: 12, marginBottom: 16 }}>
            {[
              ['Status', selected.status],
              ['Health', `${selected.health_score}% (${healthLabel(selected.health_score)})`],
              ['Capacity', `${selected.capacity_tons}T`],
              ['Cargo', selected.current_cargo || '—'],
              ['Maintenance', `${selected.days_since_maintenance}d ago`],
            ].map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                <span style={{ fontWeight: 600, fontFamily: 'var(--mono)' }}>{v}</span>
              </div>
            ))}
          </div>

          {deciding && <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">AI analyzing...</div></div>}

          {decision && (
            <div>
              <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>🧠 AI Decision</h4>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 14, lineHeight: 1.6, padding: 12, background: 'var(--accent-dim)', borderRadius: 'var(--radius-sm)' }}>
                {decision.ai_explanation}
              </div>
              {(decision.options || []).slice(0, 3).map((opt, i) => (
                <div key={i} style={{ padding: '10px 12px', marginBottom: 6, borderRadius: 'var(--radius-sm)', background: i === 0 ? 'var(--success-dim)' : 'var(--bg-card)', border: `1px solid ${i === 0 ? 'var(--success)' : 'var(--border)'}`, fontSize: 12 }}>
                  <div style={{ fontWeight: 600 }}>{i === 0 && '⭐ '}{opt.action}</div>
                  <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>→ {opt.destination} | {opt.revenue_display} | Score: <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>{opt.final_score}</span></div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
