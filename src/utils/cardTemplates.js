export const CARD_TEMPLATES = [
  {
    id: 'luxury-gold',
    name: 'Luxury Gold',
    description: 'Rich gold gradients with elegant serif typography',
    preview: 'linear-gradient(135deg, #2b1700 0%, #6b4a14 35%, #d4af37 70%, #fdf3d3 100%)',
    accent: '#d4af37',
    textColor: '#2b1700',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean lines, soft neutrals and bold sans-serif type',
    preview: 'linear-gradient(135deg, #f5f6fa 0%, #e7e9f3 50%, #d6daf0 100%)',
    accent: '#5b6cff',
    textColor: '#1f2330',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
  },
  {
    id: 'elegant-white',
    name: 'Elegant White',
    description: 'Soft whites and silver accents for a refined look',
    preview: 'linear-gradient(135deg, #ffffff 0%, #f1f3f6 45%, #dfe4ec 100%)',
    accent: '#9aa3b2',
    textColor: '#2b2f38',
    fontFamily: "'Cormorant Garamond', Georgia, serif",
  },
  {
    id: 'floral-wedding',
    name: 'Floral Wedding',
    description: 'Romantic blush tones with botanical warmth',
    preview: 'linear-gradient(135deg, #ffe3ec 0%, #ffc6d9 45%, #f8a5c2 100%)',
    accent: '#d6477e',
    textColor: '#5c1633',
    fontFamily: "'Playfair Display', Georgia, serif",
  },
  {
    id: 'graduation',
    name: 'Graduation',
    description: 'Bold academic colors with a celebratory feel',
    preview: 'linear-gradient(135deg, #0b1f3a 0%, #14366b 45%, #2f6fd1 100%)',
    accent: '#ffce54',
    textColor: '#ffffff',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
  },
  {
    id: 'kitchen-party',
    name: 'Kitchen Party',
    description: 'Vibrant playful palette for kitchen party events',
    preview: 'linear-gradient(135deg, #ff9a76 0%, #ff7eb3 50%, #b388ff 100%)',
    accent: '#ff5fa2',
    textColor: '#3a1530',
    fontFamily: "'Poppins', 'Segoe UI', sans-serif",
  },
];

export function getTemplateById(id) {
  return CARD_TEMPLATES.find((tpl) => tpl.id === id) || CARD_TEMPLATES[1];
}
