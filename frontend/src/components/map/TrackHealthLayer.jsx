import { Polyline, Tooltip } from 'react-leaflet';

/**
 * Renders colored track segments on the map.
 * Red = HIGH risk, Orange = MEDIUM, Green = LOW.
 */
export default function TrackHealthLayer({ lines = [] }) {
  // Logic to bend straight lines over water into logical terrestrial routes
  const getPositions = (line) => {
    const fLat = line.from[0];
    const tLat = line.to[0];
    const isKolkata = (lat) => Math.abs(lat - 22.5726) < 0.1;
    const isBangalore = (lat) => Math.abs(lat - 12.9716) < 0.1;
    const isJharkhand = (lat) => Math.abs(lat - 23.3441) < 0.1;
    const isChennai = (lat) => Math.abs(lat - 13.0827) < 0.1;
    const isLucknow = (lat) => Math.abs(lat - 26.8467) < 0.1;

    // Kolkata <-> Bangalore
    if ((isKolkata(fLat) && isBangalore(tLat)) || (isBangalore(fLat) && isKolkata(tLat))) {
      return [line.from, [17.6868, 83.2185], [16.5062, 80.6480], line.to];
    }
    // Jharkhand <-> Chennai
    if ((isJharkhand(fLat) && isChennai(tLat)) || (isChennai(fLat) && isJharkhand(tLat))) {
      return [line.from, [20.2961, 85.8245], [17.6868, 83.2185], [16.5062, 80.6480], line.to];
    }
    // Chennai <-> Lucknow
    if ((isChennai(fLat) && isLucknow(tLat)) || (isLucknow(fLat) && isChennai(tLat))) {
      return [line.from, [17.3850, 78.4867], [21.1458, 79.0882], line.to];
    }

    return [line.from, line.to];
  };

  return (
    <>
      {lines.map((line) => (
        <Polyline
          key={line.id}
          positions={getPositions(line)}
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
