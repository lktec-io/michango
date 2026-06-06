import { useEffect, useState } from 'react';

/**
 * Tracks whether an image URL actually loads. Useful for elements that render
 * the image as a CSS `background-image` (where the native `<img onError>`
 * handler isn't available) so a fallback can be shown for broken/missing
 * Cloudinary assets.
 * @param {string} url
 * @returns {'idle' | 'loading' | 'loaded' | 'error'}
 */
export function useImageStatus(url) {
  const [status, setStatus] = useState(url ? 'loading' : 'idle');

  useEffect(() => {
    if (!url) {
      setStatus('idle');
      return undefined;
    }

    let active = true;
    setStatus('loading');

    const img = new Image();
    img.onload = () => {
      if (active) setStatus('loaded');
    };
    img.onerror = () => {
      if (active) setStatus('error');
    };
    img.src = url;

    return () => {
      active = false;
      img.onload = null;
      img.onerror = null;
    };
  }, [url]);

  return status;
}
