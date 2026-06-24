import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ResetPasswordForm } from '../components/ResetPasswordForm';
import { resetPasswordService } from '../utils/auth';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialToken = searchParams.get('token') || undefined;

  const handleSubmit = async (token: string, newPassword: string) => {
    await resetPasswordService(token, newPassword);
    alert('Contraseña actualizada correctamente.');
    navigate('/login');
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="page page--auth">
      <ResetPasswordForm
        initialToken={initialToken}
        onSubmit={handleSubmit}
        onBackToLogin={handleBackToLogin}
      />
    </div>
  );
};

