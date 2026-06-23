import { Store } from './utils/store.js';
import { Router } from './utils/router.js';
import { createLoginPage } from './pages/LoginPage.js';
import { createDashboardPage } from './pages/DashboardPage.js';
import { createRegisterPage } from './pages/RegisterPage.js';
import { createHomePage } from './pages/HomePage.js';
import type { AppState } from './types/index.js';
import { MAX_PRICE_DEFAULT } from './utils/products.js';
import { createProductDetailPage } from './pages/ProductDetailPage.js';

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  currentRoute: '/login',
  cart: [],
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
  .register('/product', () => {
    const id = window.location.pathname.split('/').pop() ?? '1';
    return createProductDetailPage(store, router, id);
  })
  .register('/register', () => createRegisterPage(store, router))
  .register('/dashboard', () => createDashboardPage(store, router))
  .register('/home', () => createHomePage(store, router))
  .register('/', () => createLoginPage(store, router))
  .onChange((route) => {
    store.setState({ currentRoute: route });
  });

router.init();
