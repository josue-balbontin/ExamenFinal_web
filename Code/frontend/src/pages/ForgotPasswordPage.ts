import { ForgotPasswordFormComponent } from '../components/ForgotPasswordForm.js';
import { forgotPasswordService } from '../utils/auth.js';
import type { Router } from '../utils/router.js';

export function createForgotPasswordPage(router: Router): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page page--auth';

  const form = new ForgotPasswordFormComponent({
    onSubmit: async (email) => {
      return await forgotPasswordService(email);
    },
    onBackToLogin: () => {
      router.navigate('/login');
    },
    onGoToReset: (token?: string) => {
      if (token) {
        // En lugar de pasar un estado complejo, es más fácil actualizar el path temporalmente o
        // dejar que la vista de reset lea el token de localStorage/sessionStorage, pero
        // podemos simplemente pasar query params.
        history.pushState({}, '', `/reset-password?token=${token}`);
        router.navigate('/reset-password');
      } else {
        router.navigate('/reset-password');
      }
    },
  });

  page.appendChild(form.getElement());
  return page;
}
