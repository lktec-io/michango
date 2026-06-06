import { toPng, toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

const PIXEL_RATIO = 3;

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(header)?.[1] || 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Saves a blob to the user's device. iOS/Android browsers don't reliably
 * support `<a download>` for blob/data URIs, so on devices that expose the
 * Web Share API with file support we hand the file to the native share sheet
 * (which includes a "Save to Files/Photos" option). Desktop browsers fall
 * back to a normal anchor-click download.
 */
async function saveBlob(blob, filename) {
  const file = new File([blob], filename, { type: blob.type });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return;
    } catch (error) {
      if (error?.name === 'AbortError') return;
      // Fall through to the anchor-download approach if sharing fails.
    }
  }

  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } finally {
    URL.revokeObjectURL(url);
  }
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
  await saveBlob(dataUrlToBlob(dataUrl), `${filename}.png`);
}

export async function downloadCardAsJpg(node, filename) {
  const dataUrl = await captureNode(node, (n, opts) => toJpeg(n, { ...opts, quality: 0.95 }));
  await saveBlob(dataUrlToBlob(dataUrl), `${filename}.jpg`);
}

export async function downloadCardAsPdf(node, filename) {
  const dataUrl = await captureNode(node, toPng);
  const { width, height } = node.getBoundingClientRect();

  const orientation = width >= height ? 'landscape' : 'portrait';
  const pdf = new jsPDF({ orientation, unit: 'px', format: [width, height] });
  pdf.addImage(dataUrl, 'PNG', 0, 0, width, height);
  const blob = pdf.output('blob');
  await saveBlob(blob, `${filename}.pdf`);
}

export async function downloadCard(node, format, filename = 'contribution-card') {
  const safeName = filename.replace(/[^a-z0-9-_]+/gi, '-').toLowerCase();
  if (format === 'png') return downloadCardAsPng(node, safeName);
  if (format === 'jpg') return downloadCardAsJpg(node, safeName);
  if (format === 'pdf') return downloadCardAsPdf(node, safeName);
  throw new Error(`Unsupported download format: ${format}`);
}
