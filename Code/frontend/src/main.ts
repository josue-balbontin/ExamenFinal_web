import { Store } from './utils/store.ts';
import { Router } from './utils/router.ts';
import { createLoginPage } from './pages/LoginPage.ts';
import { createDashboardPage } from './pages/DashboardPage.ts';
import { createRegisterPage } from './pages/RegisterPage.ts';
import { createHomePage } from './pages/HomePage.ts';
import { createProductDetailPage } from './pages/ProductDetailPage.ts';
import type { AppState } from './types/index.ts';
import { MAX_PRICE_DEFAULT } from './utils/products.ts';
import { createProfilePage } from './pages/ProfilePage.ts';

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  currentRoute: '/login',
  cart: [],
  cartOpen: false,
  searchQuery: '',
  selectedCategory: 'Todo',
  maxPrice: MAX_PRICE_DEFAULT,
};

const store = new Store<AppState>(initialState);

const outlet = document.getElementById('app-outlet');
if (!outlet) throw new Error('Missing #app-outlet in DOM');

const router = new Router(outlet);

router
  .register('/login', () => createLoginPage(store, router))
  .register('/register', () => createRegisterPage(store, router))
  .register('/dashboard', () => createDashboardPage(store, router))
  .register('/home', () => createHomePage(store, router))
  .register('/profile', () => createProfilePage(store, router))
  .register('/product', () => {
    const id = window.location.pathname.split('/').pop() ?? '1';
    return createProductDetailPage(store, router, id);
  })
  .register('/', () => createLoginPage(store, router))
  .onChange((route) => {
    store.setState({ currentRoute: route });
  });

router.init();
