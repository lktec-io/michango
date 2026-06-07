import { useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Applies the signed-in user's saved theme preference (Firestore `users/{uid}.theme`)
 * once per session, so the chosen theme survives login on a new device/browser.
 * Local changes made afterwards (via the appearance settings) take precedence —
 * this only seeds the theme on the initial profile load.
 */
export default function ThemeSync() {
  const { user, profile } = useAuth();
  const { setTheme } = useTheme();
  const seededFor = useRef(null);

  useEffect(() => {
    if (!user) {
      seededFor.current = null;
      return;
    }
    if (profile?.theme && seededFor.current !== user.uid) {
      seededFor.current = user.uid;
      setTheme(profile.theme);
    }
  }, [user, profile, setTheme]);

  return null;
}
