import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, globalStore } from '../storeInstance';
import type { ProfileTab } from '../types/profiles';
import { Navbar } from '../components/Navbar';
import { CartDrawer } from '../components/CartDrawer';
import { buildUserProfile } from '../utils/profile';
import { MyStoreTab } from '../components/MyStoreTab';
import { EditProfileModal } from '../components/EditProfileModal';

export function ProfilePage() {
  const navigate = useNavigate();
  const state = useStore();
  const [activeTab, setActiveTab] = useState<ProfileTab>('Mi tienda');
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      navigate('/login');
    } else {
      globalStore.setState({ cartOpen: false });
    }
  }, [navigate, state.auth.isAuthenticated]);

  if (!state.auth.isAuthenticated || !state.auth.user) {
    return <div />;
  }

  const user = state.auth.user;
  const profile = buildUserProfile(user);

  const tabs: ProfileTab[] = ['Mi tienda'];

  return (
    <div className="profile-page">
      <Navbar />
      <div className="profile-page__content">
        <div className="profile-header">
          <div className="profile-header__top-row">
            <div className="profile-header__avatar-group">
              <div className="profile-header__avatar" aria-hidden="true">
                {profile.initials}
              </div>
              <h1 className="profile-header__name">{profile.name}</h1>
            </div>
            <button
              className="profile-header__edit-btn"
              onClick={() => setShowEditModal(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg> Editar Perfil
            </button>
          </div>
          <div className="profile-header__meta">
            <div className="profile-header__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              <span>{profile.email}</span>
            </div>
            <div className="profile-header__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.8 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/>
              </svg>
              <span>{profile.phone}</span>
            </div>
            <div className="profile-header__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{profile.location}</span>
            </div>
            <div className="profile-header__meta-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Member since {profile.memberSince}</span>
            </div>
          </div>
        </div>

        <div className="profile-tabs" role="tablist">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`profile-tabs__tab${tab === activeTab ? ' profile-tabs__tab--active' : ''}`}
              role="tab"
              aria-selected={tab === activeTab}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="profile-tabs__panel">
          {activeTab === 'Mi tienda' ? (
            <MyStoreTab />
          ) : (
            <p className="profile-tabs__placeholder">
              Contenido de "{activeTab}" próximamente.
            </p>
          )}
        </div>
      </div>
      <CartDrawer />
      
      {showEditModal && (
        <EditProfileModal
          onClose={() => {
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}
