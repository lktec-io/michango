import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import VerifyEmailBanner from './VerifyEmailBanner';
import './DashboardLayout.css';

const TITLES = {
  '/dashboard': 'Dashboard',
  '/events': 'Events',
  '/contributors': 'Contributors',
  '/cards': 'Generated Cards',
  '/reports': 'Reports & Analytics',
  '/templates': 'Card Templates',
  '/settings': 'Settings',
};

function resolveTitle(pathname) {
  const match = Object.keys(TITLES).find((path) => pathname === path || pathname.startsWith(`${path}/`));
  return match ? TITLES[match] : 'Michango';
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="dashboard-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="dashboard-main">
        <Topbar title={resolveTitle(location.pathname)} onMenuClick={() => setSidebarOpen(true)} />
        <VerifyEmailBanner />
        <main className="dashboard-content">
          <div className="fade-in" key={location.pathname}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
