import { useNativeFeatures } from '../../hooks/useNativeFeatures';

export default function NetworkStatus() {
  const { isOnline } = useNativeFeatures();

  if (isOnline) return null;

  return (
    <div className="offline-banner" id="offline-banner">
      ⚠️ Offline Mode — Showing last cached system state
    </div>
  );
}
