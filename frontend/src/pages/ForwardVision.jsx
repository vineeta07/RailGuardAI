import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Camera } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { fetchVisionAlerts } from '../services/api';
import { MOCK } from '../services/mockData';
import { timeAgo } from '../utils/formatters';

export default function ForwardVision() {
  const { data, loading } = useApi(fetchVisionAlerts, MOCK.visionAlerts, 3000);
  const [criticalOnly, setCriticalOnly] = useState(false);

  if (loading || !data) return <div className="spinner-wrap"><div className="spinner" /><div className="spinner-text">Loading Forward Vision...</div></div>;

  const allAlerts = data.alerts || [];
  const alerts = criticalOnly ? allAlerts.filter(a => a.risk_level === 'HIGH') : allAlerts;
  const stats = data.stats || {};

  return (
    <>
      {/* Stats */}
      <div className="kpi-grid" style={{ marginBottom: 16 }}>
        {[
          { label: 'Total Detections', value: data.total || 0, color: 'blue' },
          { label: 'High Risk', value: stats.by_risk?.HIGH || 0, color: 'red' },
          { label: 'Medium Risk', value: stats.by_risk?.MEDIUM || 0, color: 'orange' },
          { label: 'Low Risk', value: stats.by_risk?.LOW || 0, color: 'green' },
        ].map((k) => (
          <div className="kpi-card" key={k.label}>
            <div className={`kpi-icon ${k.color}`}><Camera size={18} /></div>
            <div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-value" style={{ fontFamily: 'var(--mono)' }}>{k.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Split Pane */}
      <div className="vision-split">
        {/* Left: Camera Feed */}
        <motion.div
          className="vision-feed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {/* LIVE dot */}
          <motion.div
            className="vision-live"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="vision-live-dot" />
            REC • LIVE
          </motion.div>

          {/* Crosshair */}
          <div className="vision-crosshair" />

          {/* Camera label */}
          <div style={{ position: 'absolute', bottom: 12, left: 12, fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.4)', zIndex: 5 }}>
            CAM-01 RGB • 1920×1080 • 30fps
          </div>
          <div style={{ position: 'absolute', bottom: 12, right: 12, fontSize: 10, fontFamily: 'var(--mono)', color: 'rgba(255,255,255,0.4)', zIndex: 5 }}>
            YOLOv11 Inference: 12ms
          </div>

          {/* Simulated camera view */}
          <div style={{
            color: 'rgba(255,255,255,0.15)', fontSize: 14, fontFamily: 'var(--mono)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, zIndex: 3,
          }}>
            <Camera size={48} strokeWidth={1} />
            Forward Camera Feed
            <span style={{ fontSize: 10 }}>Locomotive RK-003 • Jaipur Corridor</span>
          </div>

          {/* Simulated bounding boxes */}
          <div style={{
            position: 'absolute', top: '35%', left: '60%', width: 60, height: 45,
            border: '2px solid var(--danger)', borderRadius: 4, zIndex: 5,
          }}>
            <span style={{
              position: 'absolute', top: -16, left: 0, fontSize: 9,
              fontFamily: 'var(--mono)', color: 'var(--danger)', background: 'rgba(239,68,68,0.2)',
              padding: '1px 6px', borderRadius: 3,
            }}>COW 94%</span>
          </div>
          <div style={{
            position: 'absolute', top: '55%', left: '30%', width: 35, height: 55,
            border: '2px solid var(--warning)', borderRadius: 4, zIndex: 5,
          }}>
            <span style={{
              position: 'absolute', top: -16, left: 0, fontSize: 9,
              fontFamily: 'var(--mono)', color: 'var(--warning)', background: 'rgba(245,158,11,0.2)',
              padding: '1px 6px', borderRadius: 3,
            }}>PERSON 91%</span>
          </div>
        </motion.div>

        {/* Right: Detection Log */}
        <motion.div className="g-card" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
          <div className="g-card-head">
            <div className="g-card-title">Object Detection Log</div>
            <button
              className={`btn btn-sm ${criticalOnly ? 'btn-danger' : 'btn-ghost'}`}
              onClick={() => setCriticalOnly(!criticalOnly)}
              id="filter-critical-btn"
            >
              <Filter size={12} /> {criticalOnly ? 'Critical' : 'All'}
            </button>
          </div>

          <div className="vision-log">
            {alerts.map((a) => (
              <div key={a.id} className={`vision-entry ${a.risk_level.toLowerCase()}`}>
                <div className="vision-entry-time">{timeAgo(a.timestamp)}</div>
                <div style={{ marginTop: 4, fontSize: 12 }}>
                  Object: <strong style={{ textTransform: 'capitalize' }}>{a.object}</strong> •
                  Distance: <strong style={{ fontFamily: 'var(--mono)' }}>{a.distance_m}m</strong> •
                  Risk: <strong style={{ color: a.risk_level === 'HIGH' ? 'var(--danger)' : a.risk_level === 'MEDIUM' ? 'var(--warning)' : 'var(--success)' }}>{a.risk_level}</strong>
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                  {a.rake_id} • {a.location} • Conf: {(a.confidence * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
