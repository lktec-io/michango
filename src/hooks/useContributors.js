import { useCallback, useEffect, useRef, useState } from 'react';
import { getContributorsByEvent } from '../services/contributorService';

/** Loads and refreshes contributors for a given event. */
export function useContributors(eventId) {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getContributorsByEvent(eventId);
      if (mountedRef.current) setContributors(data);
    } catch {
      if (mountedRef.current) setError('Failed to load contributors. Please try again.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contributors, loading, error, refresh, setContributors };
}
