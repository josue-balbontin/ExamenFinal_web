import { LoginFormComponent } from '../components/LoginForm.js';
import { loginService } from '../utils/auth.js';
import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';

export function createLoginPage(
  store: Store<AppState>,
  router: Router
): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page page--auth';

  const form = new LoginFormComponent({
    onSubmit: async (data) => {
      store.setState({
        auth: { ...store.getState().auth, loading: true, error: null },
      });
      const user = await loginService(data);
      store.setState({
        auth: { isAuthenticated: true, user, loading: false, error: null },
      });
      router.navigate('/home');
    },
    onForgotPassword: () => {
      alert('Funcionalidad de recuperación próximamente.');
    },
    onRegister: () => {
      router.navigate('/register');
    },
  });

  page.appendChild(form.getElement());
  return page;
}
