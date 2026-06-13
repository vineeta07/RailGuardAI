import { motion } from 'framer-motion';
import AnimatedCounter from '../components/common/AnimatedCounter';
import CongestionChart from '../components/charts/CongestionChart';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { fetchSustainability, fetchCongestion, fetchCargoStats } from '../services/api';
import { MOCK } from '../services/mockData';
import { Leaf, TrendingUp, Zap, Train, BarChart3, Wind } from 'lucide-react';

export default function Sustainability() {
  const { data: sus, loading } = useApi(fetchSustainability, MOCK.sustainability, 4000);
  const { data: congestion } = useApi(fetchCongestion, MOCK.congestion, 10000);
  const { data: cargoStats } = useApi(fetchCargoStats, MOCK.cargoStats, 10000);

  if (loading || !sus) return <LoadingSpinner text="Loading Sustainability..." />;

  const metrics = [
    { icon: '💰', iconComp: TrendingUp, label: 'Revenue Saved', value: sus.revenue_saved, prefix: '₹', color: 'blue' },
    { icon: '🚂', iconComp: Train, label: 'Empty KM Avoided', value: sus.empty_km_avoided, suffix: ' km', color: 'green' },
    { icon: '🌿', iconComp: Wind, label: 'CO₂ Reduced', value: sus.co2_reduced, suffix: ' tons', decimals: 1, color: 'green' },
    { icon: '🧠', iconComp: Zap, label: 'AI Decisions Made', value: sus.decisions_made, color: 'blue' },
    { icon: '⚠️', iconComp: BarChart3, label: 'Alerts Generated', value: sus.alerts_generated, color: 'orange' },
    { icon: '🔄', iconComp: Train, label: 'Rakes Rerouted', value: sus.rakes_rerouted, color: 'cyan' },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      {/* Big Counter Cards */}
      <div className="stat-grid" style={{ marginBottom: 32 }}>
        {metrics.map((m, i) => (
          <motion.div
            key={m.label}
            className="stat-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className={`stat-card-icon ${m.color}`}>
              <m.iconComp size={24} />
            </div>
            <div className="stat-card-body">
              <div className="stat-card-label">{m.label}</div>
              <div className="stat-card-value">
                <AnimatedCounter
                  value={m.value || 0}
                  prefix={m.prefix || ''}
                  suffix={m.suffix || ''}
                  decimals={m.decimals || 0}
                  duration={1500}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="section-grid">
        {/* Environmental Impact Summary */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">
              <Leaf size={18} style={{ color: 'var(--success)' }} />
              Environmental Impact
            </div>
          </div>
          <div style={{ display: 'grid', gap: 20 }}>
            <ImpactItem
              label="Carbon Footprint Reduction"
              value={`${(sus.co2_reduced || 0).toFixed(1)} tons CO₂`}
              description={`Equivalent to planting approximately ${Math.round((sus.co2_reduced || 0) * 50)} trees`}
              color="var(--success)"
            />
            <ImpactItem
              label="Fuel Savings"
              value={`${Math.round((sus.empty_km_avoided || 0) * 2.5)} liters`}
              description="Diesel fuel saved by optimizing empty rake movements"
              color="var(--info)"
            />
            <ImpactItem
              label="Operational Efficiency"
              value={`${((sus.decisions_made || 0) / Math.max((sus.decisions_made || 1), 1) * 100).toFixed(0)}%`}
              description={`${sus.decisions_made || 0} AI-powered decisions made in this session`}
              color="var(--primary-light)"
            />
          </div>
        </motion.div>

        {/* Congestion Chart */}
        <motion.div
          className="glass-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">🚦 Route Congestion Levels</div>
          </div>
          <CongestionChart data={congestion} />
        </motion.div>
      </div>

      {/* Cargo Summary */}
      {cargoStats && (
        <motion.div
          className="glass-card"
          style={{ marginTop: 20 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">📦 Cargo Network Summary</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
            <SummaryItem label="Total Requests" value={cargoStats.total_cargo?.toLocaleString() || '0'} />
            <SummaryItem label="Total Tonnage" value={`${((cargoStats.total_tonnage || 0) / 1000000).toFixed(1)}M tons`} />
            <SummaryItem label="Total Revenue" value={`₹${((cargoStats.total_revenue || 0) / 10000000).toFixed(1)}Cr`} />
            <SummaryItem label="Avg Revenue/Load" value={`₹${((cargoStats.avg_revenue || 0) / 100000).toFixed(1)}L`} />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function ImpactItem({ label, value, description, color }) {
  return (
    <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 10, borderLeft: `3px solid ${color}` }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{description}</div>
    </div>
  );
}

function SummaryItem({ label, value }) {
  return (
    <div style={{ padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}
