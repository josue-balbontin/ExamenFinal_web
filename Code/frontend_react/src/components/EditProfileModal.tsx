import React, { useState, useEffect, useRef } from 'react';
import { useStore, globalStore } from '../storeInstance';

export interface EditProfileModalProps {
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ onClose }) => {
  const state = useStore();
  const user = state.auth.user!;
  const [isClosing, setIsClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: user.name ?? '',
    lastName: user.lastName ?? '',
    email: user.email ?? '',
    phone: user.phone ?? '',
    address: user.address ?? ''
  });
  
  const [passwords, setPasswords] = useState({
    new: '',
    confirm: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pwVisible, setPwVisible] = useState({ new: false, confirm: false });
  const [serverError] = useState('');
  
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 50);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => onClose(), 200);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePwChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const validatePasswords = () => {
    const newVal = passwords.new;
    const confirmVal = passwords.confirm;
    
    if (!newVal && !confirmVal) return true;
    
    let valid = true;
    const newErrors = { ...errors };
    
    if (newVal && newVal.length < 6) {
      newErrors.pw = 'La nueva contraseña debe tener al menos 6 caracteres.';
      valid = false;
    } else if (newVal && newVal !== confirmVal) {
      newErrors.pw = 'Las contraseñas no coinciden.';
      valid = false;
    } else {
      delete newErrors.pw;
    }
    
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let valid = true;
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nombre es requerido.';
      valid = false;
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Correo es requerido.';
      valid = false;
    }
    
    if (!validatePasswords()) {
      valid = false;
    } else if (errors.pw) {
      newErrors.pw = errors.pw;
    }
    
    setErrors(newErrors);
    
    if (!valid) return;

    setIsSubmitting(true);
    
    setTimeout(() => {
      const currentAuth = globalStore.getState().auth;
      globalStore.setState({
        auth: { ...currentAuth, user: { ...currentAuth.user!, ...formData } },
      });
      handleClose();
    }, 600);
  };

  const fullName = [formData.name, formData.lastName].filter(Boolean).join(' ') || 'U';
  const initials = fullName.split(' ').slice(0, 2).map((w) => w[0].toUpperCase()).join('');

  const EyeIcon = ({ state }: { state: 'show' | 'hide' }) => {
    if (state === 'show') {
      return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
    }
    return <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  };

  return (
    <div className={`edit-profile-wrapper${isClosing ? ' edit-profile-wrapper--closing' : ''}`}>
      <div className="edit-profile-backdrop" aria-hidden="true" onClick={handleClose}></div>
      <div className="edit-profile-modal" role="dialog" aria-modal="true" aria-labelledby="edit-profile-title">
        <div className="edit-profile-modal__header">
          <h2 className="edit-profile-modal__title" id="edit-profile-title">Editar Perfil</h2>
          <button className="edit-profile-modal__close" aria-label="Cerrar" onClick={handleClose}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        
        <div className="edit-profile-modal__avatar-section">
          <div className="edit-profile-modal__avatar-preview" id="avatar-preview">{initials}</div>
          <p className="edit-profile-modal__avatar-hint">Las iniciales se generan automáticamente con tu nombre</p>
        </div>

        <form className="edit-profile-modal__form" noValidate onSubmit={handleSubmit}>
          <div className="edit-profile-modal__grid">
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="ep-name">Nombre *</label>
              <input ref={firstInputRef} className={`edit-profile-modal__input${errors.name ? ' edit-profile-modal__input--error' : ''}`} id="ep-name" name="name" type="text" placeholder="Tu nombre" aria-required="true" value={formData.name} onChange={handleInputChange} onBlur={() => !formData.name.trim() ? setErrors({...errors, name: 'Nombre es requerido.'}) : setErrors({...errors, name: ''})} />
              <span className="edit-profile-modal__field-error" id="ep-name-error" role="alert" aria-live="polite">{errors.name}</span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="ep-lastName">Apellido</label>
              <input className="edit-profile-modal__input" id="ep-lastName" name="lastName" type="text" placeholder="Tu apellido" value={formData.lastName} onChange={handleInputChange} />
              <span className="edit-profile-modal__field-error" id="ep-lastName-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="ep-email">Correo *</label>
              <input className={`edit-profile-modal__input${errors.email ? ' edit-profile-modal__input--error' : ''}`} id="ep-email" name="email" type="email" placeholder="tu@email.com" aria-required="true" value={formData.email} onChange={handleInputChange} onBlur={() => !formData.email.trim() ? setErrors({...errors, email: 'Correo es requerido.'}) : setErrors({...errors, email: ''})} />
              <span className="edit-profile-modal__field-error" id="ep-email-error" role="alert" aria-live="polite">{errors.email}</span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="ep-phone">Teléfono</label>
              <input className="edit-profile-modal__input" id="ep-phone" name="phone" type="tel" placeholder="+123 456 789" value={formData.phone} onChange={handleInputChange} />
              <span className="edit-profile-modal__field-error" id="ep-phone-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div className="edit-profile-modal__field edit-profile-modal__field--full">
              <label className="edit-profile-modal__label" htmlFor="ep-address">Dirección</label>
              <input className="edit-profile-modal__input" id="ep-address" name="address" type="text" placeholder="Tu dirección" value={formData.address} onChange={handleInputChange} />
              <span className="edit-profile-modal__field-error" id="ep-address-error" role="alert" aria-live="polite"></span>
            </div>
          </div>
          
          <div className="edit-profile-modal__divider"></div>
          <h3 className="edit-profile-modal__section-title">Cambiar contraseña</h3>
          <p className="edit-profile-modal__section-hint">Deja estos campos vacíos si no quieres cambiar tu contraseña.</p>
          
          <div className="edit-profile-modal__grid edit-profile-modal__grid--pw">
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="ep-new-pw">Nueva contraseña</label>
              <div className="edit-profile-modal__pw-wrapper">
                <input className={`edit-profile-modal__input edit-profile-modal__input--pw${errors.pw && passwords.new.length < 6 ? ' edit-profile-modal__input--error' : ''}`} id="ep-new-pw" name="new" type={pwVisible.new ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" autoComplete="new-password" value={passwords.new} onChange={handlePwChange} />
                <button type="button" className="edit-profile-modal__pw-toggle" aria-label={pwVisible.new ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setPwVisible({...pwVisible, new: !pwVisible.new})}>
                  <EyeIcon state={pwVisible.new ? 'hide' : 'show'} />
                </button>
              </div>
              <span className="edit-profile-modal__field-error" id="ep-new-pw-error" role="alert" aria-live="polite"></span>
            </div>
            
            <div className="edit-profile-modal__field">
              <label className="edit-profile-modal__label" htmlFor="ep-confirm-pw">Confirmar contraseña</label>
              <div className="edit-profile-modal__pw-wrapper">
                <input className={`edit-profile-modal__input edit-profile-modal__input--pw${errors.pw && passwords.new !== passwords.confirm ? ' edit-profile-modal__input--error' : ''}`} id="ep-confirm-pw" name="confirm" type={pwVisible.confirm ? 'text' : 'password'} placeholder="Repite la nueva contraseña" autoComplete="new-password" value={passwords.confirm} onChange={handlePwChange} />
                <button type="button" className="edit-profile-modal__pw-toggle" aria-label={pwVisible.confirm ? "Ocultar contraseña" : "Mostrar contraseña"} onClick={() => setPwVisible({...pwVisible, confirm: !pwVisible.confirm})}>
                  <EyeIcon state={pwVisible.confirm ? 'hide' : 'show'} />
                </button>
              </div>
              <span className="edit-profile-modal__field-error" id="ep-confirm-pw-error" role="alert" aria-live="polite"></span>
            </div>
          </div>
          
          <p className="edit-profile-modal__field-error" id="ep-pw-error" role="alert" aria-live="assertive">{errors.pw}</p>
          <p className="edit-profile-modal__server-error" id="ep-server-error" role="alert" aria-live="assertive">{serverError}</p>
          
          <div className="edit-profile-modal__actions">
            <button type="button" className="edit-profile-modal__cancel-btn" onClick={handleClose}>Cancelar</button>
            <button type="submit" className="edit-profile-modal__save-btn" id="ep-save-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
