import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import { MAP_CONFIG } from '../../utils/constants';
import RakeMarker from './RakeMarker';
import TrackHealthLayer from './TrackHealthLayer';

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 7 });
    }
  }, [bounds, map]);
  return null;
}

/**
 * Main Leaflet map for the Digital Twin.
 * Shows rakes as animated markers and track health as colored lines.
 */
export default function RailwayMap({
  rakes = [],
  trackLines = [],
  onRakeClick,
  className = '',
  focusBounds,
}) {
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  const tileUrl = theme === 'light' 
    ? 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

  return (
    <div className={`map-container ${className}`} id="railway-map" style={{ position: 'relative' }}>
      <MapContainer
        center={MAP_CONFIG.center}
        zoom={MAP_CONFIG.zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url={tileUrl}
          attribution={MAP_CONFIG.tileAttribution}
        />

        {focusBounds && <FitBounds bounds={focusBounds} />}

        {/* Track health lines */}
        <TrackHealthLayer lines={trackLines} />

        {/* Rake markers */}
        {rakes.map((rake) => (
          <RakeMarker
            key={rake.rake_id}
            rake={rake}
            onClick={() => onRakeClick && onRakeClick(rake)}
          />
        ))}
      </MapContainer>

      {/* Map Legend Box */}
      <div style={{
        position: 'absolute', bottom: 20, right: 20, zIndex: 1000,
        background: 'var(--bg-surface)', padding: '12px 16px',
        borderRadius: 'var(--radius)', border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-lg)', backdropFilter: 'blur(10px)',
        fontSize: '12px', color: 'var(--text-secondary)'
      }}>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text-primary)' }}>Risk Legend</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 12, height: 4, background: '#ef4444', borderRadius: 2 }} /> High Risk
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <div style={{ width: 12, height: 4, background: '#f59e0b', borderRadius: 2 }} /> Medium Risk
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 12, height: 4, background: '#10b981', borderRadius: 2 }} /> Low Risk
        </div>
      </div>
    </div>
  );
}
