import React, { useState } from 'react';
import { Input } from './Input';
import { Button } from './Button';
import { validateRegisterForm, hasErrors } from '../utils/validation';
import type { RegisterFormData, RegisterValidationErrors } from '../types';

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onLogin: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSubmit, onLogin }) => {
  const [data, setData] = useState<RegisterFormData>({
    email: '',
    name: '',
    lastName: '',
    phone: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<RegisterValidationErrors>({});
  const [serverError, setServerError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const validateField = (field: keyof RegisterFormData, value: string) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    const errs = validateRegisterForm(newData);
    setErrors(prev => ({ ...prev, [field]: errs[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRegisterForm(data);
    setErrors(errs);

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
      <h1 className="auth-card__title">Regístrate</h1>
      <form className="auth-card__form" noValidate onSubmit={handleSubmit}>
        <Input
          id="register-email"
          name="email"
          type="email"
          label="Correo electrónico"
          placeholder="ejemplo@gmail.com"
          value={data.email}
          onInput={(val) => setData({ ...data, email: val })}
          onBlurCallback={(val) => validateField('email', val)}
          error={errors.email}
        />
        <Input
          id="register-name"
          name="name"
          type="text"
          label="Nombre"
          placeholder="ejemplo"
          value={data.name}
          onInput={(val) => setData({ ...data, name: val })}
          onBlurCallback={(val) => validateField('name', val)}
          error={errors.name}
        />
        <Input
          id="register-lastName"
          name="lastName"
          type="text"
          label="Apellido"
          placeholder="ejemplo"
          value={data.lastName}
          onInput={(val) => setData({ ...data, lastName: val })}
          onBlurCallback={(val) => validateField('lastName', val)}
          error={errors.lastName}
        />
        <Input
          id="register-phone"
          name="phone"
          type="text"
          label="Teléfono"
          placeholder="+123 456 789"
          value={data.phone}
          onInput={(val) => setData({ ...data, phone: val })}
          onBlurCallback={(val) => validateField('phone', val)}
          error={errors.phone}
        />
        <Input
          id="register-address"
          name="address"
          type="text"
          label="Dirección"
          placeholder="calle ejemplo avenida ejemplo"
          value={data.address}
          onInput={(val) => setData({ ...data, address: val })}
          onBlurCallback={(val) => validateField('address', val)}
          error={errors.address}
        />
        <Input
          id="register-password"
          name="password"
          type="password"
          label="Contraseña"
          value={data.password}
          onInput={(val) => setData({ ...data, password: val })}
          onBlurCallback={(val) => validateField('password', val)}
          error={errors.password}
        />
        <Input
          id="register-confirmPassword"
          name="confirmPassword"
          type="password"
          label="Confirmar contraseña"
          value={data.confirmPassword}
          onInput={(val) => setData({ ...data, confirmPassword: val })}
          onBlurCallback={(val) => validateField('confirmPassword', val)}
          error={errors.confirmPassword}
        />
        <p className="auth-card__server-error" id="register-server-error" role="alert" aria-live="assertive">
          {serverError}
        </p>
        <Button text="Registrarse" type="submit" variant="primary" loading={loading} />
      </form>
      <p className="auth-card__footer">
        <a 
          href="#" 
          className="auth-card__link"
          onClick={(e) => {
            e.preventDefault();
            onLogin();
          }}
        >
          ¿Tienes cuenta? Inicia sesión
        </a>
      </p>
    </div>
  );
};
