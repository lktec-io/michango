import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiDownload, FiCopy, FiHeart, FiAlertCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import ContributionCard from '../../components/cards/ContributionCard';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useToast } from '../../contexts/ToastContext';
import { getCard, recordDownload, recordShare } from '../../services/cardService';
import { getEvent } from '../../services/eventService';
import { downloadCard } from '../../utils/cardDownload';
import { buildCardUrl, buildWhatsAppShareUrl } from '../../utils/share';
import './PublicCard.css';

const FORMATS = [
  { id: 'png', label: 'PNG' },
  { id: 'jpg', label: 'JPG' },
  { id: 'pdf', label: 'PDF' },
];

export default function PublicCard() {
  const { cardId } = useParams();
  const toast = useToast();
  const cardRef = useRef(null);

  const [card, setCard] = useState(null);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setNotFound(false);
      try {
        const cardData = await getCard(cardId);
        if (!cardData) {
          if (active) setNotFound(true);
          return;
        }
        const eventData = await getEvent(cardData.eventId);
        if (active) {
          setCard(cardData);
          setEvent(eventData);
        }
      } catch (err) {
        console.error('Failed to load public contribution card:', err);
        if (active) setNotFound(true);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [cardId]);

  async function handleDownload(format) {
    if (!cardRef.current || !card) return;
    setDownloading(format);
    try {
      await downloadCard(cardRef.current, format, `${card.contributorName}-contribution-card`);
      await recordDownload(card.id, card.eventId, format, card.ownerId);
      toast.success(`Card downloaded as ${format.toUpperCase()}.`);
    } catch (err) {
      console.error('Failed to download contribution card:', err);
      toast.error('Download failed. Please try again.');
    } finally {
      setDownloading(null);
    }
  }

  async function handleWhatsAppShare() {
    if (!card || !event) return;
    setSharing(true);
    try {
      const cardLink = buildCardUrl(card.id);
      const url = buildWhatsAppShareUrl({ name: card.contributorName, eventName: event.eventName, cardLink, phone: card.contributorPhone });
      window.open(url, '_blank', 'noopener,noreferrer');
      await recordShare(card.id, card.eventId, 'whatsapp', card.ownerId);
    } catch (err) {
      console.error('Failed to record WhatsApp share:', err);
      toast.error('Could not open WhatsApp share.');
    } finally {
      setSharing(false);
    }
  }

  async function handleCopyLink() {
    try {
      await navigator.clipboard.writeText(buildCardUrl(cardId));
      toast.success('Card link copied to clipboard.');
    } catch (err) {
      console.error('Failed to copy card link:', err);
      toast.error('Could not copy the link.');
    }
  }

  return (
    <div className="public-card-page">
      <header className="public-card-header">
        <Link to="/" className="public-card-brand">
          <FiHeart /> Michango
        </Link>
      </header>

      <main className="public-card-main">
        {loading ? (
          <div className="public-card-loading">
            <Spinner size={40} label="Loading your contribution card…" />
          </div>
        ) : notFound || !card || !event ? (
          <div className="public-card-error glass-panel fade-in-up">
            <FiAlertCircle />
            <h2>Card not found</h2>
            <p className="text-muted">This contribution card link is invalid or may have been removed.</p>
          </div>
        ) : (
          <div className="public-card-content fade-in-up">
            <div className="public-card-intro">
              <span className="public-card-eyebrow">Your contribution card</span>
              <h1>Hello, {card.contributorName}!</h1>
              <p className="text-muted">
                Thank you for being part of <strong>{event.eventName}</strong>. Your personalized contribution card is ready below —
                download it or share it on WhatsApp.
              </p>
            </div>

            <div className="public-card-stage">
              <ContributionCard ref={cardRef} event={event} card={card} />
            </div>

            <div className="public-card-actions">
              <div className="public-card-action-group">
                <span className="public-card-action-label">
                  <FiDownload /> Download your card
                </span>
                <div className="public-card-buttons">
                  {FORMATS.map((format) => (
                    <Button
                      key={format.id}
                      variant="secondary"
                      loading={downloading === format.id}
                      onClick={() => handleDownload(format.id)}
                    >
                      {format.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="public-card-action-group">
                <span className="public-card-action-label">Share with friends and family</span>
                <div className="public-card-buttons">
                  <Button variant="primary" icon={<FaWhatsapp />} loading={sharing} onClick={handleWhatsAppShare}>
                    Share on WhatsApp
                  </Button>
                  <Button variant="ghost" icon={<FiCopy />} onClick={handleCopyLink}>
                    Copy link
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="public-card-footer">
        <p>Generated with Michango — Wedding Contribution Card Management</p>
      </footer>
    </div>
  );
}
