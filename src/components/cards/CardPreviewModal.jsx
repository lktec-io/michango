import { useEffect, useRef, useState } from 'react';
import { FiDownload, FiShare2, FiCopy, FiExternalLink } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Spinner from '../common/Spinner';
import ContributionCard from './ContributionCard';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { generateCard, getCard, recordDownload, recordShare } from '../../services/cardService';
import { incrementEventStats } from '../../services/eventService';
import { getFirestoreErrorMessage } from '../../utils/firestoreErrors';
import { downloadCard } from '../../utils/cardDownload';
import { buildCardUrl, buildWhatsAppShareUrl } from '../../utils/share';
import './CardPreviewModal.css';

const FORMATS = [
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' },
  { id: 'pdf', label: 'PDF' },
];

export default function CardPreviewModal({ open, onClose, event, contributor, onCardReady }) {
  const { user } = useAuth();
  const toast = useToast();
  const cardRef = useRef(null);

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!open || !contributor) return;

    let active = true;
    async function ensureCard() {
      setLoading(true);
      try {
        let resolved = null;
        if (contributor.cardId) {
          resolved = await getCard(contributor.cardId);
        }
        if (!resolved) {
          const cardId = await generateCard({
            ownerId: user.uid,
            eventId: event.id,
            contributor,
            templateId: event.templateId,
          });
          resolved = await getCard(cardId);
          await incrementEventStats(event.id, { totalCards: 1 });
          onCardReady?.();
        }
        if (active) setCard(resolved);
      } catch (err) {
        console.error('Failed to generate contribution card:', err);
        if (active) toast.error(getFirestoreErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    ensureCard();
    return () => {
      active = false;
    };
  }, [open, contributor, event, user, toast, onCardReady]);

  async function handleDownload(format) {
    if (!cardRef.current || !card) return;
    setDownloading(format);
    try {
      await downloadCard(cardRef.current, format, `${card.contributorName}-${event.eventName}`);
      await recordDownload(card.id, event.id, format, card.ownerId);
      toast.success(`Card downloaded as ${format.toUpperCase()}.`);
    } catch (err) {
      console.error('Failed to download contribution card:', err);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  async function handleWhatsAppShare() {
    if (!card) return;
    setSharing(true);
    try {
      const cardLink = buildCardUrl(card.id);
      const url = buildWhatsAppShareUrl({ name: card.contributorName, eventName: event.eventName, cardLink, phone: card.contributorPhone });
      window.open(url, '_blank', 'noopener,noreferrer');
      await recordShare(card.id, event.id, 'whatsapp', card.ownerId);
    } catch (err) {
      console.error('Failed to record WhatsApp share:', err);
      toast.error('Could not open WhatsApp share.');
    } finally {
      setSharing(false);
    }
  }

  async function handleCopyLink() {
    if (!card) return;
    try {
      await navigator.clipboard.writeText(buildCardUrl(card.id));
      toast.success('Card link copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy card link:', err);
      toast.error('Could not copy the link.');
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Contribution card" size="lg">
      <div className="card-preview">
        {loading ? (
          <Spinner size={40} label="Preparing the personalized card…" />
        ) : card ? (
          <>
            <div className="card-preview-stage">
              <ContributionCard ref={cardRef} event={event} card={card} />
            </div>

            <div className="card-preview-actions">
              <div className="card-preview-action-group">
                <span className="card-preview-action-label">
                  <FiDownload /> Download
                </span>
                <div className="card-preview-format-buttons">
                  {FORMATS.map((format) => (
                    <Button
                      key={format.id}
                      variant="secondary"
                      size="sm"
                      loading={downloading === format.id}
                      onClick={() => handleDownload(format.id)}
                    >
                      {format.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="card-preview-action-group">
                <span className="card-preview-action-label">
                  <FiShare2 /> Share
                </span>
                <div className="card-preview-share-buttons">
                  <Button variant="primary" size="sm" icon={<FaWhatsapp />} loading={sharing} onClick={handleWhatsAppShare}>
                    WhatsApp
                  </Button>
                  <Button variant="secondary" size="sm" icon={<FiCopy />} onClick={handleCopyLink}>
                    Copy link
                  </Button>
                  <a href={buildCardUrl(card.id)} target="_blank" rel="noopener noreferrer" className="card-preview-open-link">
                    <Button variant="ghost" size="sm" icon={<FiExternalLink />}>
                      Open card page
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-muted">Could not load the card. Please try again.</p>
        )}
      </div>
    </Modal>
  );
}
