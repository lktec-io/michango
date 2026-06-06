const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

/**
 * Uploads an image file to Cloudinary using an unsigned upload preset.
 * @param {File} file - The image file to upload.
 * @param {{ folder?: string, onProgress?: (percent: number) => void }} [options]
 * @returns {Promise<{ url: string, secureUrl: string, publicId: string, width: number, height: number }>}
 */
export function uploadImage(file, options = {}) {
  const { folder, onProgress } = options;

  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(
      new Error('Cloudinary is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.')
    );
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) formData.append('folder', folder);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', UPLOAD_URL);

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
          reject(new Error(data?.error?.message || 'Image upload failed'));
        }
      } catch {
        reject(new Error('Image upload failed: invalid server response'));
      }
    };

    xhr.onerror = () => reject(new Error('Image upload failed: network error'));
    xhr.send(formData);
  });
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
