import { motion } from 'framer-motion';
import { Train, Package, AlertTriangle, Activity, HeartPulse, RefreshCw } from 'lucide-react';
import StatCard from '../components/dashboard/StatCard';
import AlertBanner from '../components/dashboard/AlertBanner';
import SustainabilityBar from '../components/dashboard/SustainabilityBar';
import RailwayMap from '../components/map/RailwayMap';
import RevenueChart from '../components/charts/RevenueChart';
import CargoDistribution from '../components/charts/CargoDistribution';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { fetchDigitalTwinState, fetchCargoStats, resetSimulation } from '../services/api';
import { MOCK } from '../services/mockData';
import { formatCurrency, formatNumber, timeAgo } from '../utils/formatters';

export default function Dashboard() {
  const { data: twin, loading } = useApi(fetchDigitalTwinState, MOCK.digitalTwinState, 4000);
  const { data: cargoStats } = useApi(fetchCargoStats, MOCK.cargoStats, 10000);

  if (loading || !twin) return <LoadingSpinner text="Loading Dashboard..." />;

  const rakes = twin.rakes || [];
  const summary = twin.rake_summary || {};
  const sus = twin.sustainability || {};
  const events = twin.recent_events || [];
  const trackLines = (twin.track_alerts || []).map(a => ({
    id: a.segment_id,
    from: [a.source_lat, a.source_lng],
    to: [a.dest_lat, a.dest_lng],
    risk_score: a.risk_score,
    risk_level: a.risk_level,
    label: `${a.source} → ${a.destination}`,
    color: a.risk_level === 'HIGH' ? '#ef4444' : '#f97316',
  }));

  const handleReset = async () => {
    try { await resetSimulation(); } catch {}
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Alerts */}
      <AlertBanner alerts={events.filter(e => e.severity === 'critical').slice(0, 2)} />

      {/* Sustainability Strip */}
      <SustainabilityBar data={sus} />

      {/* Stat Cards */}
      <div className="stat-grid">
        <StatCard icon={Train} label="Total Rakes" value={summary.total || rakes.length} color="blue" delay={0} />
        <StatCard icon={Package} label="Empty Rakes" value={summary.by_status?.empty || 0} color="orange" delay={0.05} change="Awaiting allocation" />
        <StatCard icon={AlertTriangle} label="Track Alerts" value={twin.track_alert_count || 0} color="red" delay={0.1} />
        <StatCard icon={HeartPulse} label="Avg Health" value={`${Math.round(rakes.reduce((s,r) => s + r.health_score, 0) / (rakes.length || 1))}%`} color="green" delay={0.15} />
        <StatCard icon={Activity} label="Vision Alerts" value={twin.vision_alerts?.length || 0} color="cyan" delay={0.2} />
      </div>

      {/* Main Grid */}
      <div className="section-grid">
        {/* Mini Map */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">🗺️ Live Fleet Map</div>
          </div>
          <RailwayMap
            rakes={rakes.slice(0, 15)}
            trackLines={trackLines}
            focusBounds={twin.focus_corridor?.bounds}
          />
        </motion.div>

        {/* Event Feed + Charts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Event Feed */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            style={{ flex: 1 }}
          >
            <div className="glass-card-header">
              <div className="glass-card-title">⚡ Live Events</div>
              <span className="glass-card-subtitle">{events.length} recent</span>
            </div>
            <div className="event-feed">
              {events.slice(0, 8).map((event) => (
                <div key={event.id} className={`event-item ${event.severity}`}>
                  <span className="event-item-time">{timeAgo(event.timestamp)}</span>
                  <span className="event-item-message">{event.message}</span>
                </div>
              ))}
              {events.length === 0 && (
                <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)' }}>
                  No events yet — simulation warming up...
                </div>
              )}
            </div>
          </motion.div>

          {/* Cargo Distribution */}
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="glass-card-header">
              <div className="glass-card-title">📦 Cargo Distribution</div>
            </div>
            <CargoDistribution data={cargoStats} />
          </motion.div>
        </div>
      </div>

      {/* Revenue by City */}
      <motion.div
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        style={{ marginTop: 20 }}
      >
        <div className="glass-card-header">
          <div className="glass-card-title">📊 Cargo Requests by City</div>
          <div className="glass-card-subtitle">
            {cargoStats ? `${formatNumber(cargoStats.total_cargo)} total | ${formatCurrency(cargoStats.total_revenue)} revenue` : ''}
          </div>
        </div>
        <RevenueChart data={cargoStats} />
      </motion.div>

      {/* Reset Button */}
      <button className="reset-btn" onClick={handleReset} id="reset-simulation-btn" title="Reset simulation counters for pitch demo">
        <RefreshCw size={14} />
        Reset Simulation
      </button>
    </motion.div>
  );
}
