import { useEffect, useMemo, useState } from 'react';
import { FiSearch, FiGrid, FiList, FiUsers } from 'react-icons/fi';
import ContributorCard from '../../components/contributors/ContributorCard';
import ContributorTable from '../../components/contributors/ContributorTable';
import ContributorFormModal from '../../components/contributors/ContributorFormModal';
import CardPreviewModal from '../../components/cards/CardPreviewModal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import EmptyState from '../../components/common/EmptyState';
import { SkeletonCard } from '../../components/common/Skeleton';
import Input from '../../components/common/Input';
import Pagination from '../../components/common/Pagination';
import Spinner from '../../components/common/Spinner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useDebounce } from '../../hooks/useDebounce';
import { getEventsByOwner, incrementEventStats } from '../../services/eventService';
import { getContributorsByOwner, deleteContributor } from '../../services/contributorService';
import './ContributorsPage.css';

const PAGE_SIZE = 9;

export default function ContributorsPage() {
  const { user } = useAuth();
  const toast = useToast();

  const [events, setEvents] = useState([]);
  const [contributors, setContributors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [view, setView] = useState('grid');
  const [page, setPage] = useState(1);

  const [contributorModal, setContributorModal] = useState({ open: false, contributor: null });
  const [cardPreview, setCardPreview] = useState({ open: false, contributor: null, event: null });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(search, 250);

  const eventsById = useMemo(() => new Map(events.map((e) => [e.id, e])), [events]);

  async function load() {
    if (!user) return;
    setLoading(true);
    try {
      const [eventsData, contributorsData] = await Promise.all([
        getEventsByOwner(user.uid),
        getContributorsByOwner(user.uid),
      ]);
      setEvents(eventsData);
      setContributors(contributorsData);
    } catch {
      toast.error('Failed to load contributors. Please try again.');
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
    return contributors.filter((c) => {
      const matchesEvent = eventFilter === 'all' || c.eventId === eventFilter;
      const matchesSearch =
        !term ||
        c.fullName?.toLowerCase().includes(term) ||
        c.phone?.toLowerCase().includes(term) ||
        c.invitationCode?.toLowerCase().includes(term);
      return matchesEvent && matchesSearch;
    });
  }, [contributors, debouncedSearch, eventFilter]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, eventFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function withEventName(contributor) {
    return { ...contributor, eventName: eventsById.get(contributor.eventId)?.eventName || 'Unknown event' };
  }

  function openCardPreview(contributor) {
    const event = eventsById.get(contributor.eventId);
    if (!event) {
      toast.warning('This contributor is not linked to an existing event.');
      return;
    }
    setCardPreview({ open: true, contributor, event });
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteContributor(deleteTarget.id);
      await incrementEventStats(deleteTarget.eventId, {
        totalContributors: -1,
        totalAmount: -(Number(deleteTarget.amount) || 0),
        totalCards: deleteTarget.cardId ? -1 : 0,
      });
      toast.success('Contributor removed successfully.');
      load();
    } catch {
      toast.error('Could not remove the contributor.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="contributors-page">
      <div className="contributors-page-header">
        <div>
          <h2>All contributors</h2>
          <p className="text-muted">Browse and manage contributors across every event you&apos;ve created.</p>
        </div>
      </div>

      <div className="contributors-toolbar glass-panel">
        <Input
          icon={<FiSearch />}
          placeholder="Search by name, phone or invitation code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search contributors"
        />
        <select className="field-input event-filter-select" value={eventFilter} onChange={(e) => setEventFilter(e.target.value)}>
          <option value="all">All events</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.eventName}
            </option>
          ))}
        </select>
        <div className="event-view-toggle">
          <button type="button" className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')} aria-label="Grid view">
            <FiGrid />
          </button>
          <button type="button" className={view === 'list' ? 'active' : ''} onClick={() => setView('list')} aria-label="List view">
            <FiList />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="contributors-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length ? (
        <>
          {view === 'grid' ? (
            <div className="contributors-grid">
              {paged.map((contributor, index) => (
                <ContributorCard
                  key={contributor.id}
                  contributor={withEventName(contributor)}
                  delay={index * 50}
                  onEdit={(c) => setContributorModal({ open: true, contributor: c })}
                  onDelete={(c) => setDeleteTarget(c)}
                  onGenerateCard={openCardPreview}
                />
              ))}
            </div>
          ) : (
            <ContributorTable
              contributors={paged.map(withEventName)}
              onEdit={(c) => setContributorModal({ open: true, contributor: c })}
              onDelete={(c) => setDeleteTarget(c)}
              onGenerateCard={openCardPreview}
            />
          )}
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      ) : contributors.length ? (
        <EmptyState icon={<FiSearch />} title="No matching contributors" description="Try adjusting your search or event filter." />
      ) : (
        <EmptyState
          icon={<FiUsers />}
          title="No contributors yet"
          description="Open an event and add contributors individually or import them in bulk from a spreadsheet."
        />
      )}

      <ContributorFormModal
        open={contributorModal.open}
        onClose={() => setContributorModal({ open: false, contributor: null })}
        eventId={contributorModal.contributor?.eventId}
        contributor={contributorModal.contributor}
        onSaved={load}
      />

      {cardPreview.event && (
        <CardPreviewModal
          open={cardPreview.open}
          onClose={() => setCardPreview({ open: false, contributor: null, event: null })}
          event={cardPreview.event}
          contributor={cardPreview.contributor}
          onCardReady={load}
        />
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this contributor?"
        message={`This will permanently remove ${deleteTarget?.fullName || 'this contributor'}.`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {loading && <Spinner inline label="" size={0} />}
    </div>
  );
}
