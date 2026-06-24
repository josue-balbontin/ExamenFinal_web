import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ForgotPasswordForm } from '../components/ForgotPasswordForm';
import { forgotPasswordService } from '../utils/auth';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (email: string) => {
    return await forgotPasswordService(email);
  };

  const handleBackToLogin = () => {
    navigate('/login');
  };

  const handleGoToReset = (token?: string) => {
    if (token) {
      navigate(`/reset-password?token=${token}`);
    } else {
      navigate('/reset-password');
    }
  };

  return (
    <div className="page page--auth">
      <ForgotPasswordForm
        onSubmit={handleSubmit}
        onBackToLogin={handleBackToLogin}
        onGoToReset={handleGoToReset}
      />
    </div>
  );
};

