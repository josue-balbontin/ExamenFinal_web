import React from 'react';

export type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  variant?: ButtonVariant;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  text,
  variant = 'primary',
  type = 'button',
  disabled = false,
  loading = false,
  onClick,
  ...props
}) => {
  return (
    <button
      className={`btn btn--${variant}`}
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <>
          <span className="btn__spinner" aria-hidden="true"></span>
          <span className="btn__text">Cargando…</span>
        </>
      ) : (
        <span className="btn__text">{text}</span>
      )}
    </button>
  );
};
