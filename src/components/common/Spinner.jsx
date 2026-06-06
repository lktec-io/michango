import './Spinner.css';

export default function Spinner({ size = 28, label = 'Loading…', inline = false }) {
  return (
    <div className={`spinner-wrap ${inline ? 'spinner-inline' : ''}`} role="status" aria-live="polite">
      <span className="spinner" style={{ width: size, height: size }} aria-hidden="true" />
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
}
