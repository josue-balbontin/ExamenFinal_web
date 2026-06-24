import React, { useState, useEffect, useRef } from 'react';

export interface SellerRequestModalProps {
  onClose: () => void;
}

export const SellerRequestModal: React.FC<SellerRequestModalProps> = ({ onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('URL de Documentación (Drive, Dropbox, etc.) es requerido.');
      return;
    }
    setError('');
    setIsSubmitting(true);
    
    setTimeout(() => {
      alert('¡Solicitud enviada con éxito! (mock)');
      handleClose();
    }, 600);
  };

  return (
    <div className={`edit-profile-wrapper${isClosing ? ' edit-profile-wrapper--closing' : ''}`}>
      <div className="edit-profile-backdrop" aria-hidden="true" onClick={handleClose}></div>
      <div className="edit-profile-modal" role="dialog" aria-modal="true" aria-labelledby="seller-request-title">
        <div className="edit-profile-modal__header">
          <h2 className="edit-profile-modal__title" id="seller-request-title">Solicitud de Vendedor</h2>
          <button className="edit-profile-modal__close" aria-label="Cerrar" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <form className="edit-profile-modal__form" noValidate onSubmit={handleSubmit}>
          <div className="edit-profile-modal__grid">
            <div className="edit-profile-modal__field edit-profile-modal__field--full">
              <label className="edit-profile-modal__label" htmlFor="sr-doc-url">URL de Documentación (Drive, Dropbox, etc.) *</label>
              <input
                ref={firstInputRef}
                className={`edit-profile-modal__input${error ? ' edit-profile-modal__input--error' : ''}`}
                id="sr-doc-url"
                name="documentacion_url"
                type="url"
                placeholder="https://..."
                aria-required="true"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onBlur={() => {
                  if (!url.trim()) setError('URL de Documentación (Drive, Dropbox, etc.) es requerido.');
                  else setError('');
                }}
              />
              <span className="edit-profile-modal__field-error" id="sr-doc-url-error" role="alert" aria-live="polite">
                {error}
              </span>
            </div>
          </div>
          <p className="edit-profile-modal__server-error" id="sr-server-error" role="alert" aria-live="assertive"></p>
          <div className="edit-profile-modal__actions" style={{ marginTop: '1rem' }}>
            <button type="button" className="edit-profile-modal__cancel-btn" onClick={handleClose}>Cancelar</button>
            <button type="submit" className="edit-profile-modal__save-btn" id="sr-submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Enviando…' : 'Enviar solicitud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
