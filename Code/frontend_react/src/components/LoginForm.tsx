import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { validateLoginForm, hasErrors } from '../utils/validation';
import type { LoginFormData } from '../types';

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, onForgotPassword, onRegister }) => {
  const [data, setData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [serverError, setServerError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const validateField = (field: 'email' | 'password', value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    const errs = validateLoginForm(newData);
    setErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateLoginForm(data);
    setErrors({ email: errs.email, password: errs.password });

    if (hasErrors(errs)) return;

    setServerError('');
    setLoading(true);

    try {
      await onSubmit(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado.';
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-card">
      <h1 className="auth-card__title">Inicia sesión</h1>
      <form className="auth-card__form" noValidate onSubmit={handleSubmit}>
        <Input
          id="email"
          name="email"
          type="email"
          label="Correo"
          placeholder="ejemplo@gmail.com"
          value={data.email}
          onInput={(val) => setData({ ...data, email: val })}
          onBlurCallback={(val) => validateField('email', val)}
          error={errors.email}
        />
        <Input
          id="password"
          name="password"
          type="password"
          label="Contraseña"
          placeholder="123456"
          value={data.password}
          onInput={(val) => setData({ ...data, password: val })}
          onBlurCallback={(val) => validateField('password', val)}
          error={errors.password}
        />
        <a 
          href="#" 
          className="auth-card__link auth-card__link--right"
          onClick={(e) => {
            e.preventDefault();
            onForgotPassword();
          }}
        >
          Olvidé mi contraseña
        </a>
        <p className="auth-card__server-error" id="server-error" role="alert" aria-live="assertive">
          {serverError}
        </p>
        <Button text="Iniciar sesión" type="submit" variant="primary" loading={loading} />
      </form>
      <p className="auth-card__footer">
        ¿No tienes una cuenta?{' '}
        <a 
          href="#" 
          className="auth-card__link"
          onClick={(e) => {
            e.preventDefault();
            onRegister();
          }}
        >
          Regístrate
        </a>
      </p>
    </div>
  );
};
