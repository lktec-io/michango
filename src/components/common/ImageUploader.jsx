import { useEffect, useRef, useState } from 'react';
import { FiUploadCloud, FiX, FiImage, FiAlertTriangle } from 'react-icons/fi';
import { uploadImage, getOptimizedUrl } from '../../services/cloudinaryService';
import { useToast } from '../../contexts/ToastContext';
import './ImageUploader.css';

const MAX_SIZE_MB = 8;

export default function ImageUploader({ label, value, onChange, folder, aspect = '16/9' }) {
  const inputRef = useRef(null);
  const toast = useToast();
  const [progress, setProgress] = useState(null);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [value?.url]);

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
      return;
    }

    setProgress(0);
    try {
      const result = await uploadImage(file, { folder, onProgress: setProgress });
      onChange({ url: result.secureUrl, publicId: result.publicId });
      toast.success('Image uploaded successfully.');
    } catch (error) {
      toast.error(error.message || 'Image upload failed. Please try again.');
    } finally {
      setProgress(null);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    handleFile(file);
  }

  return (
    <div className="image-uploader">
      {label && <span className="field-label">{label}</span>}
      <div
        className={`image-uploader-dropzone ${value?.url ? 'has-image' : ''}`}
        style={{ aspectRatio: aspect }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="visually-hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        {value?.url ? (
          <>
            {imageFailed ? (
              <div className="image-uploader-placeholder">
                <FiAlertTriangle />
                <p>This image could not be loaded</p>
                <span>The file may have been removed. Try uploading again.</span>
              </div>
            ) : (
              <img
                src={getOptimizedUrl(value.url, { width: 640 })}
                alt=""
                onError={() => setImageFailed(true)}
              />
            )}
            <button
              type="button"
              className="image-uploader-remove"
              onClick={(event) => {
                event.stopPropagation();
                onChange(null);
              }}
              aria-label="Remove image"
            >
              <FiX />
            </button>
          </>
        ) : (
          <div className="image-uploader-placeholder">
            {progress === null ? <FiUploadCloud /> : <FiImage />}
            <p>{progress === null ? 'Click or drag an image to upload' : `Uploading… ${progress}%`}</p>
            <span>PNG, JPG up to {MAX_SIZE_MB}MB</span>
          </div>
        )}
        {progress !== null && (
          <div className="image-uploader-progress">
            <span style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </div>
  );
}
