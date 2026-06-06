import { useState } from 'react';
import { FiAlertTriangle } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import './VerifyEmailBanner.css';

export default function VerifyEmailBanner() {
  const { user, isEmailVerified, resendVerificationEmail } = useAuth();
  const toast = useToast();
  const [sending, setSending] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!user || isEmailVerified || dismissed) return null;

  async function handleResend() {
    setSending(true);
    try {
      await resendVerificationEmail();
      toast.success('Verification email sent. Please check your inbox.');
    } catch {
      toast.error('Could not send verification email. Try again shortly.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="verify-banner fade-in">
      <FiAlertTriangle />
      <p>
        Your email address isn&apos;t verified yet. Some features may be limited until you verify it.
      </p>
      <div className="verify-banner-actions">
        <button type="button" onClick={handleResend} disabled={sending}>
          {sending ? 'Sending…' : 'Resend email'}
        </button>
        <button type="button" className="verify-banner-dismiss" onClick={() => setDismissed(true)}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
