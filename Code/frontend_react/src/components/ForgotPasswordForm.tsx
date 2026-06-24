import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { validateEmail } from '../utils/validation';

export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<string | null>;
  onBackToLogin: () => void;
  onGoToReset: (token?: string) => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSubmit, onBackToLogin, onGoToReset }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [retrievedToken, setRetrievedToken] = useState<string | null>(null);
  const [showGoToReset, setShowGoToReset] = useState(false);

  const validateField = (value: string) => {
    setEmail(value);
    const err = validateEmail(value);
    setError(err);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateEmail(email.trim());
    setError(err);

    if (err) return;

    setServerError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const token = await onSubmit(email.trim());
      if (token) {
        setRetrievedToken(token);
        setSuccessMessage('¡Token generado con éxito para desarrollo local!');
        setShowGoToReset(true);
      } else {
        setSuccessMessage('Si tu correo está registrado, recibirás un enlace de recuperación.');
        setShowGoToReset(true);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Recuperar contraseña</h1>
      <p className="auth-card__subtitle">
        Ingresa tu correo y te enviaremos un enlace temporal para recuperar tu contraseña.
      </p>
      <form className="auth-card__form" noValidate onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Correo"
          placeholder="ejemplo@gmail.com"
          value={email}
          onInput={(val) => setEmail(val)}
          onBlurCallback={(val) => validateField(val)}
          error={error}
        />
        <p className="auth-card__server-error" id="server-error" role="alert" aria-live="assertive">
          {serverError}
        </p>
        <p className="auth-card__success-message" id="success-message" style={{ color: 'green', marginBottom: '1rem', textAlign: 'center' }}>
          {successMessage}
        </p>
        
        {!showGoToReset && (
          <Button text="Enviar instrucciones" type="submit" variant="primary" loading={loading} />
        )}
        
        {showGoToReset && (
          <div style={{ marginTop: '1rem' }}>
            <Button
              text="Continuar a Restablecer Contraseña"
              type="button"
              variant="primary"
              onClick={() => onGoToReset(retrievedToken || undefined)}
            />
          </div>
        )}
      </form>
      <p className="auth-card__footer">
        <a 
          href="#" 
          className="auth-card__link"
          onClick={(e) => {
            e.preventDefault();
            onBackToLogin();
          }}
        >
          Volver al inicio de sesión
        </a>
      </p>
    </div>
  );
};
