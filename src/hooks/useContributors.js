import { useCallback, useEffect, useState } from 'react';
import { getContributorsByEvent } from '../services/contributorService';

/** Loads and refreshes contributors for a given event. */
export function useContributors(eventId) {
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!eventId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getContributorsByEvent(eventId);
      setContributors(data);
    } catch {
      setError('Failed to load contributors. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contributors, loading, error, refresh, setContributors };
}
