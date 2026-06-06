import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiPlus, FiSearch, FiCalendar } from 'react-icons/fi';
import EventCard from '../../components/events/EventCard';
import EventFormModal from '../../components/events/EventFormModal';
import { SkeletonCard } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { useEvents } from '../../hooks/useEvents';
import { useDebounce } from '../../hooks/useDebounce';
import './EventsList.css';

const STATUS_FILTERS = [
  { value: 'all', label: 'All events' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
];

export default function EventsList() {
  const { events, loading, error, refresh } = useEvents();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setModalOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const filteredEvents = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return events.filter((event) => {
      const matchesStatus = status === 'all' || event.status === status;
      const matchesSearch =
        !term ||
        event.eventName?.toLowerCase().includes(term) ||
        event.brideName?.toLowerCase().includes(term) ||
        event.groomName?.toLowerCase().includes(term) ||
        event.location?.toLowerCase().includes(term);
      return matchesStatus && matchesSearch;
    });
  }, [events, debouncedSearch, status]);

  return (
    <div className="events-page">
      <div className="events-page-header">
        <div>
          <h2>Your events</h2>
          <p className="text-muted">Manage wedding events, banners, templates and contributors.</p>
        </div>
        <Button icon={<FiPlus />} onClick={() => setModalOpen(true)}>
          Create event
        </Button>
      </div>

      <div className="events-toolbar glass-panel">
        <Input
          icon={<FiSearch />}
          placeholder="Search by event name, couple or location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search events"
        />
        <div className="events-filter-chips">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`filter-chip ${status === filter.value ? 'active' : ''}`}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      {loading ? (
        <div className="events-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredEvents.length ? (
        <div className="events-grid">
          {filteredEvents.map((event, index) => (
            <EventCard key={event.id} event={event} delay={index * 60} />
          ))}
        </div>
      ) : events.length ? (
        <EmptyState
          icon={<FiSearch />}
          title="No matching events"
          description="Try adjusting your search term or filter to find what you're looking for."
        />
      ) : (
        <EmptyState
          icon={<FiCalendar />}
          title="No events yet"
          description="Create your first wedding event — add a banner, choose a card template, and start inviting contributors."
          action={
            <Button icon={<FiPlus />} onClick={() => setModalOpen(true)}>
              Create your first event
            </Button>
          }
        />
      )}

      <EventFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={refresh} />
    </div>
  );
}
