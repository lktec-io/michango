import { FiPhone, FiHash, FiEdit2, FiTrash2, FiCreditCard } from 'react-icons/fi';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { initials } from '../../utils/formatters';
import './ContributorCard.css';

export default function ContributorCard({ contributor, delay = 0, onEdit, onDelete, onGenerateCard }) {
  return (
    <div className="contributor-card glass-panel fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="contributor-card-top">
        <span className="contributor-avatar">{initials(contributor.fullName) || '?'}</span>
        <div className="contributor-card-info">
          <h4>{contributor.fullName}</h4>
          <span className="contributor-card-phone">
            <FiPhone /> {contributor.phone}
          </span>
          {contributor.eventName && <span className="contributor-card-event">{contributor.eventName}</span>}
        </div>
        {contributor.cardId ? <Badge tone="success">Card ready</Badge> : <Badge tone="neutral">No card</Badge>}
      </div>
      <div className="contributor-card-meta">
        <span className="contributor-card-amount">{formatCurrency(contributor.amount)}</span>
        <span className="contributor-card-code">
          <FiHash /> {contributor.invitationCode}
        </span>
      </div>
      {contributor.notes && <p className="contributor-card-notes">{contributor.notes}</p>}
      <div className="contributor-card-actions">
        <button type="button" onClick={() => onGenerateCard(contributor)} className="contributor-action-primary">
          <FiCreditCard /> {contributor.cardId ? 'View card' : 'Generate card'}
        </button>
        <button type="button" onClick={() => onEdit(contributor)} aria-label="Edit contributor">
          <FiEdit2 />
        </button>
        <button type="button" onClick={() => onDelete(contributor)} aria-label="Delete contributor" className="contributor-action-danger">
          <FiTrash2 />
        </button>
      </div>
    </div>
  );
}
