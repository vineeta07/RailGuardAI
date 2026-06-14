import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse, Route, IndianRupee, AlertTriangle, TrendingUp
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip as LeafletTooltip } from 'react-leaflet';
import L from 'leaflet';
import { LineChart, Line, ResponsiveContainer } from 'recharts';
import 'leaflet/dist/leaflet.css';
import { useApi } from '../hooks/useApi';
import { fetchDigitalTwinState, fetchTrackMapData } from '../services/api';
import { MOCK } from '../services/mockData';
import { MAP_CONFIG, STATUS_COLORS } from '../utils/constants';
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

/* ── Marker factory ─────────────────────────────────────── */
function createDotIcon(health) {
  const cls = health >= 80 ? 'healthy' : health >= 50 ? 'warning' : 'critical';
  return L.divIcon({
    className: '',
    html: `<div class="map-marker ${cls}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function Dashboard() {
  const { data: twin, loading } = useApi(fetchDigitalTwinState, MOCK.digitalTwinState, 4000);
  const { data: trackMap } = useApi(fetchTrackMapData, MOCK.trackMapData, 8000);

  if (loading || !twin) return <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">Initializing command center...</div></div>;

  const rakes = twin.rakes || [];
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
        {/* Live Map */}
        <motion.div
          className="g-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
            <div className="g-card-title">🗺️ Live Network Map</div>
          </div>
          <div className="map-wrap">
            <MapContainer center={[23.5, 78.5]} zoom={5} style={{ width: '100%', height: '100%' }} zoomControl={true}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {rakes.filter(r => r.lat && r.lng).map((rake) => (
                <Marker
                  key={rake.rake_id}
                  position={[rake.lat, rake.lng]}
                  icon={createDotIcon(rake.health_score)}
                >
                  <LeafletTooltip direction="top" offset={[0, -8]} opacity={0.95}>
                    <div style={{ fontFamily: 'Inter', fontSize: 11 }}>
                      <strong>{rake.rake_id}</strong> • {rake.rake_type}<br />
                      Health: {rake.health_score}% • {rake.location}<br />
                      Speed: {Math.round(40 + Math.random() * 40)} km/h
                    </div>
                  </LeafletTooltip>
                </Marker>
              ))}
            </MapContainer>
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
