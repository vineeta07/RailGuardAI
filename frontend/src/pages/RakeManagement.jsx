import { useState } from 'react';
import { motion } from 'framer-motion';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { fetchRakes, fetchDecision } from '../services/api';
import { MOCK } from '../services/mockData';
import { healthLabel, healthClass } from '../utils/formatters';

export default function RakeManagement() {
  const { data, loading } = useApi(fetchRakes, MOCK.rakes, 5000);
  const [selectedRake, setSelectedRake] = useState(null);
  const [decision, setDecision] = useState(null);
  const [deciding, setDeciding] = useState(false);
  const [filter, setFilter] = useState('');

  if (loading || !data) return <LoadingSpinner text="Loading Rake Fleet..." />;

  const rakes = data.rakes || [];
  const filtered = filter ? rakes.filter(r => r.status === filter) : rakes;

  const handleDecide = async (rake) => {
    setSelectedRake(rake);
    setDecision(null);
    setDeciding(true);
    try {
      const result = await fetchDecision(rake.rake_id);
      setDecision(result);
    } catch {
      setDecision(MOCK.decision);
    }
    setDeciding(false);
  };

  const statusCounts = {};
  rakes.forEach(r => { statusCounts[r.status] = (statusCounts[r.status] || 0) + 1; });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['', 'loaded', 'empty', 'in_transit', 'maintenance'].map((f) => (
          <button
            key={f}
            className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter(f)}
          >
            {f || 'All'} {f ? `(${statusCounts[f] || 0})` : `(${rakes.length})`}
          </button>
        ))}
      </div>

      <div className="section-grid">
        {/* Fleet Table */}
        <motion.div
          className="glass-card"
          style={{ gridColumn: decision ? '1' : '1 / -1' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">🚂 Rake Fleet</div>
            <div className="glass-card-subtitle">{filtered.length} rakes</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table" id="rake-fleet-table">
              <thead>
                <tr>
                  <th>Rake ID</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Health</th>
                  <th>Cargo</th>
                  <th>Capacity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((rake) => (
                  <tr key={rake.rake_id}>
                    <td style={{ fontWeight: 600 }}>{rake.rake_id}</td>
                    <td>{rake.rake_type}</td>
                    <td>{rake.location}</td>
                    <td><StatusBadge status={rake.status} /></td>
                    <td>
                      <span className={`status-badge ${healthClass(rake.health_score)}`}>
                        {rake.health_score}%
                      </span>
                    </td>
                    <td>{rake.current_cargo || '—'}</td>
                    <td>{rake.capacity_tons}T</td>
                    <td>
                      {rake.status === 'empty' && (
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleDecide(rake)}
                        >
                          🧠 AI Allocate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Decision Panel */}
        {(deciding || decision) && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card-header">
              <div className="glass-card-title">🧠 Decision Engine</div>
              <button className="btn-icon" onClick={() => { setDecision(null); setSelectedRake(null); }}>✕</button>
            </div>

            {deciding ? (
              <LoadingSpinner text="Analyzing allocation options..." />
            ) : decision ? (
              <div>
                <div style={{ fontSize: 14, marginBottom: 8 }}>
                  <strong>{decision.rake_id}</strong> at {decision.rake_location} — Health: {decision.rake_health}%
                </div>

                <div className="decision-ai-text">{decision.ai_explanation}</div>

                <div style={{ marginTop: 16 }}>
                  {(decision.options || []).map((opt, i) => (
                    <div key={i} className={`decision-option ${i === 0 ? 'recommended' : ''}`}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>
                          {i === 0 && '⭐ '}{opt.action}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                          → {opt.destination} | {opt.revenue_display} | {opt.congestion} congestion
                        </div>
                      </div>
                      <div className="decision-score">{opt.final_score}</div>
                    </div>
                  ))}
                </div>

                {decision.sustainability_impact && (
                  <div style={{ marginTop: 16, padding: 12, background: 'rgba(16,185,129,0.08)', borderRadius: 8, fontSize: 12 }}>
                    <strong style={{ color: 'var(--success)' }}>🌿 Sustainability Impact</strong>
                    <div style={{ marginTop: 6, color: 'var(--text-secondary)' }}>
                      Empty KM Avoided: {decision.sustainability_impact.empty_distance_avoided_km} km<br />
                      CO₂ Reduced: {decision.sustainability_impact.co2_reduced_tons} tons
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
