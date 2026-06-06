import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { isValidEmail } from '../../utils/validators';
import { getAuthErrorMessage } from '../../utils/authErrors';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!isValidEmail(email)) {
      setError('Enter a valid email address');
      return;
    }

    setSubmitting(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err) {
      setFormError(getAuthErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a link to reset your password"
    >
      {sent ? (
        <div className="auth-banner auth-banner-success fade-in-up">
          <FiCheckCircle />
          <span>
            A password reset link has been sent to <strong>{email}</strong>. Please check your inbox
            (and spam folder).
          </span>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {formError && (
            <div className="auth-banner auth-banner-error">
              <FiAlertCircle /> <span>{formError}</span>
            </div>
          )}
          <Input
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<FiMail />}
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setError('');
            }}
            error={error}
          />
          <Button type="submit" fullWidth size="lg" loading={submitting}>
            Send reset link
          </Button>
        </form>
      )}
      <p className="auth-form-footer">
        Remembered your password? <Link to="/login">Back to sign in</Link>
      </p>
    </AuthLayout>
  );
}
