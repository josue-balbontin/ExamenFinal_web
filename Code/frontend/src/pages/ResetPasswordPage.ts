import { ResetPasswordFormComponent } from '../components/ResetPasswordForm.js';
import { resetPasswordService } from '../utils/auth.js';
import type { Router } from '../utils/router.js';

export function createResetPasswordPage(router: Router): HTMLElement {
  const page = document.createElement('div');
  page.className = 'page page--auth';

  // Extract token from query params if available
  const urlParams = new URLSearchParams(window.location.search);
  const initialToken = urlParams.get('token') || undefined;

  const form = new ResetPasswordFormComponent({
    initialToken,
    onSubmit: async (token, newPassword) => {
      await resetPasswordService(token, newPassword);
      alert('Contraseña actualizada correctamente.');
      router.navigate('/login');
    },
    onBackToLogin: () => {
      router.navigate('/login');
    },
  });

  page.appendChild(form.getElement());
  return page;
}
