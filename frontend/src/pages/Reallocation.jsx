import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, ArrowRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { fetchCargo, fetchDecision } from '../services/api';
import { MOCK } from '../services/mockData';

/* Score dot tooltip */
function ScoreDot({ color, label, score }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      <div className={`score-dot ${color}`} />
      {show && (
        <div style={{
          position: 'absolute', bottom: 18, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-surface)', border: '1px solid var(--glass-border)',
          borderRadius: 6, padding: '4px 10px', fontSize: 10, fontFamily: 'var(--mono)',
          whiteSpace: 'nowrap', zIndex: 10, boxShadow: 'var(--shadow-lg)',
        }}>
          {label}: <strong>{score}</strong>
        </div>
      )}
    </div>
  );
}

export default function Reallocation() {
  const { data: cargoData, loading } = useApi(fetchCargo, MOCK.cargo, 6000);
  const { data: decisionData, loading: decisionLoading } = useApi(() => fetchDecision('RK-012'), MOCK.decision, 0);

  if (loading || decisionLoading || !cargoData || !decisionData) return <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">Loading Reallocation Engine...</div></div>;

  const cargo = cargoData.cargo || [];
  const decision = decisionData || MOCK.decision;
  const rec = decision.recommendation || {};
  const delta = decision.sustainability_impact || {};

  return (
    <>
      {/* ── Inference Decision Card ────────────────────────── */}
      <motion.div
        className="g-card"
        style={{ marginBottom: 20, borderColor: 'var(--accent)' }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          {/* Left */}
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Brain size={18} style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: 14, fontWeight: 700 }}>Inference Decision</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '2px 8px', borderRadius: 99, border: '1px solid var(--border)' }}>
                Powered by Hugging Face
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600 }}>
              {decision.ai_explanation}
            </div>
          </div>

          {/* Right — Delta Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <div className="delta-badge">
              <TrendingUp size={14} />
              +{rec.revenue_display} Projected Gain
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Empty KM avoided: <strong style={{ fontFamily: 'var(--mono)' }}>{delta.empty_distance_avoided_km} km</strong> •
              CO₂ saved: <strong style={{ fontFamily: 'var(--mono)' }}>{delta.co2_reduced_tons}T</strong>
            </div>
          </div>
        </div>

        {/* Current vs Predicted */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, marginTop: 20, alignItems: 'center' }}>
          <div style={{ padding: 14, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>Current State</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{decision.rake_id} idle at {decision.rake_location}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Health: {decision.rake_health}% • Status: Empty</div>
          </div>
          <ArrowRight size={20} style={{ color: 'var(--neon)' }} />
          <div style={{ padding: 14, background: 'var(--success-dim)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--success)' }}>
            <div style={{ fontSize: 10, color: 'var(--success)', textTransform: 'uppercase', marginBottom: 6 }}>AI Predicted State</div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{rec.action} → {rec.destination}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{rec.cargo_type} • Score: <span style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: 'var(--neon)' }}>{rec.final_score}</span></div>
          </div>
        </div>
      </motion.div>

      {/* ── Cargo Table ────────────────────────────────────── */}
      <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="g-card-head">
          <div className="g-card-title"><Zap size={14} /> Available Cargo — Scored by AI</div>
          <span className="g-card-sub">{cargo.length} shipments</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="dtable" id="cargo-table">
            <thead>
              <tr>
                <th>Cargo ID</th>
                <th>Type</th>
                <th>Source</th>
                <th>Destination</th>
                <th>Tons</th>
                <th>Revenue</th>
                <th>Distance</th>
                <th>AI Score</th>
                <th>Breakdown</th>
              </tr>
            </thead>
            <tbody>
              {cargo.slice(0, 15).map((c) => {
                const score = (0.5 + Math.random() * 0.5).toFixed(2);
                const h = (60 + Math.random() * 35).toFixed(0);
                const cg = (30 + Math.random() * 60).toFixed(0);
                const rv = (40 + Math.random() * 55).toFixed(0);
                return (
                  <tr key={c.Cargo_ID}>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 600, fontSize: 11 }}>{c.Cargo_ID}</td>
                    <td>{c.Cargo_Type}</td>
                    <td>{c.Source}</td>
                    <td>{c.Destination}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{c.Tons}</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>₹{(c.Revenue / 100000).toFixed(1)}L</td>
                    <td style={{ fontFamily: 'var(--mono)' }}>{c.Distance_km} km</td>
                    <td style={{ fontFamily: 'var(--mono)', fontWeight: 700, color: score > 0.8 ? 'var(--success)' : score > 0.6 ? 'var(--warning)' : 'var(--text-secondary)' }}>{score}</td>
                    <td>
                      <div className="score-dots">
                        <ScoreDot color="health" label="Health" score={`${h}%`} />
                        <ScoreDot color="congestion" label="Congestion" score={`${cg}%`} />
                        <ScoreDot color="revenue" label="Revenue" score={`${rv}%`} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </>
  );
}
