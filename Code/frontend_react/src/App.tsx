import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { globalStore, useStore } from './storeInstance';
import { fetchCart } from './utils/cartServices';

// Import Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { HomePage } from './pages/HomePage';
import { ProfilePage } from './pages/ProfilePage';
import { CheckoutPage } from './pages/CheckoutPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

// Import Styles
import './styles/base.css';
import './styles/index.css';
import './styles/layout.css';
import './styles/responsive.css';
import './styles/auth-card.css';
import './styles/btn.css';
import './styles/form-field.css';
import './styles/navbar.css';
import './styles/sidebar.css';
import './styles/home-page.css';
import './styles/product-card.css';
import './styles/product-details.css';
import './styles/cart-drawer.css';
import './styles/notification-drawer.css';
import './styles/checkout.css';
import './styles/profile.css';
import './styles/my-store.css';
import './styles/dashboard-card.css';
import './styles/edit-profile-modal.css';
import './styles/status-modal.css';

const RouteTracker = () => {
  const location = useLocation();
  useEffect(() => {
    globalStore.setState({ currentRoute: location.pathname as any });
  }, [location]);
  return null;
};

const App: React.FC = () => {
  const { auth } = useStore();

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchCart(globalStore).catch((err) =>
        console.error('Error fetching cart on init:', err)
      );
    }
  }, [auth.isAuthenticated]);

  return (
    <Router>
      <RouteTracker />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/product" element={<ProductDetailPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
