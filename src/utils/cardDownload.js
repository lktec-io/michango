import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const PIXEL_RATIO = 3;

function triggerDownload(href, filename) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

async function captureNode(node, mimeFn) {
  return mimeFn(node, {
    pixelRatio: PIXEL_RATIO,
    cacheBust: true,
    backgroundColor: '#ffffff',
  });
}

export async function downloadCardAsPng(node, filename) {
  const dataUrl = await captureNode(node, toPng);
  triggerDownload(dataUrl, `${filename}.png`);
}

export async function downloadCardAsJpg(node, filename) {
  const dataUrl = await captureNode(node, (n, opts) => toJpeg(n, { ...opts, quality: 0.95 }));
  triggerDownload(dataUrl, `${filename}.jpg`);
}

export async function downloadCardAsPdf(node, filename) {
  const dataUrl = await captureNode(node, toPng);
  const { width, height } = node.getBoundingClientRect();

  const orientation = width >= height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  pdf.save(`${filename}.pdf`);
}

export async function downloadCard(node, format, filename = 'contribution-card') {
  const safeName = filename.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  if (format === 'png') return downloadCardAsPng(node, safeName);
  if (format === 'jpg') return downloadCardAsJpg(node, safeName);
  if (format === 'pdf') return downloadCardAsPdf(node, safeName);
  throw new Error(`Unsupported download format: ${format}`);
}
