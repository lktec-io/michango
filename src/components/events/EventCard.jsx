import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers, FiArrowRight } from 'react-icons/fi';
import Badge from '../common/Badge';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getOptimizedUrl } from '../../services/cloudinaryService';
import './EventCard.css';

const STATUS_TONES = { active: 'success', completed: 'info', archived: 'neutral' };

export default function EventCard({ event, delay = 0 }) {
  const banner = event.bannerUrl ? getOptimizedUrl(event.bannerUrl, { width: 480, height: 240 }) : '';

  return (
    <Link to={`/events/${event.id}`} className="event-card glass-panel fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="event-card-banner" style={banner ? { backgroundImage: `url(${banner})` } : undefined}>
        {!banner && <span className="event-card-banner-fallback">{event.eventName?.[0] || 'E'}</span>}
        <Badge tone={STATUS_TONES[event.status] || 'neutral'}>{event.status || 'active'}</Badge>
      </div>
      <div className="event-card-body">
        <h3>{event.eventName}</h3>
        <p className="event-card-couple">
          {event.brideName} &amp; {event.groomName}
        </p>
        <div className="event-card-meta">
          <span>
            <FiCalendar /> {formatDate(event.eventDate)}
          </span>
          <span>
            <FiMapPin /> {event.location}
          </span>
        </div>
        <div className="event-card-stats">
          <span>
            <FiUsers /> {event.totalContributors || 0} contributors
          </span>
          <span className="event-card-amount">{formatCurrency(event.totalAmount || 0)}</span>
        </div>
      </div>
      <span className="event-card-arrow">
        <FiArrowRight />
      </span>
    </Link>
  );
}
