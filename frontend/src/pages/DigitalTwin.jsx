import { useState } from 'react';
import { motion } from 'framer-motion';
import RailwayMap from '../components/map/RailwayMap';
import SustainabilityBar from '../components/dashboard/SustainabilityBar';
import StatusBadge from '../components/common/StatusBadge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { fetchDigitalTwinState, fetchTrackMapData, fetchDecision } from '../services/api';
import { MOCK } from '../services/mockData';
import { healthLabel, formatCurrency } from '../utils/formatters';

export default function DigitalTwin() {
  const { data: twin, loading } = useApi(fetchDigitalTwinState, MOCK.digitalTwinState, 4000);
  const { data: trackMap } = useApi(fetchTrackMapData, MOCK.trackMapData, 8000);
  const [selectedRake, setSelectedRake] = useState(null);
  const [decision, setDecision] = useState(null);
  const [deciding, setDeciding] = useState(false);

  if (loading || !twin) return <LoadingSpinner text="Loading Digital Twin..." />;

  const rakes = twin.rakes || [];
  const trackLines = trackMap?.lines || [];

  const handleRakeClick = async (rake) => {
    setSelectedRake(rake);
    setDecision(null);
    if (rake.status === 'empty') {
      setDeciding(true);
      try {
        const result = await fetchDecision(rake.rake_id);
        setDecision(result);
      } catch {
        setDecision(MOCK.decision);
      }
      setDeciding(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {/* Sustainability Strip */}
      <SustainabilityBar data={twin.sustainability} />

      <div className="section-grid">
        {/* Map */}
        <motion.div
          className="glass-card"
          style={{ gridColumn: selectedRake ? '1' : '1 / -1' }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="glass-card-header">
            <div className="glass-card-title">🗺️ Digital Twin — Live System State</div>
            <div className="glass-card-subtitle">
              {rakes.length} rakes | {trackLines.length} track segments
            </div>
          </div>
          <RailwayMap
            rakes={rakes}
            trackLines={trackLines}
            onRakeClick={handleRakeClick}
            className="large"
            focusBounds={twin.focus_corridor?.bounds}
          />
        </motion.div>

        {/* Rake Detail Panel */}
        {selectedRake && (
          <motion.div
            className="glass-card"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card-header">
              <div>
                <div className="glass-card-title">🚂 {selectedRake.rake_id}</div>
                <div className="glass-card-subtitle">{selectedRake.rake_type} • {selectedRake.location}</div>
              </div>
              <button className="btn-icon" onClick={() => setSelectedRake(null)}>✕</button>
            </div>

            <div style={{ display: 'grid', gap: 12, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <StatusBadge status={selectedRake.status} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Health</span>
                <span style={{ fontWeight: 600 }}>{selectedRake.health_score}% ({healthLabel(selectedRake.health_score)})</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Capacity</span>
                <span>{selectedRake.capacity_tons}T</span>
              </div>
              {selectedRake.current_cargo && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Cargo</span>
                  <span>{selectedRake.current_cargo}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Maintenance</span>
                <span>{selectedRake.days_since_maintenance} days ago</span>
              </div>
            </div>

            {/* AI Decision */}
            {deciding && <LoadingSpinner text="AI analyzing options..." />}
            {decision && (
              <div style={{ marginTop: 20 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>🧠 AI Recommendation</h3>
                <div className="decision-ai-text">{decision.ai_explanation}</div>

                <div style={{ marginTop: 16 }}>
                  {(decision.options || []).slice(0, 3).map((opt, i) => (
                    <div key={i} className={`decision-option ${i === 0 ? 'recommended' : ''}`}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{opt.action}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                          {opt.destination} • {opt.revenue_display} • {opt.congestion} congestion
                        </div>
                      </div>
                      <div className="decision-score">{opt.final_score}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
