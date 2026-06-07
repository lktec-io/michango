const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
const UPLOAD_TIMEOUT_MS = 30000;
const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 1200;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uploadOnce(file, { folder, onProgress }) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_URL);
    xhr.timeout = UPLOAD_TIMEOUT_MS;

    xhr.upload.onprogress = (event) => {
      if (onProgress && event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            url: data.url,
            secureUrl: data.secure_url,
            publicId: data.public_id,
            width: data.width,
            height: data.height,
          });
        } else {
          const message = data?.error?.message || 'Image upload failed';
          const error = new Error(message);
          error.retryable = xhr.status >= 500;
          reject(error);
        }
      } catch (err) {
        console.error('Cloudinary returned an unparseable response:', err);
        reject(new Error('Image upload failed: invalid server response'));
      }
    };

    xhr.onerror = () => {
      const error = new Error('Image upload failed: network error');
      error.retryable = true;
      reject(error);
    };
    xhr.ontimeout = () => {
      const error = new Error('Image upload timed out. Please check your connection and try again.');
      error.retryable = true;
      reject(error);
    };
    xhr.send(formData);
  });
}

/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * Retries transient failures (network errors, timeouts, 5xx responses) with
 * a short backoff before giving up.
 * @param {File} file - The image file to upload.
 * @param {{ folder?: string, onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ url: string, secureUrl: string, publicId: string, width: number, height: number }>}
 */
export async function uploadImage(file, options = {}) {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
  }

  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return await uploadOnce(file, options);
    } catch (error) {
      lastError = error;
      if (!error.retryable || attempt === MAX_ATTEMPTS) throw error;
      await delay(RETRY_DELAY_MS * attempt);
    }
  }
  throw lastError;
}

/**
 * Builds an optimized Cloudinary delivery URL with on-the-fly transformations.
 * @param {string} url - Original Cloudinary secure URL.
 * @param {{ width?: number, height?: number, crop?: string, quality?: string }} [transform]
 */
export function getOptimizedUrl(url, transform = {}) {
  if (!url || !url.includes('/upload/')) return url;
  const { width, height, crop = 'fill', quality = 'auto' } = transform;

  const parts = [`f_auto`, `q_${quality}`];
  if (width) parts.push(`w_${width}`);
  if (height) parts.push(`h_${height}`);
  if (width || height) parts.push(`c_${crop}`);

  return url.replace('/upload/', `/upload/${parts.join(',')}/`);
}
