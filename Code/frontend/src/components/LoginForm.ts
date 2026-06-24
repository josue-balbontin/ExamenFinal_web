import { InputComponent } from './Input.js';
import { ButtonComponent } from './Button.js';
import { validateLoginForm, hasErrors } from '../utils/validation.js';
import type { LoginFormData } from '../types/index.js';

export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  onForgotPassword: () => void;
  onRegister: () => void;
}

export class LoginFormComponent {
  private props: LoginFormProps;
  private root: HTMLElement;
  private emailInput!: InputComponent;
  private passwordInput!: InputComponent;
  private submitBtn!: ButtonComponent;

  constructor(props: LoginFormProps) {
    this.props = props;
    this.root = this.render();
  }

  private render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'auth-card';

    const title = document.createElement('h1');
    title.className = 'auth-card__title';
    title.textContent = 'Inicia sesión';

    const form = document.createElement('form');
    form.className = 'auth-card__form';
    form.noValidate = true;

    this.emailInput = new InputComponent({
      id: 'email',
      name: 'email',
      type: 'email',
      label: 'Correo',
      placeholder: 'ejemplo@gmail.com',
      onBlur: (val) => this.validateField('email', val),
    });

    this.passwordInput = new InputComponent({
      id: 'password',
      name: 'password',
      type: 'password',
      label: 'Contraseña',
      placeholder: '123456',
      onBlur: (val) => this.validateField('password', val),
    });

    const forgotLink = document.createElement('a');
    forgotLink.className = 'auth-card__link auth-card__link--right';
    forgotLink.href = '#';
    forgotLink.textContent = 'Olvidé mi contraseña';
    forgotLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.props.onForgotPassword();
    });

    this.submitBtn = new ButtonComponent({
      text: 'Iniciar sesión',
      type: 'submit',
      variant: 'primary',
    });

    const registerLine = document.createElement('p');
    registerLine.className = 'auth-card__footer';
    const registerLink = document.createElement('a');
    registerLink.href = '#';
    registerLink.className = 'auth-card__link';
    registerLink.textContent = 'Regístrate';
    registerLine.innerHTML = '¿No tienes una cuenta? ';
    registerLine.appendChild(registerLink);
    registerLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.props.onRegister();
    });

    const serverError = document.createElement('p');
    serverError.className = 'auth-card__server-error';
    serverError.id = 'server-error';
    serverError.setAttribute('role', 'alert');
    serverError.setAttribute('aria-live', 'assertive');

    form.appendChild(this.emailInput.getElement());
    form.appendChild(this.passwordInput.getElement());
    form.appendChild(forgotLink);
    form.appendChild(serverError);
    form.appendChild(this.submitBtn.getElement());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    card.appendChild(title);
    card.appendChild(form);
    card.appendChild(registerLine);

    return card;
  }

  private validateField(field: 'email' | 'password', value: string): void {
    const data: LoginFormData = {
      email: field === 'email' ? value : this.emailInput.getValue(),
      password: field === 'password' ? value : this.passwordInput.getValue(),
    };
    const errs = validateLoginForm(data);
    if (field === 'email') this.emailInput.setError(errs.email);
    if (field === 'password') this.passwordInput.setError(errs.password);
  }

  private async handleSubmit(): Promise<void> {
    const data: LoginFormData = {
      email: this.emailInput.getValue().trim(),
      password: this.passwordInput.getValue(),
    };

    const errs = validateLoginForm(data);
    this.emailInput.setError(errs.email);
    this.passwordInput.setError(errs.password);

    if (hasErrors(errs)) return;

    this.setServerError('');
    this.submitBtn.setLoading(true);

    try {
      await this.props.onSubmit(data);
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
