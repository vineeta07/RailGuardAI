import { motion } from 'framer-motion';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import RailwayMap from '../components/map/RailwayMap';
import StatCard from '../components/dashboard/StatCard';
import { useApi } from '../hooks/useApi';
import { fetchTrackHealth, fetchTrackAlerts, fetchAffectedRakes, fetchTrackMapData } from '../services/api';
import { MOCK } from '../services/mockData';
import { AlertTriangle, Shield, MapPin } from 'lucide-react';

export default function TrackHealth() {
  const { data: trackData, loading } = useApi(fetchTrackHealth, MOCK.trackHealth, 5000);
  const { data: alerts } = useApi(fetchTrackAlerts, MOCK.trackAlerts, 5000);
  const { data: affected } = useApi(fetchAffectedRakes, MOCK.affectedRakes, 5000);
  const { data: mapData } = useApi(fetchTrackMapData, MOCK.trackMapData, 8000);

  if (loading || !trackData) return <LoadingSpinner text="Loading Track Health..." />;

  const segments = trackData.segments || [];
  const alertList = alerts?.alerts || [];
  const affectedList = affected?.affected_rakes || [];
  const trackLines = mapData?.lines || [];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Stats */}
      <div className="stat-grid">
        <StatCard icon={Shield} label="Total Segments" value={trackData.total || 0} color="blue" />
        <StatCard icon={AlertTriangle} label="High Risk" value={trackData.high_risk_count || 0} color="red" />
        <StatCard icon={MapPin} label="Affected Rakes" value={affectedList.length} color="orange" />
      </div>

      <div className="section-grid">
        {/* Track Map */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="glass-card-header">
            <div className="glass-card-title">🗺️ Track Health Map</div>
          </div>
          <RailwayMap trackLines={trackLines} rakes={[]} />
        </motion.div>

        {/* Alerts */}
        <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="glass-card-header">
            <div className="glass-card-title">⚠️ High-Risk Alerts</div>
            <span className="glass-card-subtitle">{alertList.length} segments</span>
          </div>
          <div className="event-feed">
            {alertList.map((alert) => (
              <div key={alert.segment_id} className="event-item critical">
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>
                    {alert.source} → {alert.destination}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Risk: {Math.round(alert.risk_score * 100)}% • {alert.distance_km} km • {alert.congestion} congestion
                  </div>
                </div>
                <StatusBadge status={alert.risk_level} />
              </div>
            ))}
            {alertList.length === 0 && (
              <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                No high-risk alerts currently
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Affected Rakes */}
      {affectedList.length > 0 && (
        <motion.div
          className="glass-card"
          style={{ marginTop: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">🚂 Affected Rakes Near Dangerous Zones</div>
          </div>
          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Rake ID</th>
                  <th>Location</th>
                  <th>Near Segment</th>
                  <th>Risk Score</th>
                  <th>Distance</th>
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {affectedList.map((r, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600 }}>{r.rake_id}</td>
                    <td>{r.rake_location}</td>
                    <td>{r.segment}</td>
                    <td>{Math.round(r.risk_score * 100)}%</td>
                    <td>{r.distance_km} km</td>
                    <td><StatusBadge status={r.priority} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* All Segments Table */}
      <motion.div
        className="glass-card"
        style={{ marginTop: 20 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="glass-card-header">
          <div className="glass-card-title">📋 All Track Segments</div>
        </div>
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Segment</th>
                <th>Route</th>
                <th>Distance</th>
                <th>Risk Score</th>
                <th>Risk Level</th>
                <th>Congestion</th>
                <th>Last Inspection</th>
              </tr>
            </thead>
            <tbody>
              {segments.slice(0, 20).map((seg) => (
                <tr key={seg.segment_id}>
                  <td style={{ fontWeight: 600 }}>{seg.segment_id}</td>
                  <td>{seg.source} → {seg.destination}</td>
                  <td>{seg.distance_km} km</td>
                  <td>{Math.round(seg.risk_score * 100)}%</td>
                  <td><StatusBadge status={seg.risk_level} /></td>
                  <td>{seg.congestion}</td>
                  <td>{seg.last_inspection}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
