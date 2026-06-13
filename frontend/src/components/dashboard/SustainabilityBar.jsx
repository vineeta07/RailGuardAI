import AnimatedCounter from '../common/AnimatedCounter';
import { formatCurrency } from '../../utils/formatters';

export default function SustainabilityBar({ data }) {
  if (!data) return null;

  const items = [
    { icon: '💰', label: 'Revenue Saved', value: data.revenue_saved, format: 'currency' },
    { icon: '🚂', label: 'Empty KM Avoided', value: data.empty_km_avoided, format: 'number', suffix: ' km' },
    { icon: '🌿', label: 'CO₂ Reduced', value: data.co2_reduced, format: 'decimal', suffix: ' tons' },
    { icon: '🧠', label: 'AI Decisions', value: data.decisions_made, format: 'number' },
    { icon: '⚠️', label: 'Alerts Generated', value: data.alerts_generated, format: 'number' },
  ];

  return (
    <div className="sustainability-strip">
      {items.map((item) => (
        <div key={item.label} className="sustainability-item">
          <span className="sustainability-item-icon">{item.icon}</span>
          <div>
            <div className="sustainability-item-value">
              {item.format === 'currency' ? (
                <AnimatedCounter value={item.value} prefix="₹" />
              ) : item.format === 'decimal' ? (
                <AnimatedCounter value={item.value} decimals={1} suffix={item.suffix} />
              ) : (
                <AnimatedCounter value={item.value} suffix={item.suffix || ''} />
              )}
            </div>
            <div className="sustainability-item-label">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
