import { useState, useEffect, useCallback } from 'react';

/**
 * A reusable hook for fetching data declaratively from our API client wrappers.
 *
 * @param {Function} fetcherFn - The API wrapper function to call (e.g., fetchStats)
 * @param {Array} dependencies - Dependency array to trigger automatic refetches
 * @returns {Object} { data, loading, error, refetch }
 */
export function useFetch(fetcherFn, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherFn();
      setData(result);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetcherFn]);

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error, refetch };
}
