import { useCountUp } from '../../hooks/useCountUp';
import './StatCard.css';

export default function StatCard({ icon, label, value, prefix = '', suffix = '', tone = 'primary', delay = 0 }) {
  const animated = useCountUp(value);

  return (
    <div className={`stat-card glass-panel fade-in-up tone-${tone}`} style={{ animationDelay: `${delay}ms` }}>
      <span className="stat-card-icon">{icon}</span>
      <div className="stat-card-body">
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">
          {prefix}
          {animated.toLocaleString()}
          {suffix}
        </p>
      </div>
    </div>
  );
}
