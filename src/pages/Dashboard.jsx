import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiUsers, FiDollarSign, FiCreditCard, FiPlus, FiUpload, FiBarChart2 } from 'react-icons/fi';
import StatCard from '../components/common/StatCard';
import EventCard from '../components/events/EventCard';
import { SkeletonCard } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { getRecentEvents } from '../services/eventService';
import { getOwnerAnalytics } from '../services/analyticsService';
import { getFirestoreErrorMessage } from '../utils/firestoreErrors';
import { formatCurrency } from '../utils/formatters';
import './Dashboard.css';

const QUICK_ACTIONS = [
  { to: '/events?new=1', label: 'Create Event', description: 'Set up a new wedding event', icon: FiPlus, tone: 'primary' },
  { to: '/events', label: 'Upload Contributors', description: 'Bulk import from Excel/CSV', icon: FiUpload, tone: 'warm' },
  { to: '/reports', label: 'View Reports', description: 'Analytics & performance insights', icon: FiBarChart2, tone: 'info' },
];

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user) return undefined;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [analytics, events] = await Promise.all([
          getOwnerAnalytics(user.uid),
          getRecentEvents(user.uid, 6),
        ]);
        if (!active) return;
        setStats(analytics.totals);
        setRecentEvents(events);
      } catch (err) {
        console.error('Dashboard failed to load owner analytics/recent events:', err);
        if (active) setError(getFirestoreErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [user]);

  const displayName = profile?.displayName || user?.displayName || 'there';

  return (
    <div className="dashboard-page">
      <section className="dashboard-welcome fade-in-up">
        <h2>Welcome back, {displayName.split(' ')[0]} 👋</h2>
        <p>Here&apos;s what&apos;s happening across your wedding events today.</p>
      </section>

      {error && <div className="dashboard-error">{error}</div>}

      <section className="dashboard-stats">
        {loading || !stats ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          <>
            <StatCard icon={<FiCalendar />} label="Total Events" value={stats.totalEvents} delay={0} />
            <StatCard icon={<FiUsers />} label="Total Contributors" value={stats.totalContributors} tone="warm" delay={80} />
            <StatCard
              icon={<FiDollarSign />}
              label="Total Amount"
              value={stats.totalContributions}
              prefix=""
              suffix=""
              tone="success"
              delay={160}
            />
            <StatCard icon={<FiCreditCard />} label="Generated Cards" value={stats.totalCards} tone="info" delay={240} />
          </>
        )}
      </section>

      {!loading && stats && (
        <p className="dashboard-amount-note">
          Total contributions collected so far: <strong>{formatCurrency(stats.totalContributions)}</strong>
        </p>
      )}

      <section className="dashboard-quick-actions">
        <h3>Quick actions</h3>
        <div className="quick-actions-grid">
          {QUICK_ACTIONS.map(({ to, label, description, icon: Icon, tone }, index) => (
            <Link
              to={to}
              key={label}
              className={`quick-action-card glass-panel fade-in-up tone-${tone}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <span className="quick-action-icon">
                <Icon />
              </span>
              <div>
                <h4>{label}</h4>
                <p>{description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="dashboard-recent">
        <div className="dashboard-recent-header">
          <h3>Recent events</h3>
          <Link to="/events" className="auth-link">
            View all events
          </Link>
        </div>

        {loading ? (
          <div className="recent-events-grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : recentEvents.length ? (
          <div className="recent-events-grid">
            {recentEvents.map((event, index) => (
              <EventCard key={event.id} event={event} delay={index * 70} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FiCalendar />}
            title="No events yet"
            description="Create your first wedding event to start managing contributors and generating cards."
            action={
              <Link to="/events">
                <Button icon={<FiPlus />}>Create your first event</Button>
              </Link>
            }
          />
        )}
      </section>
    </div>
  );
}
