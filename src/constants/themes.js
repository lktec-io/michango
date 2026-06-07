export const THEMES = [
  {
    id: 'light',
    label: 'Light',
    mode: 'light',
    description: 'Clean and bright — the Michango default.',
    preview: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)',
  },
  {
    id: 'dark',
    label: 'Dark',
    mode: 'dark',
    description: 'Easy on the eyes in low-light environments.',
    preview: 'linear-gradient(135deg, #211f30 0%, #100f1c 100%)',
  },
  {
    id: 'nmb',
    label: 'NMB Inspired',
    mode: 'light',
    description: 'Premium banking style with bold blue gradients.',
    preview: 'linear-gradient(135deg, #1957d6 0%, #5e8bf2 100%)',
  },
  {
    id: 'emerald',
    label: 'Emerald',
    mode: 'light',
    description: 'Confident green tones for a polished business look.',
    preview: 'linear-gradient(135deg, #0f9d6b 0%, #4cc99a 100%)',
  },
  {
    id: 'royal-purple',
    label: 'Royal Purple',
    mode: 'dark',
    description: 'Deep violet hues for a luxurious, high-end feel.',
    preview: 'linear-gradient(135deg, #6d28d9 0%, #a78bfa 100%)',
  },
  {
    id: 'sunset',
    label: 'Sunset',
    mode: 'light',
    description: 'Warm orange-to-red gradients with energetic flair.',
    preview: 'linear-gradient(135deg, #f0612b 0%, #ff9466 100%)',
  },
  {
    id: 'ocean',
    label: 'Ocean',
    mode: 'light',
    description: 'Cool cyan and blue tones inspired by the coast.',
    preview: 'linear-gradient(135deg, #0891b2 0%, #67e8f9 100%)',
  },
  {
    id: 'gold',
    label: 'Gold',
    mode: 'light',
    description: 'Premium gold accents for elegant event branding.',
    preview: 'linear-gradient(135deg, #b8860b 0%, #e8c468 100%)',
  },
];

export const THEME_IDS = THEMES.map((t) => t.id);
