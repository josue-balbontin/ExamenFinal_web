import { InputComponent } from './Input.js';
import { ButtonComponent } from './Button.js';
import { validateRegisterForm, hasErrors } from '../utils/validation.js';
import type {
  RegisterFormData,
  RegisterValidationErrors,
} from '../types/index.js';

export interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  onLogin: () => void;
}

export class RegisterFormComponent {
  private props: RegisterFormProps;
  private root: HTMLElement;

  private emailInput!: InputComponent;
  private nameInput!: InputComponent;
  private lastNameInput!: InputComponent;
  private phoneInput!: InputComponent;
  private addressInput!: InputComponent;
  private passwordInput!: InputComponent;
  private confirmPasswordInput!: InputComponent;
  private submitBtn!: ButtonComponent;

  constructor(props: RegisterFormProps) {
    this.props = props;
    this.root = this.render();
  }

  private render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'auth-card';

    const title = document.createElement('h1');
    title.className = 'auth-card__title';
    title.textContent = 'Regístrate';

    const form = document.createElement('form');
    form.className = 'auth-card__form';
    form.noValidate = true;

    this.emailInput = new InputComponent({
      id: 'register-email',
      name: 'email',
      type: 'email',
      label: 'Correo electrónico',
      placeholder: 'ejemplo@gmail.com',
      onBlur: (val) => this.validateField('email', val),
    });

    this.nameInput = new InputComponent({
      id: 'register-name',
      name: 'name',
      type: 'text',
      label: 'Nombre',
      placeholder: 'ejemplo',
      onBlur: (val) => this.validateField('name', val),
    });

    this.lastNameInput = new InputComponent({
      id: 'register-lastName',
      name: 'lastName',
      type: 'text',
      label: 'Apellido',
      placeholder: 'ejemplo',
      onBlur: (val) => this.validateField('lastName', val),
    });

    this.phoneInput = new InputComponent({
      id: 'register-phone',
      name: 'phone',
      type: 'text',
      label: 'Teléfono',
      placeholder: '+123 456 789',
      onBlur: (val) => this.validateField('phone', val),
    });

    this.addressInput = new InputComponent({
      id: 'register-address',
      name: 'address',
      type: 'text',
      label: 'Dirección',
      placeholder: 'calle ejemplo avenida ejemplo',
      onBlur: (val) => this.validateField('address', val),
    });

    this.passwordInput = new InputComponent({
      id: 'register-password',
      name: 'password',
      type: 'password',
      label: 'Contraseña',
      onBlur: (val) => this.validateField('password', val),
    });

    this.confirmPasswordInput = new InputComponent({
      id: 'register-confirmPassword',
      name: 'confirmPassword',
      type: 'password',
      label: 'Confirmar contraseña',
      onBlur: (val) => this.validateField('confirmPassword', val),
    });

    this.submitBtn = new ButtonComponent({
      text: 'Registrarse',
      type: 'submit',
      variant: 'primary',
    });

    const loginLine = document.createElement('p');
    loginLine.className = 'auth-card__footer';
    const loginLink = document.createElement('a');
    loginLink.href = '#';
    loginLink.className = 'auth-card__link';
    loginLink.textContent = '¿Tienes cuenta? Inicia sesión';
    loginLine.textContent = '';
    loginLine.appendChild(loginLink);
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      this.props.onLogin();
    });

    const serverError = document.createElement('p');
    serverError.className = 'auth-card__server-error';
    serverError.id = 'register-server-error';
    serverError.setAttribute('role', 'alert');
    serverError.setAttribute('aria-live', 'assertive');

    form.appendChild(this.emailInput.getElement());
    form.appendChild(this.nameInput.getElement());
    form.appendChild(this.lastNameInput.getElement());
    form.appendChild(this.phoneInput.getElement());
    form.appendChild(this.addressInput.getElement());
    form.appendChild(this.passwordInput.getElement());
    form.appendChild(this.confirmPasswordInput.getElement());
    form.appendChild(serverError);
    form.appendChild(this.submitBtn.getElement());

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    card.appendChild(title);
    card.appendChild(form);
    card.appendChild(loginLine);

    return card;
  }

  private getFormData(): RegisterFormData {
    return {
      email: this.emailInput.getValue(),
      name: this.nameInput.getValue(),
      lastName: this.lastNameInput.getValue(),
      phone: this.phoneInput.getValue(),
      address: this.addressInput.getValue(),
      password: this.passwordInput.getValue(),
      confirmPassword: this.confirmPasswordInput.getValue(),
    };
  }

  private validateField(field: keyof RegisterFormData, value: string): void {
    const data = { ...this.getFormData(), [field]: value };
    const errs = validateRegisterForm(data);
    this.applyErrors(errs, field);
  }

  private applyErrors(
    errs: RegisterValidationErrors,
    only?: keyof RegisterFormData
  ): void {
    const map: Record<keyof RegisterFormData, InputComponent> = {
      email: this.emailInput,
      name: this.nameInput,
      lastName: this.lastNameInput,
      phone: this.phoneInput,
      address: this.addressInput,
      password: this.passwordInput,
      confirmPassword: this.confirmPasswordInput,
    };

    const keys = only
      ? [only]
      : (Object.keys(map) as Array<keyof RegisterFormData>);
    keys.forEach((key) => map[key].setError(errs[key]));
  }

  private async handleSubmit(): Promise<void> {
    const data = this.getFormData();
    const errs = validateRegisterForm(data);
    this.applyErrors(errs);

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
    const el = this.root.querySelector<HTMLElement>('#register-server-error');
    if (el) el.textContent = msg;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
