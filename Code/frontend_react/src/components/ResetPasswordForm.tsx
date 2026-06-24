import React, { useState, useEffect } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { validatePassword, validateRequired } from '../utils/validation';

export interface ResetPasswordFormProps {
  onSubmit: (token: string, newPassword: string) => Promise<void>;
  onBackToLogin: () => void;
  initialToken?: string;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onSubmit, onBackToLogin, initialToken }) => {
  const [token, setToken] = useState(initialToken || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [errors, setErrors] = useState<{ token?: string; password?: string; confirmPassword?: string }>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialToken) {
      setToken(initialToken);
    }
  }, [initialToken]);

  const validateField = (field: string, value: string) => {
    let newErrors = { ...errors };
    if (field === 'token') {
      newErrors.token = validateRequired(value, 'El token');
    }
    if (field === 'password') {
      newErrors.password = validatePassword(value);
    }
    if (field === 'confirmPassword') {
      newErrors.confirmPassword = value !== password ? 'Las contraseñas no coinciden.' : undefined;
    }
    setErrors(newErrors);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const tokenVal = token.trim();
    const passVal = password;
    const confirmVal = confirmPassword;

    const tokenErr = validateRequired(tokenVal, 'El token');
    const passErr = validatePassword(passVal);
    const confirmErr = passVal !== confirmVal ? 'Las contraseñas no coinciden.' : undefined;

    setErrors({
      token: tokenErr,
      password: passErr,
      confirmPassword: confirmErr,
    });

    if (tokenErr || passErr || confirmErr) return;

    setServerError('');
    setLoading(true);

    try {
      await onSubmit(tokenVal, passVal);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Restablecer contraseña</h1>
      <p className="auth-card__subtitle">
        Ingresa el token que recibiste y tu nueva contraseña.
      </p>
      <form className="auth-card__form" noValidate onSubmit={handleSubmit}>
        <Input
          id="token"
          name="token"
          type="text"
          label="Token de recuperación"
          placeholder="Ingresa el token"
          value={token}
          onInput={(val) => {
            setToken(val);
            validateField('token', val);
          }}
          onBlurCallback={(val) => validateField('token', val)}
          error={errors.token}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Nueva contraseña"
          placeholder="Mínimo 6 caracteres"
          value={password}
          onInput={(val) => {
            setPassword(val);
            validateField('password', val);
          }}
          onBlurCallback={(val) => validateField('password', val)}
          error={errors.password}
        />
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmar contraseña"
          placeholder="Repite la nueva contraseña"
          value={confirmPassword}
          onInput={(val) => {
            setConfirmPassword(val);
            validateField('confirmPassword', val);
          }}
          onBlurCallback={(val) => validateField('confirmPassword', val)}
          error={errors.confirmPassword}
        />
        <p className="auth-card__server-error" id="server-error" role="alert" aria-live="assertive">
          {serverError}
        </p>
        <Button text="Restablecer contraseña" type="submit" variant="primary" loading={loading} />
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
