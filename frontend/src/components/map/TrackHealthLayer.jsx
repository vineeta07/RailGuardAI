import { Polyline, Tooltip } from 'react-leaflet';

/**
 * Renders colored track segments on the map.
 * Red = HIGH risk, Orange = MEDIUM, Green = LOW.
 */
export default function TrackHealthLayer({ lines = [] }) {
  return (
    <>
      {lines.map((line) => (
        <Polyline
          key={line.id}
          positions={[line.from, line.to]}
          pathOptions={{
            color: line.color || '#10b981',
            weight: line.risk_level === 'HIGH' ? 4 : 3,
            opacity: line.risk_level === 'HIGH' ? 0.9 : 0.5,
            dashArray: line.risk_level === 'HIGH' ? '8 4' : null,
          }}
        >
          <Tooltip sticky>
            <span style={{ fontFamily: 'Inter', fontSize: 12 }}>
              {line.label} — Risk: {Math.round(line.risk_score * 100)}%
            </span>
          </Tooltip>
        </Polyline>
      ))}
    </>
  );
}
