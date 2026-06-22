import { logoutService } from '../utils/auth.js';
import { ButtonComponent } from '../components/Button.js';
import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';

export function createDashboardPage(
  store: Store<AppState>,
  router: Router
): HTMLElement {
  const state = store.getState();

  if (!state.auth.isAuthenticated) {
    router.navigate('/login');
    return document.createElement('div');
  }

  const page = document.createElement('div');
  page.className = 'page page--dashboard';

  const card = document.createElement('div');
  card.className = 'dashboard-card';

  const greeting = document.createElement('h1');
  greeting.className = 'dashboard-card__title';
  greeting.textContent = `¡Bienvenido, ${state.auth.user?.name ?? state.auth.user?.email}!`;

  const subtitle = document.createElement('p');
  subtitle.className = 'dashboard-card__subtitle';
  subtitle.textContent = 'Has iniciado sesión correctamente.';

  const logoutBtn = new ButtonComponent({
    text: 'Cerrar sesión',
    variant: 'ghost',
    onClick: async () => {
      logoutBtn.setLoading(true);
      await logoutService();
      store.setState({
        auth: {
          isAuthenticated: false,
          user: null,
          loading: false,
          error: null,
        },
      });
      router.navigate('/login');
    },
  });

  card.appendChild(greeting);
  card.appendChild(subtitle);
  card.appendChild(logoutBtn.getElement());
  page.appendChild(card);

  return page;
}
