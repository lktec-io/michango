import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiCreditCard, FiDownload, FiShare2, FiEye, FiHash } from 'react-icons/fi';
import CardPreviewModal from '../../components/cards/CardPreviewModal';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import { getTemplateById } from '../../utils/cardTemplates';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getEventsByOwner } from '../../services/eventService';
import { getCardsByOwner } from '../../services/cardService';
import { getFirestoreErrorMessage } from '../../utils/firestoreErrors';
import { formatCurrency, timeAgo } from '../../utils/formatters';
import './CardsPage.css';

const PAGE_SIZE = 9;

const STATUS_TONES = {
  generated: 'info',
  downloaded: 'success',
  shared: 'primary',
};

export default function CardsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const [preview, setPreview] = useState({ open: false, card: null });

  const debouncedSearch = useDebounce(search, 250);
  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const [eventsData, cardsData] = await Promise.all([getEventsByOwner(user.uid), getCardsByOwner(user.uid)]);
      setEvents(eventsData);
      setCards(cardsData);
    } catch (err) {
      console.error('Failed to load generated cards:', err);
      toast.error(getFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const filtered = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesEvent = eventFilter === 'all' || card.eventId === eventFilter;
      const matchesStatus = statusFilter === 'all' || card.status === statusFilter;
      const matchesSearch =
        !term ||
        card.contributorName?.toLowerCase().includes(term) ||
        card.contributorPhone?.toLowerCase().includes(term) ||
        card.invitationCode?.toLowerCase().includes(term);
      return matchesEvent && matchesStatus && matchesSearch;
    });
  }, [cards, debouncedSearch, eventFilter, statusFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, eventFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function openPreview(card) {
    const event = eventsById.get(card.eventId);
    if (!event) {
      toast.warning('The event linked to this card no longer exists.');
      return;
    }
    setPreview({ open: true, card, event });
  }

  return (
    <div className="cards-page">
      <div className="cards-page-header">
        <div>
          <h2>Generated cards</h2>
          <p className="text-muted">Every personalized contribution card you&apos;ve generated, in one place.</p>
        </div>
      </div>

      <div className="cards-toolbar glass-panel">
        <Input
          icon={<FiSearch />}
          placeholder="Search by name, phone or invitation code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search cards"
        />
        <select className="field-input cards-filter-select" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="all">All events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.eventName}
            </option>
          ))}
        </select>
        <select className="field-input cards-filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="generated">Generated</option>
          <option value="downloaded">Downloaded</option>
          <option value="shared">Shared</option>
        </select>
      </div>

      {loading ? (
        <div className="cards-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length ? (
        <>
          <div className="cards-grid">
            {paged.map((card, index) => {
              const template = getTemplateById(card.templateId);
              const event = eventsById.get(card.eventId);
              return (
                <article key={card.id} className="card-tile glass-panel fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="card-tile-preview" style={{ background: template.preview, color: template.textColor }}>
                    <span className="card-tile-eyebrow">{event?.eventName || 'Untitled event'}</span>
                    <strong>{card.contributorName}</strong>
                    <span className="card-tile-amount">{formatCurrency(card.amount)}</span>
                  </div>
                  <div className="card-tile-body">
                    <div className="card-tile-row">
                      <span className="card-tile-code">
                        <FiHash /> {card.invitationCode}
                      </span>
                      <Badge tone={STATUS_TONES[card.status] || 'neutral'}>{card.status || 'generated'}</Badge>
                    </div>
                    <div className="card-tile-stats">
                      <span>
                        <FiDownload /> {card.downloadCount || 0} downloads
                      </span>
                      <span>
                        <FiShare2 /> {card.shareCount || 0} shares
                      </span>
                    </div>
                    <div className="card-tile-footer">
                      <span className="card-tile-time">{timeAgo(card.createdAt)}</span>
                      <button type="button" className="card-tile-view" onClick={() => openPreview(card)}>
                        <FiEye /> View card
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : cards.length ? (
        <EmptyState icon={<FiSearch />} title="No matching cards" description="Try adjusting your search or filters." />
      ) : (
        <EmptyState
          icon={<FiCreditCard />}
          title="No cards generated yet"
          description="Generate personalized contribution cards from any event's contributor list."
        />
      )}

      {preview.event && preview.card && (
        <CardPreviewModal
          open={preview.open}
          onClose={() => setPreview({ open: false, card: null })}
          event={preview.event}
          contributor={{
            id: preview.card.contributorId,
            fullName: preview.card.contributorName,
            phone: preview.card.contributorPhone,
            amount: preview.card.amount,
            invitationCode: preview.card.invitationCode,
            cardId: preview.card.id,
          }}
          onCardReady={load}
        />
      )}
    </div>
  );
}
