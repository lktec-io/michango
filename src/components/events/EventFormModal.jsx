import { useEffect, useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import ImageUploader from '../common/ImageUploader';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createEvent, updateEvent } from '../../services/eventService';
import { validateEvent, hasErrors } from '../../utils/validators';
import { CARD_TEMPLATES } from '../../utils/cardTemplates';
import './EventFormModal.css';

const EMPTY_FORM = {
  eventName: '',
  brideName: '',
  groomName: '',
  eventDate: '',
  location: '',
  description: '',
  templateId: 'modern-minimal',
};

function toFormState(event) {
  if (!event) return EMPTY_FORM;
  return {
    eventName: event.eventName || '',
    brideName: event.brideName || '',
    groomName: event.groomName || '',
    eventDate: event.eventDate || '',
    location: event.location || '',
    description: event.description || '',
    templateId: event.templateId || 'modern-minimal',
  };
}

export default function EventFormModal({ open, onClose, event, onSaved }) {
  const { user } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [banner, setBanner] = useState(null);
  const [template, setTemplate] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const isEditing = Boolean(event);

  useEffect(() => {
    if (open) {
      setForm(toFormState(event));
      setBanner(event?.bannerUrl ? { url: event.bannerUrl, publicId: event.bannerPublicId } : null);
      setTemplate(event?.templateUrl ? { url: event.templateUrl, publicId: event.templatePublicId } : null);
      setErrors({});
    }
  }, [open, event]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validateEvent(form);
    setErrors(validationErrors);
    if (hasErrors(validationErrors)) return;

    setSubmitting(true);
    try {
      const payload = {
        ...form,
        bannerUrl: banner?.url || '',
        bannerPublicId: banner?.publicId || '',
        templateUrl: template?.url || '',
        templatePublicId: template?.publicId || '',
      };

      if (isEditing) {
        await updateEvent(event.id, payload);
        toast.success('Event updated successfully.');
      } else {
        await createEvent(user.uid, payload);
        toast.success('Event created successfully.');
      }
      onSaved?.();
      onClose();
    } catch {
      toast.error('Could not save the event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit event' : 'Create new event'}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} loading={submitting}>
            {isEditing ? 'Save changes' : 'Create event'}
          </Button>
        </>
      }
    >
      <form className="event-form" onSubmit={handleSubmit} noValidate>
        <div className="event-form-grid">
          <Input label="Event name" name="eventName" placeholder="Amani & Joseph's Wedding" value={form.eventName} onChange={handleChange} error={errors.eventName} />
          <Input label="Event date" name="eventDate" type="date" value={form.eventDate} onChange={handleChange} error={errors.eventDate} />
          <Input label="Bride's name" name="brideName" placeholder="Amani" value={form.brideName} onChange={handleChange} error={errors.brideName} />
          <Input label="Groom's name" name="groomName" placeholder="Joseph" value={form.groomName} onChange={handleChange} error={errors.groomName} />
        </div>
        <Input label="Event location" name="location" placeholder="Dar es Salaam, Tanzania" value={form.location} onChange={handleChange} error={errors.location} />
        <div className="field">
          <label className="field-label" htmlFor="description">Event description</label>
          <textarea
            id="description"
            name="description"
            className="field-input"
            placeholder="Share a little about the celebration…"
            rows={3}
            value={form.description}
            onChange={handleChange}
          />
        </div>

        <div className="event-form-grid">
          <ImageUploader label="Event banner image" value={banner} onChange={setBanner} folder="michango/banners" />
          <ImageUploader label="Card template image (optional)" value={template} onChange={setTemplate} folder="michango/templates" aspect="3/4" />
        </div>

        <div className="field">
          <span className="field-label">Card template style</span>
          <div className="template-picker">
            {CARD_TEMPLATES.map((tpl) => (
              <button
                type="button"
                key={tpl.id}
                className={`template-chip ${form.templateId === tpl.id ? 'active' : ''}`}
                style={{ background: tpl.preview }}
                onClick={() => setForm((current) => ({ ...current, templateId: tpl.id }))}
                title={tpl.name}
              >
                <span>{tpl.name}</span>
              </button>
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
