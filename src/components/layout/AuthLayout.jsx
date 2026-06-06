import { FiHeart } from 'react-icons/fi';
import './AuthLayout.css';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-layout">
      <div className="auth-showcase">
        <div className="auth-showcase-content fade-in-up">
          <span className="auth-logo">
            <FiHeart /> Michango
          </span>
          <h1>Beautiful contribution cards for unforgettable celebrations</h1>
          <p>
            Create wedding events, manage contributors, and generate personalized digital cards with
            QR verification — all from one elegant dashboard.
          </p>
          <ul className="auth-highlights">
            <li>Bulk import contributors from Excel in seconds</li>
            <li>Generate shareable cards with dynamic QR codes</li>
            <li>Download as PNG, JPG or PDF in studio quality</li>
          </ul>
        </div>
        <div className="auth-orb auth-orb-1" aria-hidden="true" />
        <div className="auth-orb auth-orb-2" aria-hidden="true" />
      </div>
      <div className="auth-form-side">
        <div className="auth-form-card glass-panel scale-in">
          <header className="auth-form-header">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </header>
          {children}
        </div>
      </div>
    </div>
  );
}
