import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';
import { NavbarComponent } from '../components/Navbar.js';
import { SidebarComponent } from '../components/Sidebar.js';
import { ProductGridComponent } from '../components/ProductGrid.js';
import { CartDrawerComponent } from '../components/CartDrawer.js';
import { createNotification } from '../utils/notifications.js';
import { MAX_PRICE_DEFAULT } from '../utils/products.js';

export function createHomePage(
  store: Store<AppState>,
  router: Router
): HTMLElement {
  if (!store.getState().auth.isAuthenticated) {
    router.navigate('/login');
    return document.createElement('div');
  }

  store.setState({
    searchQuery: '',
    selectedCategory: 'Todo',
    maxPrice: MAX_PRICE_DEFAULT,
    cartOpen: false,
  });

  // Simula llegada de notificación "cuenta aprobada" al entrar al home
  // (en producción esto vendría del backend vía WebSocket o polling)
  const existing = store.getState().notifications;
  const alreadySent = existing.some((n) => n.type === 'account_approved');

  if (!alreadySent) {
    const notif = createNotification(
      'account_approved',
      '¡Tu cuenta fue aprobada!',
      'Ya puedes empezar a vender en MarketPlace. Visita "My Store" para agregar tus productos.'
    );
    store.setState({
      notifications: [notif, ...store.getState().notifications],
    });
  }

  const page = document.createElement('div');
  page.className = 'home-page';

  const navbar = new NavbarComponent(store, router);
  page.appendChild(navbar.getElement());

  const layout = document.createElement('div');
  layout.className = 'home-page__layout';

  const sidebar = new SidebarComponent(store);
  layout.appendChild(sidebar.getElement());

  const main = document.createElement('main');
  main.className = 'home-page__main';
  main.setAttribute('id', 'main-content');

  const grid = new ProductGridComponent(store, router);
  main.appendChild(grid.getElement());

  layout.appendChild(main);
  page.appendChild(layout);

  const cartDrawer = new CartDrawerComponent(store, router);
  page.appendChild(cartDrawer.getElement());

  return page;
}
