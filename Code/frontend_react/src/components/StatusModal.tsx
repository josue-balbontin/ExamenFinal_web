import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';

export type StatusModalType = 'success' | 'error' | 'warning' | 'info';

export interface StatusModalProps {
  type?: StatusModalType;
  title: string;
  message?: string;
  closeLabel?: string;
  onClose?: () => void;
  autoCloseMs?: number;
}

export const StatusModal: React.FC<StatusModalProps> = ({
  type = 'success',
  title,
  message = '',
  closeLabel = '',
  onClose = () => {},
  autoCloseMs,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  useEffect(() => {
    if (autoCloseMs) {
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [autoCloseMs]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`status-modal-wrapper${isClosing ? ' status-modal-wrapper--closing' : ''}`}>
      <div className="status-modal-backdrop" aria-hidden="true" onClick={handleClose}></div>
      <div className="status-modal" role="alertdialog" aria-modal="true" aria-labelledby="status-modal-title" {...(message ? { 'aria-describedby': 'status-modal-message' } : {})}>
        <div className={`status-modal__icon-wrapper status-modal__icon-wrapper--${type}`} aria-hidden="true">
          {getIcon()}
        </div>
        <h2 className="status-modal__title" id="status-modal-title">{title}</h2>
        {message && (
          <p className="status-modal__message" id="status-modal-message">{message}</p>
        )}
        <button
          ref={closeBtnRef}
          className={`status-modal__close-btn status-modal__close-btn--${type}`}
          aria-label="Cerrar"
          onClick={handleClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        {closeLabel && (
          <p className="status-modal__close-label">{closeLabel}</p>
        )}
      </div>
    </div>
  );
};

export function showStatusModal(options: StatusModalProps) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  const handleClose = () => {
    if (options.onClose) options.onClose();
    setTimeout(() => {
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    }, 300);
  };

  root.render(<StatusModal {...options} onClose={handleClose} />);
}
