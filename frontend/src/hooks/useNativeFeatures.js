import { useEffect, useState, useCallback } from 'react';

/**
 * Hook for native Capacitor features.
 * Degrades gracefully in browser — no crashes if Capacitor isn't present.
 */
export function useNativeFeatures() {
  const [isOnline, setIsOnline]   = useState(true);
  const [location, setLocation]   = useState({ lat: null, lng: null });
  const [gpsLoading, setGpsLoading] = useState(false);

  // ── Network Status (browser) ───────────────────────────
  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // ── GPS (browser Geolocation API) ──────────────────────
  const requestLocation = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGpsLoading(false);
      },
      () => setGpsLoading(false),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return {
    isOnline,
    location,
    gpsLoading,
    requestLocation,
    isNative: false,
    triggerCriticalAlert: () => {},
    triggerWarningAlert: () => {},
  };
}
