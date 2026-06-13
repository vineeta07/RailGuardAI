import { useState, useEffect, useRef } from 'react';

/**
 * Auto-refresh hook that calls `fetchFn` every `interval` ms.
 * Returns { data, loading, error, refetch }.
 */
export function usePolling(fetchFn, interval = 4000, deps = []) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const intervalRef           = useRef(null);
  const mountedRef            = useRef(true);

  async function fetchData() {
    try {
      const result = await fetchFn();
      if (mountedRef.current) {
        setData(result);
        setError(null);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err);
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchData();

    intervalRef.current = setInterval(fetchData, interval);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interval, ...deps]);

  return { data, loading, error, refetch: fetchData };
}
