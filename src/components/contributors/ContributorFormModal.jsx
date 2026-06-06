import { useEffect, useState } from 'react';
import { FiRefreshCw } from 'react-icons/fi';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { addContributor, updateContributor } from '../../services/contributorService';
import { syncCardWithContributor } from '../../services/cardService';
import { incrementEventStats } from '../../services/eventService';
import { validateContributor, hasErrors } from '../../utils/validators';
import { generateInvitationCode } from '../../utils/codeGenerator';

const EMPTY_FORM = { fullName: '', phone: '', amount: '', invitationCode: '', notes: '' };

function toFormState(contributor) {
  if (!contributor) return { ...EMPTY_FORM, invitationCode: generateInvitationCode() };
  return {
    fullName: contributor.fullName || '',
    phone: contributor.phone || '',
    amount: contributor.amount ?? '',
    invitationCode: contributor.invitationCode || '',
    notes: contributor.notes || '',
  };
}

export default function ContributorFormModal({ open, onClose, eventId, contributor, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(contributor);

  useEffect(() => {
    if (open) {
      setForm(toFormState(contributor));
      setErrors({});
    }
  }, [open, contributor]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateContributor(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      if (isEditing) {
        const amountDelta = Number(form.amount) - Number(contributor.amount || 0);
        await updateContributor(contributor.id, form);
        if (contributor.cardId) {
          await syncCardWithContributor(contributor.cardId, {
            fullName: form.fullName,
            phone: form.phone,
            amount: Number(form.amount) || 0,
            invitationCode: form.invitationCode,
          });
        }
        if (amountDelta !== 0) await incrementEventStats(eventId, { totalAmount: amountDelta });
        toast.success('Contributor updated successfully.');
      } else {
        await addContributor(user.uid, eventId, form);
        await incrementEventStats(eventId, { totalContributors: 1, totalAmount: Number(form.amount) || 0 });
        toast.success('Contributor added successfully.');
      }
      onSaved?.();
      onClose();
    } catch {
      toast.error('Could not save the contributor. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit contributor' : 'Add contributor'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {isEditing ? 'Save changes' : 'Add contributor'}
          </Button>
        </>
      }
    >
      <form className="event-form" onSubmit={handleSubmit} noValidate>
        <Input label="Full name" name="fullName" placeholder="e.g. Grace Mushi" value={form.fullName} onChange={handleChange} error={errors.fullName} />
        <div className="event-form-grid">
          <Input label="Phone number" name="phone" placeholder="+255 712 345 678" value={form.phone} onChange={handleChange} error={errors.phone} />
          <Input label="Contribution amount" name="amount" type="number" min="0" placeholder="50000" value={form.amount} onChange={handleChange} error={errors.amount} />
        </div>
        <div className="event-form-grid">
          <Input
            label="Invitation code"
            name="invitationCode"
            value={form.invitationCode}
            onChange={handleChange}
            hint="Used to verify the contributor's card"
            disabled={isEditing}
          />
          {!isEditing && (
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                type="button"
                variant="secondary"
                icon={<FiRefreshCw />}
                onClick={() => setForm((current) => ({ ...current, invitationCode: generateInvitationCode() }))}
              >
                Regenerate code
              </Button>
            </div>
          )}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="notes">Notes (optional)</label>
          <textarea
            id="notes"
            name="notes"
            className="field-input"
            rows={3}
            placeholder="Any extra details about this contributor…"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
      </form>
    </Modal>
  );
}
