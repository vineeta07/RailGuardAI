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
    <div className={`map-container ${className}`} id="railway-map">
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
    </div>
  );
}
