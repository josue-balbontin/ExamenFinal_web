import { InputComponent } from './Input.js';
import { ButtonComponent } from './Button.js';
import { validatePassword, validateRequired } from '../utils/validation.js';

export interface ResetPasswordFormProps {
  onSubmit: (token: string, newPassword: string) => Promise<void>;
  onBackToLogin: () => void;
  initialToken?: string;
}

export class ResetPasswordFormComponent {
  private props: ResetPasswordFormProps;
  private root: HTMLElement;
  private tokenInput!: InputComponent;
  private passwordInput!: InputComponent;
  private confirmPasswordInput!: InputComponent;
  private submitBtn!: ButtonComponent;

  constructor(props: ResetPasswordFormProps) {
    this.props = props;
    this.root = this.render();
  }

  private render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'auth-card';

    const title = document.createElement('h1');
    title.className = 'auth-card__title';
    title.textContent = 'Restablecer contraseña';

    const description = document.createElement('p');
    description.className = 'auth-card__subtitle';
    description.textContent =
      'Ingresa el token que recibiste y tu nueva contraseña.';

    const form = document.createElement('form');
    form.className = 'auth-card__form';
    form.noValidate = true;

    this.tokenInput = new InputComponent({
      id: 'token',
      name: 'token',
      type: 'text',
      label: 'Token de recuperación',
      placeholder: 'Ingresa el token',
      onBlur: (val) => this.validateField('token', val),
    });

    if (this.props.initialToken) {
      setTimeout(() => {
        const el = this.root.querySelector<HTMLInputElement>('#token');
        if (el) el.value = this.props.initialToken!;
      }, 0);
    }

    this.passwordInput = new InputComponent({
      id: 'password',
      name: 'password',
      type: 'password',
      label: 'Nueva contraseña',
      placeholder: 'Mínimo 6 caracteres',
      onBlur: (val) => this.validateField('password', val),
    });

    this.confirmPasswordInput = new InputComponent({
      id: 'confirmPassword',
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirmar contraseña',
      placeholder: 'Repite la nueva contraseña',
      onBlur: (val) => this.validateField('confirmPassword', val),
    });

    this.submitBtn = new ButtonComponent({
      text: 'Restablecer contraseña',
      type: 'submit',
      variant: 'primary',
    });

    const backLine = document.createElement('p');
    backLine.className = 'auth-card__footer';
    const backLink = document.createElement('a');
    backLink.href = '#';
    backLink.className = 'auth-card__link';
    backLink.textContent = 'Volver al inicio de sesión';
    backLine.appendChild(backLink);
    backLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.props.onBackToLogin();
    });

    const serverError = document.createElement('p');
    serverError.className = 'auth-card__server-error';
    serverError.id = 'server-error';
    serverError.setAttribute('role', 'alert');
    serverError.setAttribute('aria-live', 'assertive');

    form.appendChild(this.tokenInput.getElement());
    form.appendChild(this.passwordInput.getElement());
    form.appendChild(this.confirmPasswordInput.getElement());
    form.appendChild(serverError);
    form.appendChild(this.submitBtn.getElement());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(form);
    card.appendChild(backLine);

    return card;
  }

  private validateField(field: string, value: string): void {
    if (field === 'token') {
      this.tokenInput.setError(validateRequired(value, 'El token'));
    }
    if (field === 'password') {
      this.passwordInput.setError(validatePassword(value));
    }
    if (field === 'confirmPassword') {
      const confirmErr =
        value !== this.passwordInput.getValue()
          ? 'Las contraseñas no coinciden.'
          : undefined;
      this.confirmPasswordInput.setError(confirmErr);
    }
  }

  private async handleSubmit(): Promise<void> {
    const token = this.tokenInput.getValue().trim();
    const password = this.passwordInput.getValue();
    const confirmPassword = this.confirmPasswordInput.getValue();

    const tokenErr = validateRequired(token, 'El token');
    const passErr = validatePassword(password);
    const confirmErr =
      password !== confirmPassword
        ? 'Las contraseñas no coinciden.'
        : undefined;

    this.tokenInput.setError(tokenErr);
    this.passwordInput.setError(passErr);
    this.confirmPasswordInput.setError(confirmErr);

    if (tokenErr || passErr || confirmErr) return;

    this.setServerError('');
    this.submitBtn.setLoading(true);

    try {
      await this.props.onSubmit(token, password);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error inesperado.';
      this.setServerError(msg);
    } finally {
      this.submitBtn.setLoading(false);
    }
  }

  private setServerError(msg: string): void {
    const el = this.root.querySelector<HTMLElement>('#server-error');
    if (el) el.textContent = msg;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
