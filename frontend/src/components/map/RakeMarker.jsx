import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { healthLabel } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';

function createRakeIcon(status) {
  const color = STATUS_COLORS[status] || '#3b82f6';
  return L.divIcon({
    className: '',
    html: `<div class="rake-marker ${status}" style="background:${color}cc;border-color:${color}">🚂</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

export default function RakeMarker({ rake, onClick }) {
  if (!rake.lat || !rake.lng) return null;

  return (
    <Marker
      position={[rake.lat, rake.lng]}
      icon={createRakeIcon(rake.status)}
      eventHandlers={{ click: onClick }}
    >
      <Popup>
        <div style={{ minWidth: 180 }}>
          <strong style={{ fontSize: 14 }}>{rake.rake_id}</strong>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>{rake.rake_type} • {rake.location}</div>
          <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
          <div style={{ fontSize: 12, display: 'grid', gap: 4 }}>
            <div>Status: <strong>{rake.status}</strong></div>
            <div>Health: <strong>{rake.health_score}%</strong> ({healthLabel(rake.health_score)})</div>
            <div>Capacity: <strong>{rake.capacity_tons}T</strong></div>
            {rake.current_cargo && <div>Cargo: <strong>{rake.current_cargo}</strong></div>}
          </div>
        </div>
      </Popup>
    </Marker>
  );
}
