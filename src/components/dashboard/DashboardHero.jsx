import { useEffect, useState } from 'react';
import { FiClock, FiCalendar, FiUser } from 'react-icons/fi';
import './DashboardHero.css';

function formatParts(date) {
  return {
    time: date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
    day: date.toLocaleDateString('en-GB', { weekday: 'long' }),
    date: date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
  };
}

export default function DashboardHero({ name }) {
  const [now, setNow] = useState(() => formatParts(new Date()));

  useEffect(() => {
    const timer = setInterval(() => setNow(formatParts(new Date())), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="dashboard-hero glass-panel scale-in">
      <span className="dashboard-hero-glow" aria-hidden="true" />
      <div className="dashboard-hero-content">
        <div className="dashboard-hero-greeting">
          <span className="dashboard-hero-icon">
            <FiUser />
          </span>
          <div>
            <h2>Welcome back, {name}</h2>
            <p>Here&apos;s your workspace overview for today.</p>
          </div>
        </div>
        <div className="dashboard-hero-meta">
          <div className="dashboard-hero-meta-item">
            <FiClock />
            <span className="dashboard-hero-time">{now.time}</span>
          </div>
          <div className="dashboard-hero-meta-item">
            <FiCalendar />
            <span>
              {now.day} · {now.date}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
