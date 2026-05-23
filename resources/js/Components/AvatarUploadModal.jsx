import { useState, useRef } from 'react';

export default function AvatarUploadModal({ onClose, onUpload }) {
  const [preview, setPreview]   = useState(null);
  const [file, setFile]         = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError]       = useState('');
  const inputRef                = useRef();

  const handleFile = (selected) => {
    if (!selected) return;
    if (!selected.type.startsWith('image/')) {
      setError('Please select an image file (JPG, PNG, WebP).');
      return;
    }
    if (selected.size > 5 * 1024 * 1024) {
      setError('File must be under 5 MB.');
      return;
    }
    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const handleSave = async () => {
    if (!file) return;
    try {
      setUploading(true);
      await onUpload(file);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>Upload profile photo</h3>
          <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="modal-body">
          {preview ? (
            <div className="preview-wrap">
              <img src={preview} alt="Preview" className="avatar-preview" />
              <button
                className="btn-text"
                onClick={() => { setPreview(null); setFile(null); }}
              >
                Choose different photo
              </button>
            </div>
          ) : (
            <div
              className="upload-zone"
              onClick={() => inputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && inputRef.current.click()}
            >
              <span className="upload-icon">☁</span>
              <p>Click to browse or drag &amp; drop</p>
              <span className="upload-hint">JPG, PNG, WebP — max 5 MB</span>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {error && <p className="field-error">{error}</p>}
        </div>

        <div className="modal-footer">
          <button className="btn-cancel" onClick={onClose} disabled={uploading}>
            Cancel
          </button>
          <button
            className="btn-save"
            onClick={handleSave}
            disabled={!file || uploading}
          >
            {uploading ? 'Saving…' : 'Save photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
