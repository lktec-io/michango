import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiSun, FiMoon, FiLogOut, FiSettings, FiChevronDown } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { initials } from '../../utils/formatters';
import './Topbar.css';

export default function Topbar({ title, onMenuClick }) {
  const { user, profile, logout } = useAuth();
  const { theme, themes, toggleTheme } = useTheme();
  const isDarkMode = themes.find((t) => t.id === theme)?.mode === 'dark';
  const toast = useToast();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      toast.info('You have been signed out.');
      navigate('/login', { replace: true });
    } catch {
      toast.error('Could not sign you out. Please try again.');
    }
  }

  const displayName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="topbar-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <FiMenu />
        </button>
        {title && <h1 className="topbar-title">{title}</h1>}
      </div>
      <div className="topbar-right">
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
        >
          {isDarkMode ? <FiSun /> : <FiMoon />}
        </button>
        <div className="topbar-user" ref={menuRef}>
          <button type="button" className="topbar-user-trigger" onClick={() => setMenuOpen((v) => !v)}>
            <span className="topbar-avatar">
              {profile?.logoUrl ? <img src={profile.logoUrl} alt="" /> : initials(displayName) || 'U'}
            </span>
            <span className="topbar-user-name">{displayName}</span>
            <FiChevronDown className={`topbar-chevron ${menuOpen ? 'open' : ''}`} />
          </button>
          {menuOpen && (
            <div className="topbar-menu glass-panel scale-in">
              <div className="topbar-menu-info">
                <strong>{displayName}</strong>
                <span>{user?.email}</span>
              </div>
              <button type="button" onClick={() => { setMenuOpen(false); navigate('/settings'); }}>
                <FiSettings /> Settings
              </button>
              <button type="button" className="topbar-menu-danger" onClick={handleLogout}>
                <FiLogOut /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
