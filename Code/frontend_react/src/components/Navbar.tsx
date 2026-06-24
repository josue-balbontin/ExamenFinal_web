import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore, globalStore } from '../storeInstance';

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = useStore();
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [localSearchQuery, setLocalSearchQuery] = useState(state.searchQuery);

  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalSearchQuery(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      globalStore.setState({ searchQuery: val });
    }, 350);
  };

  const unreadCount = state.notifications.filter((n) => !n.read).length;
  const cartCount = state.cart.reduce((s, i) => s + i.cantidad, 0);

  const toggleNotif = () => {
    const { notifOpen, cartOpen } = globalStore.getState();
    globalStore.setState({
      notifOpen: !notifOpen,
      cartOpen: notifOpen ? cartOpen : false,
    });
  };

  const toggleCart = () => {
    const { cartOpen, notifOpen } = globalStore.getState();
    globalStore.setState({
      cartOpen: !cartOpen,
      notifOpen: cartOpen ? notifOpen : false,
    });
  };

  const handleUserClick = () => {
    if (state.auth.isAuthenticated) {
      navigate('/profile');
    } else {
      navigate('/login');
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val) {
      localStorage.setItem('region', val);
    } else {
      localStorage.removeItem('region');
    }
    // Update global store
    globalStore.setState({ region: val || 'Local' } as any);
    
    // Instead of forcing a reload, re-navigate to the current path to mimic the original behavior
    navigate(location.pathname);
  };

  const savedRegion = localStorage.getItem('region') || '';

  return (
    <nav className="navbar">
      <a
        className="navbar__logo"
        href="#"
        aria-label="MarketPlace inicio"
        onClick={(e) => {
          e.preventDefault();
          navigate('/home');
        }}
      >
        <svg
          className="navbar__logo-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 01-8 0" />
        </svg>
        <span className="navbar__logo-text">MarketPlace</span>
      </a>

      <div className="navbar__search">
        <svg
          className="navbar__search-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          className="navbar__search-input"
          type="search"
          placeholder="Buscar en MarketPlace"
          aria-label="Buscar productos"
          value={localSearchQuery}
          onChange={handleSearchInput}
        />
      </div>

      <div className="navbar__actions">
        <select
          className="navbar__region-selector"
          aria-label="Seleccionar región"
          value={savedRegion}
          onChange={handleRegionChange}
        >
          <option value="">Local (Auto)</option>
          <option value="BO">Bolivia (BO)</option>
          <option value="PE">Perú (PE)</option>
          <option value="AR">Argentina (AR)</option>
          <option value="CL">Chile (CL)</option>
          <option value="US">EE.UU. (US)</option>
        </select>

        <button
          className="navbar__icon-btn"
          aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
          onClick={toggleNotif}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 01-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span className="navbar__badge navbar__badge--notif" aria-hidden="true">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          className="navbar__icon-btn"
          aria-label={`Carrito, ${cartCount} productos`}
          onClick={toggleCart}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
          </svg>
          {cartCount > 0 && (
            <span className="navbar__badge" aria-hidden="true">
              {cartCount}
            </span>
          )}
        </button>

        <button
          className="navbar__icon-btn"
          aria-label="Cuenta de usuario"
          onClick={handleUserClick}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
      </div>
    </nav>
  );
};
