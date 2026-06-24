import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore, globalStore } from '../storeInstance';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { ProductGrid } from '../components/ProductGrid';
import { CartDrawer } from '../components/CartDrawer';
import { createNotification } from '../utils/notifications';
import { MAX_PRICE_DEFAULT } from '../utils/products';

export function HomePage() {
  const navigate = useNavigate();
  const state = useStore();

  useEffect(() => {
    if (!state.auth.isAuthenticated) {
      navigate('/login');
      return;
    }

    globalStore.setState({
      searchQuery: '',
      selectedCategory: 'Todo',
      maxPrice: MAX_PRICE_DEFAULT,
      cartOpen: false,
    });

    const existing = globalStore.getState().notifications;
    const alreadySent = existing.some((n) => n.type === 'account_approved');

    if (!alreadySent) {
      const notif = createNotification(
        'account_approved',
        '¡Tu cuenta fue aprobada!',
        'Ya puedes empezar a vender en MarketPlace. Visita "My Store" para agregar tus productos.'
      );
      globalStore.setState({
        notifications: [notif, ...globalStore.getState().notifications],
      });
    }
  }, [navigate, state.auth.isAuthenticated]);

  if (!state.auth.isAuthenticated) {
    return <div />;
  }

  return (
    <div className="home-page">
      <Navbar />
      <div className="home-page__layout">
        <Sidebar />
        <main className="home-page__main" id="main-content">
          <ProductGrid />
        </main>
      </div>
      <CartDrawer />
    </div>
  );
}
