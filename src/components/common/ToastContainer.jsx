import { createPortal } from 'react-dom';
import { FiCheckCircle, FiAlertCircle, FiAlertTriangle, FiInfo, FiX } from 'react-icons/fi';
import './ToastContainer.css';

const ICONS = {
  success: FiCheckCircle,
  error: FiAlertCircle,
  warning: FiAlertTriangle,
  info: FiInfo,
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;

  return createPortal(
    <div className="toast-stack" role="status" aria-live="polite">
      {toasts.map((toast) => {
        const Icon = ICONS[toast.type] || FiInfo;
        return (
          <div key={toast.id} className={`toast toast-${toast.type} slide-in-right`}>
            <span className="toast-icon">
              <Icon />
            </span>
            <p className="toast-message">{toast.message}</p>
            <button
              type="button"
              className="toast-dismiss"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
            >
              <FiX />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
