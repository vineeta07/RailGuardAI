import { useState, useEffect, useRef, useCallback } from 'react';
import { useDemoMode } from './useDemoMode';

/**
 * Fetch wrapper that automatically falls back to mock data
 * when Demo Mode is active or the API is unreachable.
 *
 * Usage:
 *   const { data, loading, error } = useApi(fetchFn, mockData, pollInterval);
 */
export function useApi(fetchFn, mockFallback, pollInterval = 4000, deps = []) {
  const { isDemoMode, reportApiFailure, reportApiSuccess } = useDemoMode();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const mountedRef            = useRef(true);
  const intervalRef           = useRef(null);

  const doFetch = useCallback(async () => {
    // If demo mode, use mock data immediately
    if (isDemoMode) {
      if (mountedRef.current) {
        setData(mockFallback);
        setLoading(false);
        setError(null);
      }
      return;
    }

    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLoading(false);
        reportApiSuccess();
      }
    } catch (err) {
      if (mountedRef.current) {
        reportApiFailure();
        // Still show mock data as fallback
        setData(mockFallback);
        setError(err);
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, fetchFn, mockFallback]);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    doFetch();

    if (pollInterval > 0) {
      intervalRef.current = setInterval(doFetch, pollInterval);
    }

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode, pollInterval, ...deps]);

  return { data, loading, error, refetch: doFetch };
}
