import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse, Route, IndianRupee, AlertTriangle, TrendingUp, Download, FileText, Presentation
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useApi } from '../hooks/useApi';
import { useTheme } from '../hooks/useTheme';
import { fetchDigitalTwinState } from '../services/api';
import { MOCK } from '../services/mockData';
import { STATUS_COLORS } from '../utils/constants';
import { healthLabel, timeAgo } from '../utils/formatters';

/* ── Animated Counter (Phase 8) ─────────────────────────── */
function AnimatedNum({ value, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const to = Number(value) || 0;
    const from = display;
    if (from === to) { setDisplay(to); return; }
    const start = performance.now();
    const dur = 900;
    function tick(now) {
      const p = Math.min((now - start) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (to - from) * e);
      if (p < 1) ref.current = requestAnimationFrame(tick);
    }
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [value]);
  return <span>{prefix}{Math.round(display).toLocaleString('en-IN')}{suffix}</span>;
}

/* ── Sparkline ──────────────────────────────────────────── */
const sparkData = Array.from({ length: 12 }, (_, i) => ({ v: 40 + i * 5 + Math.random() * 10 }));

// Charts data processing will happen inside the component

export default function Dashboard() {
  const { theme } = useTheme();
  const { data: twin, loading } = useApi(fetchDigitalTwinState, MOCK.digitalTwinState, 4000);

  if (loading || !twin) return <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">Initializing command center...</div></div>;

  const rakes = twin.rakes || [];
  
  // Chart Data
  const healthData = {
    Healthy: rakes.filter(r => r.health_score >= 80).length,
    Warning: rakes.filter(r => r.health_score >= 50 && r.health_score < 80).length,
    Critical: rakes.filter(r => r.health_score < 50).length
  };
  
  const pieData = [
    { name: 'Healthy', value: healthData.Healthy, color: STATUS_COLORS.healthy },
    { name: 'Warning', value: healthData.Warning, color: STATUS_COLORS.warning },
    { name: 'Critical', value: healthData.Critical, color: STATUS_COLORS.critical }
  ].filter(d => d.value > 0);

  const rakeTypes = rakes.reduce((acc, rake) => {
    acc[rake.rake_type] = (acc[rake.rake_type] || 0) + 1;
    return acc;
  }, {});
  
  const barData = Object.entries(rakeTypes).map(([type, count]) => ({
    name: type, count
  }));

  const events = (twin.recent_events || []).filter(e => e.severity === 'critical' || e.severity === 'warning');
  const sus = twin.sustainability || {};
  const avgHealth = rakes.length ? Math.round(rakes.reduce((s, r) => s + r.health_score, 0) / rakes.length) : 0;

  const kpis = [
    { icon: HeartPulse, label: 'Avg Rake Health', value: `${avgHealth}%`, color: 'green' },
    { icon: Route, label: 'Empty KM Avoided', value: sus.empty_km_avoided || 0, isNum: true, suffix: ' km', color: 'cyan' },
    { icon: IndianRupee, label: 'Revenue Saved', value: sus.revenue_saved || 0, isNum: true, prefix: '₹', color: 'blue', sparkline: true },
    { icon: AlertTriangle, label: 'Active Risks', value: String(twin.track_alert_count || 0), color: 'red' },
  ];

  return (
    <>
      {/* KPI Row */}
      <div className="kpi-grid">
        {kpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <motion.div
              className="kpi-card"
              key={k.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.25 }}
              whileHover={{ scale: 1.01, borderColor: 'var(--glass-border-hover)' }}
            >
              <div className={`kpi-icon ${k.color}`}><Icon size={20} /></div>
              <div>
                <div className="kpi-label">{k.label}</div>
                <div className="kpi-value" style={{ fontFamily: 'var(--mono)' }}>
                  {k.isNum
                    ? <AnimatedNum value={k.value} prefix={k.prefix || ''} suffix={k.suffix || ''} />
                    : k.value}
                </div>
              </div>
              {k.sparkline && (
                <div className="kpi-sparkline">
                  <ResponsiveContainer width={80} height={36}>
                    <LineChart data={sparkData}>
                      <Line type="monotone" dataKey="v" stroke="var(--success)" strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Bento: Map 70% | Triage 30% */}
      <div className="bento">
        {/* Fleet Analytics */}
        <motion.div
          className="g-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="g-card-title">📊 Fleet Analytics</div>
            <div style={{ display: 'flex', gap: 12 }}>
              <a 
                href="http://localhost:8000/api/reports/download/docx" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm" 
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'transparent', border: '2px solid var(--neon)', color: 'var(--neon)', boxShadow: '4px 4px 0 var(--neon)', fontWeight: 800, textDecoration: 'none', borderRadius: 0 }}
              >
                <FileText size={14} /> Download DOCX
              </a>
              <a 
                href="http://localhost:8000/api/reports/download/pptx" 
                target="_blank" 
                rel="noreferrer" 
                className="btn btn-sm" 
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, background: 'transparent', border: '2px solid var(--cyan)', color: 'var(--cyan)', boxShadow: '4px 4px 0 var(--cyan)', fontWeight: 800, textDecoration: 'none', borderRadius: 0 }}
              >
                <Presentation size={14} /> Download PPTX
              </a>
            </div>
          </div>
          <div style={{ flex: 1, display: 'flex', padding: 24, gap: 32 }}>
            
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center' }}>Health Distribution</h4>
              <div style={{ flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} innerRadius={60} paddingAngle={5}>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8 }} />
                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ width: 1, background: 'var(--border)', opacity: 0.5 }} />

            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, textAlign: 'center' }}>Rake Type Breakdown</h4>
              <div style={{ flex: 1, minHeight: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                    <Tooltip cursor={{ fill: 'var(--bg-card-hover)' }} contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
          
        </motion.div>

        {/* Active Triage Feed */}
        <motion.div
          className="g-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="g-card-head">
            <div className="g-card-title">⚡ Active Triage</div>
            <span className="g-card-sub">{events.length} alerts</span>
          </div>
          <div className="triage-feed">
            {events.length === 0 && (
              <div style={{ padding: 24, textAlign: 'center', color: 'var(--text-muted)', fontSize: 12 }}>
                No critical events — system nominal
              </div>
            )}
            {events.map((e) => (
              <div key={e.id} className={`triage-item ${e.severity}`}>
                <div className="triage-time">{timeAgo(e.timestamp)}</div>
                <div className="triage-msg">{e.message}</div>
              </div>
            ))}
            {/* Extra mock events for visual density */}
            <div className="triage-item critical">
              <div className="triage-time">2m ago</div>
              <div className="triage-msg">⚠ Axle Temp 79.2°C on RK-007 — exceeds threshold</div>
            </div>
            <div className="triage-item warning">
              <div className="triage-time">5m ago</div>
              <div className="triage-msg">⚡ RK-012 vibration spike — monitoring</div>
            </div>
            <div className="triage-item critical">
              <div className="triage-time">8m ago</div>
              <div className="triage-msg">⚠ PERSON detected 150m ahead of RK-011</div>
            </div>
            <div className="triage-item warning">
              <div className="triage-time">12m ago</div>
              <div className="triage-msg">⚡ Track segment TRK-006 congestion elevated</div>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}
