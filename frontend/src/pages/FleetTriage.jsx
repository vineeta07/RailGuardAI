import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ChevronDown, Thermometer, Activity, Gauge } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis } from 'recharts';
import { useApi } from '../hooks/useApi';
import { fetchRakes } from '../services/api';
import { MOCK } from '../services/mockData';
import { healthLabel } from '../utils/formatters';

/* Mock temp spike data for critical rake chart */
const tempSpike = Array.from({ length: 20 }, (_, i) => ({
  t: `${i}m`,
  temp: i < 12 ? 52 + Math.random() * 4 : 52 + (i - 12) * 3.2 + Math.random() * 2,
}));

export default function FleetTriage() {
  const { data, loading } = useApi(fetchRakes, MOCK.rakes, 5000);
  const [expandedId, setExpandedId] = useState(null);

  if (loading || !data) return <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">Loading Fleet Triage...</div></div>;

  const rakes = data.rakes || [];
  const critical = rakes.filter(r => r.health_score < 50).sort((a, b) => a.health_score - b.health_score);
  const warning = rakes.filter(r => r.health_score >= 50 && r.health_score < 80);
  const nominal = rakes.filter(r => r.health_score >= 80).sort((a, b) => b.health_score - a.health_score);

  return (
    <>
      {/* ── Needs Immediate Attention ──────────────────────── */}
      {critical.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--danger)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <AlertTriangle size={14} /> NEEDS IMMEDIATE ATTENTION ({critical.length})
          </h3>
          {critical.map((rake, i) => (
            <motion.div
              key={rake.rake_id}
              className="triage-critical"
              style={{ marginBottom: 12 }}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.005, borderColor: 'var(--danger)' }}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Left: Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{rake.rake_id}</span>
                    <span className="badge critical"><span className="badge-dot" />Critical</span>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{rake.rake_type} • {rake.location}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, fontSize: 12 }}>
                    <div style={{ padding: 12, background: 'var(--danger-dim)', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 4 }}><Thermometer size={12} /> Axle Temp</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--danger)' }}>{(70 + Math.random() * 15).toFixed(1)}°C</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 4 }}><Activity size={12} /> Vibration</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)' }}>{(0.6 + Math.random() * 0.4).toFixed(2)}</div>
                    </div>
                    <div style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--text-muted)', marginBottom: 4 }}><Gauge size={12} /> Health</div>
                      <div style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--mono)', color: 'var(--danger)' }}>{rake.health_score}%</div>
                    </div>
                  </div>

                  <div style={{ marginTop: 12, fontSize: 11, color: 'var(--text-muted)' }}>
                    Last maintenance: <strong>{rake.days_since_maintenance} days ago</strong> • Capacity: {rake.capacity_tons}T
                  </div>
                </div>

                {/* Right: Temp chart */}
                <div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 6 }}>Axle Temperature — Last 30 min</div>
                  <ResponsiveContainer width="100%" height={140}>
                    <LineChart data={tempSpike}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="t" tick={{ fontSize: 9 }} />
                      <Line type="monotone" dataKey="temp" stroke="var(--danger)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Warning Rakes ──────────────────────────────────── */}
      {warning.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--warning)', marginBottom: 12 }}>
            ⚡ MONITORING ({warning.length})
          </h3>
          <div className="g-card" style={{ padding: 0 }}>
            {warning.map((rake) => (
              <AccordionRow key={rake.rake_id} rake={rake} expanded={expandedId === rake.rake_id} onToggle={() => setExpandedId(expandedId === rake.rake_id ? null : rake.rake_id)} />
            ))}
          </div>
        </div>
      )}

      {/* ── Nominal Fleet ──────────────────────────────────── */}
      <div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--success)', marginBottom: 12 }}>
          ✅ NOMINAL FLEET ({nominal.length})
        </h3>
        <div className="g-card" style={{ padding: 0 }}>
          {nominal.map((rake) => (
            <AccordionRow key={rake.rake_id} rake={rake} expanded={expandedId === rake.rake_id} onToggle={() => setExpandedId(expandedId === rake.rake_id ? null : rake.rake_id)} />
          ))}
        </div>
      </div>
    </>
  );
}

/* ── Accordion Row ─────────────────────────────────────── */
function AccordionRow({ rake, expanded, onToggle }) {
  const healthPct = rake.health_score;
  const barColor = healthPct >= 80 ? 'var(--success)' : healthPct >= 50 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="triage-nominal" style={{ borderBottom: '1px solid var(--border)', border: 'none', borderRadius: 0 }}>
      <div className="triage-nominal-row" onClick={onToggle}>
        <span style={{ width: 70, fontWeight: 600, fontFamily: 'var(--mono)', fontSize: 11 }}>{rake.rake_id}</span>
        <span style={{ flex: 1, color: 'var(--text-muted)' }}>{rake.location} → {rake.current_cargo || 'Idle'}</span>
        <div className="health-bar-mini">
          <div className="health-bar-fill" style={{ width: `${healthPct}%`, background: barColor }} />
        </div>
        <span style={{ width: 40, textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: barColor }}>{healthPct}%</span>
        <ChevronDown size={14} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'rotate(0)' }} />
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            className="triage-expand"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 12 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Type:</span> <strong>{rake.rake_type}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{rake.status}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Capacity:</span> <strong>{rake.capacity_tons}T</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Maintenance:</span> <strong>{rake.days_since_maintenance}d ago</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Vibration:</span> <strong style={{ fontFamily: 'var(--mono)' }}>{(0.1 + Math.random() * 0.3).toFixed(2)} RMS</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Temp:</span> <strong style={{ fontFamily: 'var(--mono)' }}>{(35 + Math.random() * 20).toFixed(1)}°C</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Sound:</span> <strong style={{ fontFamily: 'var(--mono)' }}>{Math.round(40 + Math.random() * 30)} dB</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Label:</span> <strong style={{ color: barColor }}>{healthLabel(healthPct)}</strong></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
