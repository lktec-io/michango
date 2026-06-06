import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  FiArrowLeft,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiUpload,
  FiSearch,
  FiGrid,
  FiList,
  FiCalendar,
  FiMapPin,
  FiUsers,
  FiDollarSign,
  FiCreditCard,
} from 'react-icons/fi';
import EventFormModal from '../../components/events/EventFormModal';
import ContributorFormModal from '../../components/contributors/ContributorFormModal';
import ContributorCard from '../../components/contributors/ContributorCard';
import ContributorTable from '../../components/contributors/ContributorTable';
import ExcelImportModal from '../../components/contributors/ExcelImportModal';
import CardPreviewModal from '../../components/cards/CardPreviewModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { useToast } from '../../contexts/ToastContext';
import { useContributors } from '../../hooks/useContributors';
import { useDebounce } from '../../hooks/useDebounce';
import { getEvent, deleteEvent, incrementEventStats } from '../../services/eventService';
import { deleteContributor } from '../../services/contributorService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { getOptimizedUrl } from '../../services/cloudinaryService';
import { useImageStatus } from '../../hooks/useImageStatus';
import './EventDetails.css';

const PAGE_SIZE = 9;

export default function EventDetails() {
  const { eventId } = useParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [eventLoading, setEventLoading] = useState(true);
  const { contributors, loading: contributorsLoading, refresh } = useContributors(eventId);

  const [search, setSearch] = useState('');
  const [amountFilter, setAmountFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);

  const [editEventOpen, setEditEventOpen] = useState(false);
  const [deleteEventOpen, setDeleteEventOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState(false);

  const [contributorModal, setContributorModal] = useState({ open: false, contributor: null });
  const [importOpen, setImportOpen] = useState(false);
  const [cardPreview, setCardPreview] = useState({ open: false, contributor: null });
  const [deleteContributorTarget, setDeleteContributorTarget] = useState(null);
  const [deletingContributor, setDeletingContributor] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const banner = event?.bannerUrl ? getOptimizedUrl(event.bannerUrl, { width: 1280, height: 420 }) : '';
  const bannerStatus = useImageStatus(banner);
  const showBanner = bannerStatus === 'loaded';

  const loadEvent = async () => {
    setEventLoading(true);
    try {
      const data = await getEvent(eventId);
      if (!data) {
        toast.error('Event not found.');
        navigate('/events', { replace: true });
        return;
      }
      setEvent(data);
    } catch {
      toast.error('Failed to load event details.');
    } finally {
      setEventLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const filteredContributors = useMemo(() => {
    const term = debouncedSearch.trim().toLowerCase();
    return contributors.filter((c) => {
      const matchesSearch =
        !term ||
        c.fullName?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.invitationCode?.toLowerCase().includes(term);
      const amount = Number(c.amount) || 0;
      const matchesAmount =
        amountFilter === 'all' ||
        (amountFilter === 'low' && amount < 50000) ||
        (amountFilter === 'mid' && amount >= 50000 && amount <= 200000) ||
        (amountFilter === 'high' && amount > 200000) ||
        (amountFilter === 'with-card' && Boolean(c.cardId)) ||
        (amountFilter === 'without-card' && !c.cardId);
      return matchesSearch && matchesAmount;
    });
  }, [contributors, debouncedSearch, amountFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredContributors.length / PAGE_SIZE));
  const pagedContributors = filteredContributors.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, amountFilter]);

  async function handleDeleteEvent() {
    setDeletingEvent(true);
    try {
      await deleteEvent(eventId);
      toast.success('Event deleted successfully.');
      navigate('/events', { replace: true });
    } catch {
      toast.error('Could not delete the event. Please try again.');
    } finally {
      setDeletingEvent(false);
      setDeleteEventOpen(false);
    }
  }

  async function handleDeleteContributor() {
    if (!deleteContributorTarget) return;
    setDeletingContributor(true);
    try {
      await deleteContributor(deleteContributorTarget.id);
      await incrementEventStats(eventId, {
        totalContributors: -1,
        totalAmount: -(Number(deleteContributorTarget.amount) || 0),
        totalCards: deleteContributorTarget.cardId ? -1 : 0,
      });
      toast.success('Contributor removed successfully.');
      refresh();
      loadEvent();
    } catch {
      toast.error('Could not remove the contributor. Please try again.');
    } finally {
      setDeletingContributor(false);
      setDeleteContributorTarget(null);
    }
  }

  function handleSavedAll() {
    refresh();
    loadEvent();
  }

  if (eventLoading) {
    return (
      <div className="event-details-loading">
        <Spinner size={40} label="Loading event details…" />
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="event-details-page">
      <Link to="/events" className="event-details-back">
        <FiArrowLeft /> Back to events
      </Link>

      <section className="event-hero glass-panel fade-in-up">
        <div className="event-hero-banner" style={showBanner ? { backgroundImage: `url(${banner})` } : undefined}>
          <div className="event-hero-overlay" />
          <div className="event-hero-content">
            <h2>{event.eventName}</h2>
            <p>
              {event.brideName} &amp; {event.groomName}
            </p>
            <div className="event-hero-meta">
              <span>
                <FiCalendar /> {formatDate(event.eventDate)}
              </span>
              <span>
                <FiMapPin /> {event.location}
              </span>
            </div>
          </div>
          <div className="event-hero-actions">
            <Button variant="secondary" size="sm" icon={<FiEdit2 />} onClick={() => setEditEventOpen(true)}>
              Edit
            </Button>
            <Button variant="danger" size="sm" icon={<FiTrash2 />} onClick={() => setDeleteEventOpen(true)}>
              Delete
            </Button>
          </div>
        </div>
        {event.description && <p className="event-hero-description">{event.description}</p>}
        <div className="event-hero-stats">
          <div>
            <FiUsers />
            <div>
              <strong>{event.totalContributors || 0}</strong>
              <span>Contributors</span>
            </div>
          </div>
          <div>
            <FiDollarSign />
            <div>
              <strong>{formatCurrency(event.totalAmount || 0)}</strong>
              <span>Total contributions</span>
            </div>
          </div>
          <div>
            <FiCreditCard />
            <div>
              <strong>{event.totalCards || 0}</strong>
              <span>Cards generated</span>
            </div>
          </div>
        </div>
      </section>

      <section className="event-contributors">
        <div className="event-contributors-header">
          <h3>Contributors</h3>
          <div className="event-contributors-header-actions">
            <Button variant="secondary" icon={<FiUpload />} onClick={() => setImportOpen(true)}>
              Bulk import
            </Button>
            <Button icon={<FiPlus />} onClick={() => setContributorModal({ open: true, contributor: null })}>
              Add contributor
            </Button>
          </div>
        </div>

        <div className="event-contributors-toolbar glass-panel">
          <Input
            icon={<FiSearch />}
            placeholder="Search by name, phone or invitation code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search contributors"
          />
          <select className="field-input event-filter-select" value={amountFilter} onChange={(e) => setAmountFilter(e.target.value)}>
            <option value="all">All contributions</option>
            <option value="low">Below 50,000</option>
            <option value="mid">50,000 – 200,000</option>
            <option value="high">Above 200,000</option>
            <option value="with-card">Has card</option>
            <option value="without-card">No card yet</option>
          </select>
          <div className="event-view-toggle">
            <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view" title="Grid view">
              <FiGrid />
            </button>
            <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view" title="List view">
              <FiList />
            </button>
          </div>
        </div>

        {contributorsLoading ? (
          <div className="event-contributors-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredContributors.length ? (
          <>
            {view === 'grid' ? (
              <div className="event-contributors-grid">
                {pagedContributors.map((contributor, index) => (
                  <ContributorCard
                    key={contributor.id}
                    contributor={contributor}
                    delay={index * 50}
                    onEdit={(c) => setContributorModal({ open: true, contributor: c })}
                    onDelete={(c) => setDeleteContributorTarget(c)}
                    onGenerateCard={(c) => setCardPreview({ open: true, contributor: c })}
                  />
                ))}
              </div>
            ) : (
              <ContributorTable
                contributors={pagedContributors}
                onEdit={(c) => setContributorModal({ open: true, contributor: c })}
                onDelete={(c) => setDeleteContributorTarget(c)}
                onGenerateCard={(c) => setCardPreview({ open: true, contributor: c })}
              />
            )}
            <Pagination page={page} totalPages={totalPages} onChange={setPage} />
          </>
        ) : contributors.length ? (
          <EmptyState icon={<FiSearch />} title="No matching contributors" description="Try a different search term or filter." />
        ) : (
          <EmptyState
            icon={<FiUsers />}
            title="No contributors yet"
            description="Add contributors one at a time, or import a whole list from an Excel/CSV spreadsheet."
            action={
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Button icon={<FiPlus />} onClick={() => setContributorModal({ open: true, contributor: null })}>
                  Add contributor
                </Button>
                <Button variant="secondary" icon={<FiUpload />} onClick={() => setImportOpen(true)}>
                  Bulk import
                </Button>
              </div>
            }
          />
        )}
      </section>

      <EventFormModal open={editEventOpen} onClose={() => setEditEventOpen(false)} event={event} onSaved={loadEvent} />

      <ContributorFormModal
        open={contributorModal.open}
        onClose={() => setContributorModal({ open: false, contributor: null })}
        eventId={eventId}
        contributor={contributorModal.contributor}
        onSaved={handleSavedAll}
      />

      <ExcelImportModal open={importOpen} onClose={() => setImportOpen(false)} eventId={eventId} templateId={event.templateId} onImported={handleSavedAll} />

      <CardPreviewModal
        open={cardPreview.open}
        onClose={() => setCardPreview({ open: false, contributor: null })}
        event={event}
        contributor={cardPreview.contributor}
        onCardReady={handleSavedAll}
      />

      <ConfirmDialog
        open={deleteEventOpen}
        title="Delete this event?"
        message="This will permanently delete the event. Contributors and cards linked to it will remain but lose their event reference. This action cannot be undone."
        confirmLabel="Delete event"
        loading={deletingEvent}
        onConfirm={handleDeleteEvent}
        onCancel={() => setDeleteEventOpen(false)}
      />

      <ConfirmDialog
        open={Boolean(deleteContributorTarget)}
        title="Remove this contributor?"
        message={`This will permanently remove ${deleteContributorTarget?.fullName || 'this contributor'} from the event.`}
        confirmLabel="Remove"
        loading={deletingContributor}
        onConfirm={handleDeleteContributor}
        onCancel={() => setDeleteContributorTarget(null)}
      />
    </div>
  );
}
