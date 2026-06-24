import { Store } from './utils/store.ts';
import { Router } from './utils/router.ts';
import { createLoginPage } from './pages/LoginPage.ts';
import { createDashboardPage } from './pages/DashboardPage.ts';
import { createRegisterPage } from './pages/RegisterPage.ts';
import { createHomePage } from './pages/HomePage.ts';
import { createProductDetailPage } from './pages/ProductDetailPage.ts';
import type { AppState } from './types/index.ts';
import { MAX_PRICE_DEFAULT } from './utils/products.js';
import { createProfilePage } from './pages/ProfilePage.js';
import { createCheckoutPage } from './pages/CheckoutPage.js';
import { fetchCart } from './utils/cartServices.js';
import { createForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { createResetPasswordPage } from './pages/ResetPasswordPage.js';

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
  notifications: [],
  notifOpen: false,
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
  .register('/checkout', () => createCheckoutPage(store, router))
  .register('/forgot-password', () => createForgotPasswordPage(router))
  .register('/reset-password', () => createResetPasswordPage(router))
  .register('/product', () => {
    const id = window.location.pathname.split('/').pop() ?? '1';
    return createProductDetailPage(store, router, id);
  })
  .register('/', () => createLoginPage(store, router))
  .onChange((route) => {
    store.setState({ currentRoute: route });
  });

// Check if authenticated on initial load, fetch cart if true
if (store.getState().auth.isAuthenticated) {
  fetchCart(store).catch((err) =>
    console.error('Error fetching cart on init:', err)
  );
}

router.init();
