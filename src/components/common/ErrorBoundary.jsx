import { Component } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import Button from './Button';
import './ErrorBoundary.css';

export default class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="error-boundary">
        <div className="error-boundary-card glass-panel fade-in-up">
          <FiAlertTriangle className="error-boundary-icon" />
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred while rendering this page. Please try reloading.</p>
          <Button onClick={() => window.location.reload()}>Reload page</Button>
        </div>
      </div>
    );
  }
}
