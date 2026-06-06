export function buildCardUrl(cardId) {
  return `${window.location.origin}/card/${cardId}`;
}

export function buildWhatsAppMessage({ name, eventName, cardLink }) {
  return `Hello ${name},\n\nYour contribution card for ${eventName} is ready.\n\nView Card:\n${cardLink}`;
}

export function buildWhatsAppShareUrl({ name, eventName, cardLink, phone }) {
  const message = buildWhatsAppMessage({ name, eventName, cardLink });
  const digits = String(phone || '').replace(/[^\d+]/g, '');
  const base = digits ? `https://wa.me/${digits.replace(/^\+/, '')}` : 'https://wa.me/';
  return `${base}?text=${encodeURIComponent(message)}`;
}
