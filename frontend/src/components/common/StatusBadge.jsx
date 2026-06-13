export default function StatusBadge({ status }) {
  const normalized = (status || '').toLowerCase().replace(/\s+/g, '_');
  return (
    <span className={`status-badge ${normalized}`} id={`badge-${normalized}`}>
      <span className="status-badge-dot" />
      {status}
    </span>
  );
}
