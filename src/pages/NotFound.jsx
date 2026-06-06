import { Link } from 'react-router-dom';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';
import Button from '../components/common/Button';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-card glass-panel fade-in-up">
        <span className="not-found-logo">
          <FiHeart />
        </span>
        <h1>404</h1>
        <h2>Page not found</h2>
        <p>The page you&apos;re looking for doesn&apos;t exist or may have been moved.</p>
        <Link to="/dashboard">
          <Button icon={<FiArrowLeft />}>Back to dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
