import './EmptyState.css';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="empty-state fade-in-up">
      {icon && <div className="empty-state-icon">{icon}</div>}
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
}
