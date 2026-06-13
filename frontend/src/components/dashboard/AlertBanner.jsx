import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export default function AlertBanner({ alerts = [] }) {
  const [dismissed, setDismissed] = useState(new Set());

  const visible = alerts.filter((_, i) => !dismissed.has(i)).slice(0, 3);
  if (visible.length === 0) return null;

  return (
    <div>
      {visible.map((alert, i) => (
        <div key={alert.id || i} className={`alert-banner ${alert.severity || 'warning'}`}>
          <AlertTriangle size={16} />
          <span style={{ flex: 1 }}>{alert.message}</span>
          <button
            onClick={() => setDismissed(prev => new Set(prev).add(i))}
            style={{ background: 'none', color: 'inherit', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
