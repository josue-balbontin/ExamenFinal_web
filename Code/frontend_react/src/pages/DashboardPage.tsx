import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { logoutService } from '../utils/auth';
import { globalStore, useStore } from '../storeInstance';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const state = useStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      navigate('/login');
    }
  }, [state.auth.isAuthenticated, navigate]);

  if (!state.auth.isAuthenticated) {
    return <div />;
  }

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logoutService();
    } catch (err) {
      console.error(err);
    } finally {
      globalStore.setState({
        auth: {
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        },
      });
      navigate('/login');
      setLoading(false);
    }
  };

  const displayName = state.auth.user?.name ?? state.auth.user?.email ?? '';

  return (
    <div className="page page--dashboard">
      <div className="dashboard-card">
        <h1 className="dashboard-card__title">¡Bienvenido, {displayName}!</h1>
        <p className="dashboard-card__subtitle">Has iniciado sesión correctamente.</p>
        <Button
          text="Cerrar sesión"
          variant="ghost"
          onClick={handleLogout}
          loading={loading}
        />
      </div>
    </div>
  );
};

