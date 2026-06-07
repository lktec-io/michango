import { useEffect, useMemo, useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FiUsers, FiDollarSign, FiCreditCard, FiDownload, FiShare2, FiCalendar } from 'react-icons/fi';
import StatCard from '../components/common/StatCard';
import EmptyState from '../components/common/EmptyState';
import { SkeletonCard } from '../components/common/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { getOwnerAnalytics } from '../services/analyticsService';
import { getFirestoreErrorMessage } from '../utils/firestoreErrors';
import { formatCurrency, formatNumber } from '../utils/formatters';
import './Reports.css';

const PRIMARY = '#6c5ce7';
const SECONDARY = '#d4af37';
const SUCCESS = '#2ecc71';

export default function Reports() {
  const { user } = useAuth();
  const toast = useToast();
  const { theme } = useTheme();

  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const data = await getOwnerAnalytics(user.uid, 6);
        if (active) setAnalytics(data);
      } catch (err) {
        console.error('Failed to load report data:', err);
        if (active) toast.error(getFirestoreErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const gridColor = theme === 'dark' ? 'rgba(162, 155, 254, 0.16)' : 'rgba(108, 92, 231, 0.14)';
  const textColor = theme === 'dark' ? '#a8a4c2' : '#6f6c8a';
  const tooltipStyle = useMemo(
    () => ({
      background: theme === 'dark' ? '#211f30' : '#ffffff',
      border: `1px solid ${gridColor}`,
      borderRadius: 12,
      fontSize: 13,
      color: theme === 'dark' ? '#f5f4ff' : '#1c1a2b',
    }),
    [theme, gridColor]
  );

  if (loading) {
    return (
      <div className="reports-page">
        <div className="reports-stats">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="reports-charts">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics || !analytics.totals.totalEvents) {
    return (
      <EmptyState
        icon={<FiCalendar />}
        title="Nothing to report yet"
        description="Create your first event and add contributors — your analytics will appear here automatically."
      />
    );
  }

  const { totals, monthlyContributors, monthlyContributions, eventPerformance } = analytics;

  return (
    <div className="reports-page">
      <div className="reports-stats">
        <StatCard icon={<FiCalendar />} label="Total events" value={totals.totalEvents} tone="primary" delay={0} />
        <StatCard icon={<FiUsers />} label="Total contributors" value={totals.totalContributors} tone="warm" delay={50} />
        <StatCard icon={<FiDollarSign />} label="Total contributions" value={totals.totalContributions} tone="success" delay={100} />
        <StatCard icon={<FiCreditCard />} label="Cards generated" value={totals.totalCards} tone="info" delay={150} />
      </div>

      <div className="reports-secondary-stats">
        <div className="glass-panel reports-mini-stat">
          <FiDownload />
          <div>
            <strong>{formatNumber(totals.downloadedCards)}</strong>
            <span>Cards downloaded</span>
          </div>
        </div>
        <div className="glass-panel reports-mini-stat">
          <FiShare2 />
          <div>
            <strong>{formatNumber(totals.sharedCards)}</strong>
            <span>Cards shared</span>
          </div>
        </div>
        <div className="glass-panel reports-mini-stat">
          <FiCalendar />
          <div>
            <strong>{formatNumber(totals.activeEvents)}</strong>
            <span>Active events</span>
          </div>
        </div>
      </div>

      <div className="reports-charts">
        <section className="glass-panel reports-chart-card fade-in-up">
          <header>
            <h3>Monthly contributors</h3>
            <p className="text-muted">New contributors added over the last 6 months.</p>
          </header>
          <div className="reports-chart-area">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyContributors} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke={textColor} fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: gridColor }} />
                <Bar dataKey="count" name="Contributors" fill={PRIMARY} radius={[8, 8, 0, 0]} maxBarSize={42} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass-panel reports-chart-card fade-in-up">
          <header>
            <h3>Monthly contributions</h3>
            <p className="text-muted">Total amount contributed per month.</p>
          </header>
          <div className="reports-chart-area">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyContributions} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={gridColor} vertical={false} />
                <XAxis dataKey="month" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value)}
                  width={70}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="amount" name="Amount" stroke={SECONDARY} strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="glass-panel reports-chart-card reports-chart-card-wide fade-in-up">
          <header>
            <h3>Event performance</h3>
            <p className="text-muted">Your top events ranked by total contributions.</p>
          </header>
          <div className="reports-chart-area">
            <ResponsiveContainer width="100%" height={Math.max(260, eventPerformance.length * 52)}>
              <BarChart data={eventPerformance} layout="vertical" margin={{ top: 8, right: 24, left: 12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" stroke={gridColor} horizontal={false} />
                <XAxis type="number" stroke={textColor} fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => formatNumber(value)} />
                <YAxis
                  dataKey="eventName"
                  type="category"
                  stroke={textColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  width={140}
                  tick={{ width: 130 }}
                />
                <Tooltip contentStyle={tooltipStyle} formatter={(value, name) => (name === 'amount' ? formatCurrency(value) : value)} />
                <Legend />
                <Bar dataKey="amount" name="Total contributions" fill={PRIMARY} radius={[0, 8, 8, 0]} maxBarSize={28} />
                <Bar dataKey="contributors" name="Contributors" fill={SUCCESS} radius={[0, 8, 8, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}
