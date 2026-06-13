export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="loading-spinner-container">
      <div>
        <div className="loading-spinner" />
        <div className="loading-text">{text}</div>
      </div>
    </div>
  );
}
