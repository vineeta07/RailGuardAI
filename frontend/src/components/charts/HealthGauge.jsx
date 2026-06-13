import { healthClass } from '../../utils/formatters';

/**
 * Radial gauge for health scores.
 * Shows a circular arc that fills based on the score.
 */
export default function HealthGauge({ score = 0, size = 140, label = 'Health' }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const colorClass = healthClass(score);
  const colorMap = { healthy: '#10b981', warning: '#f97316', critical: '#ef4444' };
  const color = colorMap[colorClass] || '#3b82f6';

  return (
    <div className="health-gauge">
      <div className="gauge-circle" style={{ width: size, height: size }}>
        <svg width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={8}
          />
          {/* Progress arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease' }}
          />
        </svg>
        <div className="gauge-value">
          <span className="gauge-value-number" style={{ color }}>{Math.round(score)}%</span>
          <span className="gauge-value-label">{label}</span>
        </div>
      </div>
    </div>
  );
}
