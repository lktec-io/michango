import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getEventsByOwner } from '../services/eventService';

/** Loads and refreshes the current user's events. */
export function useEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
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
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await getEventsByOwner(user.uid);
      if (mountedRef.current) setEvents(data);
    } catch {
      if (mountedRef.current) setError('Failed to load events. Please try again.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { events, loading, error, refresh };
}
