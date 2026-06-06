import { FiEdit2, FiTrash2, FiCreditCard } from 'react-icons/fi';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import './ContributorTable.css';

export default function ContributorTable({ contributors, onEdit, onDelete, onGenerateCard }) {
  return (
    <div className="contributor-table-wrap glass-panel">
      <table className="contributor-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Amount</th>
            <th>Invitation code</th>
            <th>Card</th>
            <th aria-label="Actions" />
          </tr>
        </thead>
        <tbody>
          {contributors.map((contributor) => (
            <tr key={contributor.id} className="fade-in">
              <td data-label="Name">
                <strong>{contributor.fullName}</strong>
                {contributor.eventName && <p className="contributor-table-event">{contributor.eventName}</p>}
                {contributor.notes && <p className="contributor-table-notes">{contributor.notes}</p>}
              </td>
              <td data-label="Phone">{contributor.phone}</td>
              <td data-label="Amount" className="contributor-table-amount">{formatCurrency(contributor.amount)}</td>
              <td data-label="Invitation code">
                <code>{contributor.invitationCode}</code>
              </td>
              <td data-label="Card">
                {contributor.cardId ? <Badge tone="success">Generated</Badge> : <Badge tone="neutral">Pending</Badge>}
              </td>
              <td data-label="Actions">
                <div className="contributor-table-actions">
                  <button type="button" onClick={() => onGenerateCard(contributor)} title={contributor.cardId ? 'View card' : 'Generate card'}>
                    <FiCreditCard />
                  </button>
                  <button type="button" onClick={() => onEdit(contributor)} title="Edit contributor">
                    <FiEdit2 />
                  </button>
                  <button type="button" className="danger" onClick={() => onDelete(contributor)} title="Delete contributor">
                    <FiTrash2 />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
