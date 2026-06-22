import { Store } from './utils/store.js';
import { Router } from './utils/router.js';
import { createLoginPage } from './pages/LoginPage.js';
import { createDashboardPage } from './pages/DashboardPage.js';
import { createRegisterPage } from './pages/RegisterPage.js';
import type { AppState } from './types/index.js';

const initialState: AppState = {
  auth: {
    isAuthenticated: false,
    user: null,
    loading: false,
    error: null,
  },
  currentRoute: '/login',
};

const store = new Store<AppState>(initialState);

const outlet = document.getElementById('app-outlet');
if (!outlet) throw new Error('Missing #app-outlet in DOM');

const router = new Router(outlet);

router
  .register('/login', () => createLoginPage(store, router))
  .register('/register', () => createRegisterPage(store, router))
  .register('/dashboard', () => createDashboardPage(store, router))
  .register('/', () => createLoginPage(store, router))
  .onChange((route) => {
    store.setState({ currentRoute: route });
  });

router.init();
