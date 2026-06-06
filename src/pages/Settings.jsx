import { useEffect, useState } from 'react';
import { FiUser, FiLock, FiMonitor, FiSave } from 'react-icons/fi';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import ImageUploader from '../components/common/ImageUploader';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { useTheme } from '../contexts/ThemeContext';
import { updateUserProfile } from '../services/userService';
import { getAuthErrorMessage } from '../utils/authErrors';
import { isStrongPassword } from '../utils/validators';
import './Settings.css';

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function Settings() {
  const { user, profile, updateDisplayName, changePassword, refreshProfile } = useAuth();
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  const [profileForm, setProfileForm] = useState({ displayName: '', companyName: '' });
  const [logo, setLogo] = useState(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (profile) {
      setProfileForm({
        displayName: profile.displayName || user?.displayName || '',
        companyName: profile.companyName || '',
      });
      setLogo(profile.logoUrl ? { url: profile.logoUrl } : null);
    }
  }, [profile, user]);

  async function handleProfileSubmit(event) {
    event.preventDefault();
    if (!profileForm.displayName.trim()) {
      toast.error('Please enter your full name.');
      return;
    }

    setSavingProfile(true);
    try {
      await updateDisplayName(profileForm.displayName.trim());
      await updateUserProfile(user.uid, {
        displayName: profileForm.displayName.trim(),
        companyName: profileForm.companyName.trim(),
        logoUrl: logo?.url || '',
      });
      await refreshProfile();
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Could not update your profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  }

  function handlePasswordChange(field, value) {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setPasswordErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  async function handlePasswordSubmit(event) {
    event.preventDefault();
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Enter your current password';
    if (!passwordForm.newPassword) errors.newPassword = 'Enter a new password';
    else if (!isStrongPassword(passwordForm.newPassword)) errors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.confirmPassword !== passwordForm.newPassword) errors.confirmPassword = 'Passwords do not match';

    setPasswordErrors(errors);
    if (Object.keys(errors).length) return;

    setSavingPassword(true);
    try {
      await changePassword({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success('Password updated successfully.');
      setPasswordForm(EMPTY_PASSWORD_FORM);
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setSavingPassword(false);
    }
  }

  return (
    <div className="settings-page">
      <div className="settings-page-header">
        <h2>Account settings</h2>
        <p className="text-muted">Manage your profile, security and appearance preferences.</p>
      </div>

      <section className="settings-card glass-panel fade-in-up">
        <header className="settings-card-header">
          <span className="settings-card-icon">
            <FiUser />
          </span>
          <div>
            <h3>Profile &amp; company</h3>
            <p className="text-muted">This information appears across your dashboard and on generated cards.</p>
          </div>
        </header>
        <form className="settings-form" onSubmit={handleProfileSubmit}>
          <div className="settings-form-grid">
            <Input
              label="Full name"
              value={profileForm.displayName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, displayName: e.target.value }))}
              required
            />
            <Input
              label="Company / organizer name"
              placeholder="e.g. Aurora Events Co."
              value={profileForm.companyName}
              onChange={(e) => setProfileForm((prev) => ({ ...prev, companyName: e.target.value }))}
            />
          </div>
          <ImageUploader label="Company logo" value={logo} onChange={setLogo} folder="michango/logos" aspect="1/1" />
          <div className="settings-form-actions">
            <Button type="submit" icon={<FiSave />} loading={savingProfile}>
              Save profile
            </Button>
          </div>
        </form>
      </section>

      <section className="settings-card glass-panel fade-in-up">
        <header className="settings-card-header">
          <span className="settings-card-icon">
            <FiLock />
          </span>
          <div>
            <h3>Change password</h3>
            <p className="text-muted">Choose a strong password you don&apos;t use anywhere else.</p>
          </div>
        </header>
        <form className="settings-form" onSubmit={handlePasswordSubmit}>
          <Input
            label="Current password"
            type="password"
            value={passwordForm.currentPassword}
            onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
            error={passwordErrors.currentPassword}
            autoComplete="current-password"
          />
          <div className="settings-form-grid">
            <Input
              label="New password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
              error={passwordErrors.newPassword}
              hint="At least 6 characters"
              autoComplete="new-password"
            />
            <Input
              label="Confirm new password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
              error={passwordErrors.confirmPassword}
              autoComplete="new-password"
            />
          </div>
          <div className="settings-form-actions">
            <Button type="submit" icon={<FiSave />} loading={savingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </section>

      <section className="settings-card glass-panel fade-in-up">
        <header className="settings-card-header">
          <span className="settings-card-icon">
            <FiMonitor />
          </span>
          <div>
            <h3>Appearance</h3>
            <p className="text-muted">Choose how Michango looks on this device.</p>
          </div>
        </header>
        <div className="settings-theme-options">
          <button
            type="button"
            className={`settings-theme-option ${theme === 'light' ? 'active' : ''}`}
            onClick={() => setTheme('light')}
          >
            <span className="settings-theme-swatch settings-theme-swatch-light" />
            <span>Light mode</span>
          </button>
          <button
            type="button"
            className={`settings-theme-option ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => setTheme('dark')}
          >
            <span className="settings-theme-swatch settings-theme-swatch-dark" />
            <span>Dark mode</span>
          </button>
        </div>
      </section>
    </div>
  );
}
