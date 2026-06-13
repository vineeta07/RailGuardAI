import { useState } from 'react';
import { motion } from 'framer-motion';
import HealthGauge from '../components/charts/HealthGauge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import { predictHealth } from '../services/api';
import { MOCK } from '../services/mockData';

export default function RollingStock() {
  const [form, setForm] = useState({
    vibration_rms: 0.35,
    temperature: 55,
    sound_level: 60,
    maintenance_days: 30,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: parseFloat(e.target.value) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await predictHealth(form);
      setResult(res);
    } catch (err) {
      setError('Backend unreachable — showing sample prediction');
      setResult(MOCK.healthPrediction);
    }
    setLoading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="section-grid">
        {/* Sensor Input Form */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card-header">
            <div className="glass-card-title">📡 IoT Sensor Input</div>
            <div className="glass-card-subtitle">Simulated ESP32 + MPU6050 readings</div>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vibration RMS</label>
                <input
                  className="form-input"
                  type="number"
                  name="vibration_rms"
                  value={form.vibration_rms}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  max="2"
                  id="input-vibration"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Temperature (°C)</label>
                <input
                  className="form-input"
                  type="number"
                  name="temperature"
                  value={form.temperature}
                  onChange={handleChange}
                  min="0"
                  max="150"
                  id="input-temperature"
                />
              </div>
            </div>
            <div className="form-row" style={{ marginTop: 16 }}>
              <div className="form-group">
                <label className="form-label">Sound Level (dB)</label>
                <input
                  className="form-input"
                  type="number"
                  name="sound_level"
                  value={form.sound_level}
                  onChange={handleChange}
                  min="0"
                  max="130"
                  id="input-sound"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Days Since Maintenance</label>
                <input
                  className="form-input"
                  type="number"
                  name="maintenance_days"
                  value={form.maintenance_days}
                  onChange={handleChange}
                  min="0"
                  max="500"
                  id="input-maintenance"
                />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" style={{ marginTop: 20, width: '100%' }} id="predict-health-btn">
              {loading ? 'Analyzing...' : '🧠 Predict Health'}
            </button>
          </form>

          {error && (
            <div className="alert-banner warning" style={{ marginTop: 16 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Quick Presets */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>Quick Presets:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ vibration_rms: 0.20, temperature: 42, sound_level: 48, maintenance_days: 10 }); }}>
                ✅ Healthy
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ vibration_rms: 0.55, temperature: 72, sound_level: 78, maintenance_days: 120 }); }}>
                ⚠️ Warning
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => { setForm({ vibration_rms: 0.88, temperature: 95, sound_level: 92, maintenance_days: 280 }); }}>
                🔴 Critical
              </button>
            </div>
          </div>
        </motion.div>

        {/* Results Panel */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card-header">
            <div className="glass-card-title">📊 Health Assessment</div>
          </div>

          {!result ? (
            <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>
              <HeartIcon />
              <div style={{ marginTop: 12 }}>Enter sensor readings and click "Predict Health"</div>
            </div>
          ) : (
            <div>
              {/* Gauge */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
                <HealthGauge score={result.rake_health_score || 0} size={160} label="Rake Health" />
              </div>

              {/* Details Grid */}
              <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Status</span>
                  <StatusBadge status={result.status || 'Unknown'} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Wheel Health</span>
                  <span style={{ fontWeight: 600 }}>{result.wheel_health}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Bearing Health</span>
                  <span style={{ fontWeight: 600 }}>{result.bearing_health}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Failure Probability</span>
                  <span style={{ fontWeight: 600, color: result.failure_probability > 0.5 ? 'var(--danger)' : 'var(--success)' }}>
                    {(result.failure_probability * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Recommendations */}
              {result.recommendations && result.recommendations.length > 0 && (
                <div style={{ marginTop: 20, padding: 14, background: 'rgba(26, 86, 219, 0.08)', borderRadius: 10, fontSize: 13 }}>
                  <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--primary-light)' }}>📋 Recommendations</div>
                  <ul style={{ paddingLeft: 18, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
                    {result.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}

function HeartIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z" />
    </svg>
  );
}
