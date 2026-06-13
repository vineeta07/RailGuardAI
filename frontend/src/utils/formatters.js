// ─── Currency Formatter (INR) ─────────────────────────────
export function formatCurrency(value) {
  if (value == null) return '₹0';
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
  return `₹${value.toLocaleString('en-IN')}`;
}

// ─── Percentage ───────────────────────────────────────────
export function formatPercent(value) {
  if (value == null) return '0%';
  return `${Math.round(value)}%`;
}

// ─── Number with commas ───────────────────────────────────
export function formatNumber(value) {
  if (value == null) return '0';
  return Number(value).toLocaleString('en-IN');
}

// ─── Time Ago ─────────────────────────────────────────────
export function timeAgo(timestamp) {
  if (!timestamp) return '';
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);

  if (diffSec < 60) return `${diffSec}s ago`;
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  return then.toLocaleDateString();
}

// ─── Health Score → Label ─────────────────────────────────
export function healthLabel(score) {
  if (score >= 80) return 'Healthy';
  if (score >= 50) return 'Warning';
  return 'Critical';
}

// ─── Health Score → Color Class ───────────────────────────
export function healthClass(score) {
  if (score >= 80) return 'healthy';
  if (score >= 50) return 'warning';
  return 'critical';
}

// ─── Risk Score → Label ───────────────────────────────────
export function riskLabel(score) {
  if (score > 0.7) return 'HIGH';
  if (score > 0.4) return 'MEDIUM';
  return 'LOW';
}

// ─── Short Time ───────────────────────────────────────────
export function formatTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
