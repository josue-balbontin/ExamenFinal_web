import React, { useState } from 'react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onInput'> {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  error?: string;
  onInput?: (value: string) => void;
  onBlurCallback?: (value: string) => void; // renamed to not conflict with React's onBlur
}

export const Input: React.FC<InputProps> = ({
  id,
  name,
  type,
  label,
  value,
  placeholder,
  error,
  onInput,
  onBlurCallback,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const isPassword = type === 'password';
  const currentType = isPassword ? (isPasswordVisible ? 'text' : 'password') : type;

  return (
    <div className={`form-field${error ? ' form-field--error' : ''}`}>
      <label className="form-field__label" htmlFor={id}>
        {label}
      </label>
      <div className={`form-field__input-wrapper${isPassword ? ' form-field__input-wrapper--password' : ''}`}>
        <input
          className="form-field__input"
          id={id}
          name={name}
          type={currentType}
          value={value}
          placeholder={placeholder || ''}
          autoComplete={isPassword ? 'current-password' : 'email'}
          onChange={(e) => onInput && onInput(e.target.value)}
          onBlur={(e) => onBlurCallback && onBlurCallback(e.target.value)}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="form-field__toggle-visibility"
            aria-label={isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={0}
            onClick={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <svg
              className="form-field__eye-icon form-field__eye-icon--show"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ display: isPasswordVisible ? 'none' : 'block' }}
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <svg
              className="form-field__eye-icon form-field__eye-icon--hide"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ display: isPasswordVisible ? 'block' : 'none' }}
            >
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </button>
        )}
      </div>
      <span className="form-field__error" role="alert" aria-live="polite">
        {error || ''}
      </span>
    </div>
  );
};
