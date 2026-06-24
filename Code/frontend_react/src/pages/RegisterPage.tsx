import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '../components/RegisterForm';
import { registerService, loginService } from '../utils/auth';
import { fetchCart } from '../utils/cartServices';
import { globalStore } from '../storeInstance';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSubmit = async (data: any) => {
    globalStore.setState({
      auth: { ...globalStore.getState().auth, loading: true, error: null },
    });
    
    const user = await registerService(data);

    try {
      await loginService({ email: data.email, password: data.password });
    } catch (err) {
      console.error('Error en auto-login:', err);
    }

    globalStore.setState({
      auth: { isAuthenticated: true, user, loading: false, error: null },
    });
    
    await fetchCart(globalStore);
    navigate('/home');
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="page page--auth">
      <RegisterForm
        onSubmit={handleSubmit}
        onLogin={handleLogin}
      />
    </div>
  );
};

