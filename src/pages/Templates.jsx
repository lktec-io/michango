import { useState } from 'react';
import { FiPlus, FiTrash2, FiCheck, FiImage } from 'react-icons/fi';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import ImageUploader from '../components/common/ImageUploader';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { addCustomTemplate, removeCustomTemplate } from '../services/userService';
import { getOptimizedUrl } from '../services/cloudinaryService';
import { CARD_TEMPLATES } from '../utils/cardTemplates';
import { generateCardId } from '../utils/codeGenerator';
import './Templates.css';

export default function Templates() {
  const { user, profile, refreshProfile } = useAuth();
  const toast = useToast();

  const [uploadOpen, setUploadOpen] = useState(false);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const customTemplates = profile?.customTemplates || [];

  function resetForm() {
    setName('');
    setImage(null);
  }

  async function handleSaveTemplate(event) {
    event.preventDefault();
    if (!name.trim()) {
      toast.error('Please give your template a name.');
      return;
    }
    if (!image?.url) {
      toast.error('Please upload a template image.');
      return;
    }

    setSaving(true);
    try {
      await addCustomTemplate(user.uid, {
        id: generateCardId(),
        name: name.trim(),
        imageUrl: image.url,
      });
      await refreshProfile();
      toast.success('Custom template added to your library.');
      setUploadOpen(false);
      resetForm();
    } catch {
      toast.error('Could not save the template. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await removeCustomTemplate(user.uid, deleteTarget);
      await refreshProfile();
      toast.success('Template removed from your library.');
    } catch {
      toast.error('Could not remove the template.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="templates-page">
      <div className="templates-page-header">
        <div>
          <h2>Card template library</h2>
          <p className="text-muted">Pick a built-in design when creating an event, or upload your own custom template artwork.</p>
        </div>
        <Button icon={<FiPlus />} onClick={() => setUploadOpen(true)}>
          Upload custom template
        </Button>
      </div>

      <section className="templates-section">
        <h3>Built-in templates</h3>
        <div className="templates-grid">
          {CARD_TEMPLATES.map((template, index) => (
            <article key={template.id} className="template-tile glass-panel fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
              <div className="template-tile-preview" style={{ background: template.preview, color: template.textColor, fontFamily: template.fontFamily }}>
                <span className="template-tile-badge">
                  <FiCheck /> Built-in
                </span>
                <strong>{template.name}</strong>
              </div>
              <div className="template-tile-body">
                <p>{template.description}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="templates-section">
        <h3>Your custom templates</h3>
        {customTemplates.length ? (
          <div className="templates-grid">
            {customTemplates.map((template, index) => (
              <article key={template.id} className="template-tile glass-panel fade-in-up" style={{ animationDelay: `${index * 50}ms` }}>
                <div
                  className="template-tile-preview template-tile-image"
                  style={{ backgroundImage: `url(${getOptimizedUrl(template.imageUrl, { width: 480, height: 280 })})` }}
                >
                  <span className="template-tile-badge template-tile-badge-custom">Custom</span>
                </div>
                <div className="template-tile-body template-tile-body-row">
                  <strong>{template.name}</strong>
                  <button type="button" className="template-tile-delete" onClick={() => setDeleteTarget(template)} aria-label="Remove template">
                    <FiTrash2 />
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<FiImage />}
            title="No custom templates yet"
            description="Upload your own card artwork to give your events a unique, branded look."
            action={
              <Button icon={<FiPlus />} onClick={() => setUploadOpen(true)}>
                Upload custom template
              </Button>
            }
          />
        )}
      </section>

      <Modal
        open={uploadOpen}
        onClose={() => {
          setUploadOpen(false);
          resetForm();
        }}
        title="Upload custom template"
        size="md"
      >
        <form className="template-upload-form" onSubmit={handleSaveTemplate}>
          <Input label="Template name" placeholder="e.g. Royal Burgundy" value={name} onChange={(e) => setName(e.target.value)} required />
          <ImageUploader label="Template artwork" value={image} onChange={setImage} folder="michango/templates" aspect="16/10" />
          <div className="template-upload-actions">
            <Button type="button" variant="ghost" onClick={() => setUploadOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              Save template
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this template?"
        message={`"${deleteTarget?.name || 'This template'}" will be removed from your library. Events already using it will keep their existing design.`}
        confirmLabel="Remove"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
