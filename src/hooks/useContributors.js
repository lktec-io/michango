import { useCallback, useEffect, useRef, useState } from 'react';
import { getContributorsByEvent } from '../services/contributorService';
import { getFirestoreErrorMessage } from '../utils/firestoreErrors';

/** Loads and refreshes contributors for a given event, scoped to its owner. */
export function useContributors(eventId, ownerId) {
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
    if (!eventId || !ownerId) return;
    setLoading(true);
    setError('');
    try {
      const data = await getContributorsByEvent(eventId, ownerId);
      if (mountedRef.current) setContributors(data);
    } catch (err) {
      console.error('Failed to load contributors for event:', err);
      if (mountedRef.current) setError(getFirestoreErrorMessage(err));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [eventId, ownerId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { contributors, loading, error, refresh, setContributors };
}
