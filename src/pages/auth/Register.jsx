import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiLock, FiAlertCircle } from 'react-icons/fi';
import AuthLayout from '../../components/layout/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { validateRegister, hasErrors } from '../../utils/validators';
import { getAuthErrorMessage } from '../../utils/authErrors';

const INITIAL_FORM = { name: '', email: '', password: '', confirmPassword: '' };

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError('');
    const validationErrors = validateRegister(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      await register(form);
      toast.success('Account created! Check your inbox to verify your email address.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="Start managing wedding contributions in minutes">
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="auth-banner auth-banner-error">
            <FiAlertCircle /> <span>{formError}</span>
          </div>
        )}
        <Input
          label="Full name"
          type="text"
          name="name"
          autoComplete="name"
          placeholder="Jane Doe"
          icon={<FiUser />}
          value={form.name}
          onChange={handleChange}
          error={errors.name}
        />
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
          autoComplete="new-password"
          placeholder="At least 6 characters"
          icon={<FiLock />}
          value={form.password}
          onChange={handleChange}
          error={errors.password}
        />
        <Input
          label="Confirm password"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          icon={<FiLock />}
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        <Button type="submit" fullWidth size="lg" loading={submitting}>
          Create account
        </Button>
        <p className="auth-form-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
