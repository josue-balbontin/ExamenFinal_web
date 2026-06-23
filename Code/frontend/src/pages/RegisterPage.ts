import { RegisterFormComponent } from '../components/RegisterForm.js';
import { registerService } from '../utils/auth.js';
import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';

export function createRegisterPage(
  store: Store<AppState>,
  router: Router
): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page page--auth';

  const form = new RegisterFormComponent({
    onSubmit: async (data) => {
      store.setState({
        auth: { ...store.getState().auth, loading: true, error: null },
      });
      const user = await registerService(data);
      store.setState({
        auth: { isAuthenticated: true, user, loading: false, error: null },
      });
      router.navigate('/home');
    },
    onLogin: () => {
      router.navigate('/login');
    },
  });

  page.appendChild(form.getElement());
  return page;
}
