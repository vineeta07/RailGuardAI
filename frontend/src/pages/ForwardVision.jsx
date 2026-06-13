import { motion } from 'framer-motion';
import StatCard from '../components/dashboard/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { fetchVisionAlerts } from '../services/api';
import { MOCK } from '../services/mockData';
import { timeAgo } from '../utils/formatters';
import { Eye, AlertTriangle, Shield, Camera } from 'lucide-react';

export default function ForwardVision() {
  const { data, loading } = useApi(fetchVisionAlerts, MOCK.visionAlerts, 3000);

  if (loading || !data) return <LoadingSpinner text="Loading Forward Vision..." />;

  const alerts = data.alerts || [];
  const stats = data.stats || {};

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Stats */}
      <div className="stat-grid">
        <StatCard icon={Eye} label="Total Detections" value={data.total || 0} color="blue" />
        <StatCard icon={AlertTriangle} label="High Risk" value={stats.by_risk?.HIGH || 0} color="red" />
        <StatCard icon={Shield} label="Medium Risk" value={stats.by_risk?.MEDIUM || 0} color="orange" />
        <StatCard icon={Camera} label="Low Risk" value={stats.by_risk?.LOW || 0} color="green" />
      </div>

      <div className="section-grid">
        {/* Alert Feed */}
        <motion.div
          className="glass-card"
          style={{ gridColumn: '1 / -1' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">📡 Real-Time Detection Feed</div>
            <div className="glass-card-subtitle">Powered by YOLOv11 Object Detection</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table" id="vision-alerts-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Object</th>
                  <th>Confidence</th>
                  <th>Risk Level</th>
                  <th>Distance</th>
                  <th>Rake</th>
                  <th>Location</th>
                  <th>Alert</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((alert) => (
                  <tr key={alert.id}>
                    <td style={{ fontSize: 11 }}>{timeAgo(alert.timestamp)}</td>
                    <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{alert.object}</td>
                    <td>{(alert.confidence * 100).toFixed(0)}%</td>
                    <td><StatusBadge status={alert.risk_level} /></td>
                    <td>{alert.distance_m}m</td>
                    <td style={{ fontWeight: 500 }}>{alert.rake_id}</td>
                    <td>{alert.location}</td>
                    <td style={{ fontSize: 12, maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {alert.message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Object Distribution */}
      {stats.by_object && (
        <motion.div
          className="glass-card"
          style={{ marginTop: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">📊 Detection Distribution</div>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {Object.entries(stats.by_object).map(([obj, count]) => (
              <div
                key={obj}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span style={{ textTransform: 'capitalize', fontWeight: 500 }}>{obj}</span>
                <span style={{
                  background: 'var(--primary-glow)',
                  color: 'var(--primary-light)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
