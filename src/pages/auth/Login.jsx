import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validateLogin, hasErrors } from '../../utils/validators';
import { getAuthErrorMessage } from '../../utils/authErrors';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const redirectTo = location.state?.from?.pathname || '/dashboard';

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    const validationErrors = validateLogin(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      await login(form);
      toast.success('Welcome back! You have signed in successfully.');
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your wedding events and contributors">
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
          value={form.email}
          onChange={handleChange}
          error={errors.email}
        />
        <Input
          label="Password"
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          icon={<FiLock />}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <div className="auth-form-options">
          <span />
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>
        <Button type="submit" fullWidth size="lg" loading={submitting}>
          Sign in
        </Button>
        <p className="auth-form-footer">
          Don&apos;t have an account? <Link to="/register">Create one now</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
