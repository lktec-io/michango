const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

/** Generates a short, human-friendly invitation code, e.g. "WX7K-9PQR". */
export function generateInvitationCode() {
  let code = '';
  for (let i = 0; i < 8; i += 1) {
    if (i === 4) code += '-';
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

/** Generates a unique, URL-safe card identifier. */
export function generateCardId() {
  const random = Math.random().toString(36).slice(2, 10);
  const timestamp = Date.now().toString(36);
  return `${timestamp}${random}`;
}
