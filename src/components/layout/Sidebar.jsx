import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiCalendar,
  FiUsers,
  FiCreditCard,
  FiBarChart2,
  FiLayers,
  FiSettings,
  FiHeart,
  FiX,
} from 'react-icons/fi';
import './Sidebar.css';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/events', label: 'Events', icon: FiCalendar },
  { to: '/contributors', label: 'Contributors', icon: FiUsers },
  { to: '/cards', label: 'Cards', icon: FiCreditCard },
  { to: '/reports', label: 'Reports', icon: FiBarChart2 },
  { to: '/templates', label: 'Templates', icon: FiLayers },
  { to: '/settings', label: 'Settings', icon: FiSettings },
];

export default function Sidebar({ open, onClose }) {
  return (
    <>
      <div className={`sidebar-backdrop ${open ? 'visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`sidebar ${open ? 'open' : ''}`} aria-label="Main navigation">
        <div className="sidebar-header">
          <span className="sidebar-logo">
            <FiHeart /> Michango
          </span>
          <button type="button" className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon className="sidebar-icon" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p>Michango &copy; {new Date().getFullYear()}</p>
          <p>Wedding Contribution Manager</p>
        </div>
      </aside>
    </>
  );
}
