import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { loginService } from '../utils/auth';
import { fetchCart } from '../utils/cartServices';
import { globalStore } from '../storeInstance';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    globalStore.setState({
      auth: { ...globalStore.getState().auth, loading: true, error: null },
    });
    const user = await loginService(data);
    globalStore.setState({
      auth: { isAuthenticated: true, user, loading: false, error: null },
    });
    await fetchCart(globalStore);
    navigate('/home');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <div className="page page--auth">
      <LoginForm
        onSubmit={handleSubmit}
        onForgotPassword={handleForgotPassword}
        onRegister={handleRegister}
      />
    </div>
  );
};

