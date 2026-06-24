import { RegisterFormComponent } from '../components/RegisterForm.js';
import { registerService, loginService } from '../utils/auth.js';
import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';
import { fetchCart } from '../utils/cartServices.js';

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

      // Hacer login automático para obtener y guardar el token JWT
      try {
        await loginService({ email: data.email, password: data.password });
      } catch (err) {
        console.error('Error en auto-login:', err);
      }

      store.setState({
        auth: { isAuthenticated: true, user, loading: false, error: null },
      });
      await fetchCart(store);
      router.navigate('/home');
    },
    onLogin: () => {
      router.navigate('/login');
    },
  });

  page.appendChild(form.getElement());
  return page;
}
