import { InputComponent } from './Input.js';
import { ButtonComponent } from './Button.js';
import { validateEmail } from '../utils/validation.js';

export interface ForgotPasswordFormProps {
  onSubmit: (email: string) => Promise<string | null>;
  onBackToLogin: () => void;
  onGoToReset: (token?: string) => void;
}

export class ForgotPasswordFormComponent {
  private props: ForgotPasswordFormProps;
  private root: HTMLElement;
  private emailInput!: InputComponent;
  private submitBtn!: ButtonComponent;
  private goToResetBtn!: ButtonComponent;
  private retrievedToken: string | null = null;

  constructor(props: ForgotPasswordFormProps) {
    this.props = props;
    this.root = this.render();
  }

  private render(): HTMLElement {
    const card = document.createElement('div');
    card.className = 'auth-card';

    const title = document.createElement('h1');
    title.className = 'auth-card__title';
    title.textContent = 'Recuperar contraseña';

    const description = document.createElement('p');
    description.className = 'auth-card__subtitle';
    description.textContent =
      'Ingresa tu correo y te enviaremos un enlace temporal para recuperar tu contraseña.';

    const form = document.createElement('form');
    form.className = 'auth-card__form';
    form.noValidate = true;

    this.emailInput = new InputComponent({
      id: 'email',
      name: 'email',
      type: 'email',
      label: 'Correo',
      placeholder: 'ejemplo@gmail.com',
      onBlur: (val) => this.validateField(val),
    });

    this.submitBtn = new ButtonComponent({
      text: 'Enviar instrucciones',
      type: 'submit',
      variant: 'primary',
    });

    this.goToResetBtn = new ButtonComponent({
      text: 'Continuar a Restablecer Contraseña',
      type: 'button',
      variant: 'primary',
    });
    this.goToResetBtn.getElement().style.display = 'none';
    this.goToResetBtn.getElement().style.marginTop = '1rem';
    this.goToResetBtn.getElement().addEventListener('click', () => {
      this.props.onGoToReset(this.retrievedToken || undefined);
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

    const successMessage = document.createElement('p');
    successMessage.className = 'auth-card__success-message';
    successMessage.id = 'success-message';
    successMessage.style.color = 'green';
    successMessage.style.marginBottom = '1rem';
    successMessage.style.textAlign = 'center';

    form.appendChild(this.emailInput.getElement());
    form.appendChild(serverError);
    form.appendChild(successMessage);
    form.appendChild(this.submitBtn.getElement());
    form.appendChild(this.goToResetBtn.getElement());

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

  private validateField(value: string): void {
    const error = validateEmail(value);
    this.emailInput.setError(error);
  }

  private async handleSubmit(): Promise<void> {
    const email = this.emailInput.getValue().trim();
    const error = validateEmail(email);
    this.emailInput.setError(error);

    if (error) return;

    this.setServerError('');
    this.setSuccessMessage('');
    this.submitBtn.setLoading(true);

    try {
      const token = await this.props.onSubmit(email);
      if (token) {
        this.retrievedToken = token;
        this.setSuccessMessage(
          '¡Token generado con éxito para desarrollo local!'
        );
        this.submitBtn.getElement().style.display = 'none';
        this.goToResetBtn.getElement().style.display = 'block';
      } else {
        this.setSuccessMessage(
          'Si tu correo está registrado, recibirás un enlace de recuperación.'
        );
        // Opcionalmente podemos mostrar el botón también aunque no tengamos token
        this.goToResetBtn.getElement().style.display = 'block';
      }
    } catch (err: unknown) {
      // Por seguridad, muchas aplicaciones muestran éxito de todos modos o un error genérico
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

  private setSuccessMessage(msg: string): void {
    const el = this.root.querySelector<HTMLElement>('#success-message');
    if (el) el.textContent = msg;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
