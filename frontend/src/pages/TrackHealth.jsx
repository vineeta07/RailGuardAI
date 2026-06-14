import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Tooltip as LTooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Shield, AlertTriangle, MapPin } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import { fetchTrackHealth, fetchTrackAlerts, fetchTrackMapData, predictHealth, predictTrack } from '../services/api';
import { MOCK } from '../services/mockData';

export default function TrackHealth() {
  const { theme } = useTheme();
  const { data: trackData, loading } = useApi(fetchTrackHealth, MOCK.trackHealth, 5000);
  const { data: alerts } = useApi(fetchTrackAlerts, MOCK.trackAlerts, 5000);
  const { data: mapData } = useApi(fetchTrackMapData, MOCK.trackMapData, 8000);

  /* Rolling Stock Health Form */
  const [form, setForm] = useState({ vibration_rms: 0.35, temperature: 55, sound_level: 60, maintenance_days: 30 });
  const [result, setResult] = useState(null);
  const [predicting, setPredicting] = useState(false);

  /* Track Health Predictor Form */
  const [trackForm, setTrackForm] = useState({ vibration_mean: 0.2, vibration_rms: 0.25, consensus_count: 3, historical_defects: 1, track_age_years: 12, rainfall: 45.0 });
  const [trackResult, setTrackResult] = useState(null);
  const [predictingTrack, setPredictingTrack] = useState(false);

  const handlePredict = async (e) => {
    e.preventDefault();
    setPredicting(true);
    try { setResult(await predictHealth(form)); }
    catch { setResult(MOCK.healthPrediction); }
    setPredicting(false);
  };

  const handleTrackPredict = async (e) => {
    e.preventDefault();
    setPredictingTrack(true);
    try { setTrackResult(await predictTrack(trackForm)); }
    catch { setTrackResult({ risk_label: "Unknown Error", risk_probability: 0, inspection_required: false }); }
    setPredictingTrack(false);
  };

  if (loading || !trackData) return <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">Loading Track Health...</div></div>;

  const segments = trackData.segments || [];
  const alertList = alerts?.alerts || [];
  const trackLines = mapData?.lines || [];

  return (
    <>
      {/* KPIs */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        <div className="kpi-card">
          <div className="kpi-icon blue"><Shield size={18} /></div>
          <div><div className="kpi-label">Total Segments</div><div className="kpi-value" style={{ fontFamily: 'var(--mono)' }}>{trackData.total || 0}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon red"><AlertTriangle size={18} /></div>
          <div><div className="kpi-label">High Risk</div><div className="kpi-value" style={{ fontFamily: 'var(--mono)' }}>{trackData.high_risk_count || 0}</div></div>
        </div>
        <div className="kpi-card">
          <div className="kpi-icon orange"><MapPin size={18} /></div>
          <div><div className="kpi-label">Alert Segments</div><div className="kpi-value" style={{ fontFamily: 'var(--mono)' }}>{alertList.length}</div></div>
        </div>
      </div>

      <div className="bento" style={{ gridTemplateColumns: '5fr 4fr', marginBottom: 16 }}>
        {/* Track Map */}
        <motion.div className="g-card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
            <div className="g-card-title">🗺️ Track Health Map</div>
          </div>
          <div className="map-wrap" style={{ position: 'relative', height: 400 }}>
            <MapContainer center={[23.5, 78.5]} zoom={5} style={{ width: '100%', height: '100%' }}>
              <TileLayer 
                url={`https://{s}.basemaps.cartocdn.com/${theme === 'dark' ? 'dark_all' : 'light_all'}/{z}/{x}/{y}{r}.png`} 
                attribution="CARTO" 
              />
              {trackLines.map((l) => (
                <Polyline key={l.id} positions={[l.from, l.to]} pathOptions={{ color: l.color, weight: l.risk_level === 'HIGH' ? 4 : 2.5, opacity: l.risk_level === 'HIGH' ? 0.85 : 0.4, dashArray: l.risk_level === 'HIGH' ? '8 4' : null }}>
                  <LTooltip sticky><span style={{ fontSize: 11 }}>{l.label} — Risk: {Math.round(l.risk_score * 100)}%</span></LTooltip>
                </Polyline>
              ))}
            </MapContainer>
            {/* Map Legend */}
            <div className="map-legend">
              <div className="map-legend-title">Track Risk Level</div>
              <div className="map-legend-item">
                <div className="map-legend-color high" />
                <div>
                  <div>High Risk</div>
                  <div className="map-legend-desc">Risk ≥ 70% — Immediate inspection needed</div>
                </div>
              </div>
              <div className="map-legend-item">
                <div className="map-legend-color medium" />
                <div>
                  <div>Medium Risk</div>
                  <div className="map-legend-desc">Risk 40–70% — Monitor closely</div>
                </div>
              </div>
              <div className="map-legend-item">
                <div className="map-legend-color low" />
                <div>
                  <div>Low Risk</div>
                  <div className="map-legend-desc">Risk &lt; 40% — Safe for operation</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right Stack: Alerts */}
        <div className="bento-stack">
          <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} style={{ height: '100%' }}>
            <div className="g-card-head">
              <div className="g-card-title">⚠️ High-Risk Alerts</div>
            </div>
            <div className="triage-feed" style={{ maxHeight: 'calc(100% - 40px)' }}>
              {alertList.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>No high-risk alerts</div>}
              {alertList.slice(0, 6).map((a) => (
                <div key={a.segment_id} className="triage-item critical" style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{a.source} → {a.destination}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Risk: {Math.round(a.risk_score * 100)}% • {a.distance_km} km</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Predictors Side-by-Side */}
      <div className="bento" style={{ gridTemplateColumns: '1fr 1fr', marginTop: 16 }}>

        {/* Rolling Stock Health Predictor */}
        <motion.div className="g-card predictor-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="g-card-head">
            <div className="g-card-title">📡 Rolling Stock Predictor</div>
          </div>
          <form onSubmit={handlePredict}>
            <div className="form-row" style={{ marginBottom: 10 }}>
              <div className="form-group">
                <label className="form-label">Vibration</label>
                <input className="form-input" type="number" step="0.01" value={form.vibration_rms} onChange={e => setForm({ ...form, vibration_rms: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Temp °C</label>
                <input className="form-input" type="number" value={form.temperature} onChange={e => setForm({ ...form, temperature: +e.target.value })} />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: 12 }}>
              <div className="form-group">
                <label className="form-label">Sound dB</label>
                <input className="form-input" type="number" value={form.sound_level} onChange={e => setForm({ ...form, sound_level: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Maint. Days</label>
                <input className="form-input" type="number" value={form.maintenance_days} onChange={e => setForm({ ...form, maintenance_days: +e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ vibration_rms: 0.2, temperature: 42, sound_level: 48, maintenance_days: 10 })}>✅ Healthy</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ vibration_rms: 0.55, temperature: 72, sound_level: 78, maintenance_days: 120 })}>⚠️ Warning</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm({ vibration_rms: 0.88, temperature: 95, sound_level: 92, maintenance_days: 280 })}>🔴 Critical</button>
            </div>
            <button className="btn btn-primary btn-sm" type="submit" style={{ width: '100%' }}>
              {predicting ? 'Analyzing...' : '🧠 Predict Health'}
            </button>
          </form>
          {result && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Health Score</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: result.rake_health_score >= 80 ? 'var(--success)' : result.rake_health_score >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{result.rake_health_score}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span className={`badge ${(result.status || '').toLowerCase()}`}><span className="badge-dot" />{result.status}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Failure Prob.</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 600 }}>{(result.failure_probability * 100).toFixed(1)}%</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Track Health Predictor */}
        <motion.div className="g-card predictor-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="g-card-head">
            <div className="g-card-title">🛤️ Track Health Predictor</div>
          </div>
          <form onSubmit={handleTrackPredict}>
            <div className="form-row" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Vibration Mean</label>
                <input className="form-input" type="number" step="0.01" value={trackForm.vibration_mean} onChange={e => setTrackForm({ ...trackForm, vibration_mean: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Vibration RMS</label>
                <input className="form-input" type="number" step="0.01" value={trackForm.vibration_rms} onChange={e => setTrackForm({ ...trackForm, vibration_rms: +e.target.value })} />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Consensus Count</label>
                <input className="form-input" type="number" value={trackForm.consensus_count} onChange={e => setTrackForm({ ...trackForm, consensus_count: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Hist. Defects</label>
                <input className="form-input" type="number" value={trackForm.historical_defects} onChange={e => setTrackForm({ ...trackForm, historical_defects: +e.target.value })} />
              </div>
            </div>
            <div className="form-row" style={{ marginBottom: 14 }}>
              <div className="form-group">
                <label className="form-label">Track Age (Yrs)</label>
                <input className="form-input" type="number" value={trackForm.track_age_years} onChange={e => setTrackForm({ ...trackForm, track_age_years: +e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Rainfall (mm)</label>
                <input className="form-input" type="number" step="0.1" value={trackForm.rainfall} onChange={e => setTrackForm({ ...trackForm, rainfall: +e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTrackForm({ vibration_mean: 0.15, vibration_rms: 0.18, consensus_count: 1, historical_defects: 0, track_age_years: 5, rainfall: 10.0 })}>✅ Good</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTrackForm({ vibration_mean: 1.5, vibration_rms: 2.0, consensus_count: 3, historical_defects: 4, track_age_years: 20, rainfall: 60.0 })}>⚠️ Degraded</button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setTrackForm({ vibration_mean: 4.0, vibration_rms: 5.5, consensus_count: 5, historical_defects: 9, track_age_years: 35, rainfall: 95.0 })}>🔴 Critical</button>
            </div>
            <button className="btn btn-primary btn-sm" type="submit" style={{ width: '100%' }}>
              {predictingTrack ? 'Analyzing...' : '🧠 Predict Track Health'}
            </button>
          </form>
          {trackResult && (
            <div style={{ marginTop: 12, padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', fontSize: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Level</span>
                <span className={`badge ${trackResult.risk_label.toLowerCase()}`}><span className="badge-dot" />{trackResult.risk_label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ color: 'var(--text-muted)' }}>Risk Probability</span>
                <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: trackResult.risk_probability < 50 ? 'var(--success)' : trackResult.risk_probability < 75 ? 'var(--warning)' : 'var(--danger)' }}>{trackResult.risk_probability}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Inspection</span>
                <span style={{ fontWeight: 600, color: trackResult.inspection_required ? 'var(--danger)' : 'var(--success)' }}>{trackResult.inspection_required ? 'Required' : 'Not Needed'}</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Segments Table */}
      <motion.div className="g-card" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="g-card-head">
          <div className="g-card-title">📋 All Track Segments</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dtable">
            <thead>
              <tr>
                <th>Segment</th><th>Route</th><th>Distance</th><th>Risk</th><th>Level</th><th>Congestion</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr key={s.segment_id}>
                  <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 11 }}>{s.segment_id}</td>
                  <td>{s.source} → {s.destination}</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{s.distance_km} km</td>
                  <td style={{ fontFamily: 'var(--mono)' }}>{Math.round(s.risk_score * 100)}%</td>
                  <td><span className={`badge ${s.risk_level.toLowerCase()}`}><span className="badge-dot" />{s.risk_level}</span></td>
                  <td>{s.congestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
