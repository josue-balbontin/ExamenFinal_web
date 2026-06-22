export interface InputProps {
  id: string;
  name: string;
  type: 'text' | 'email' | 'password';
  label: string;
  value?: string;
  placeholder?: string;
  error?: string;
  onInput?: (value: string) => void;
  onBlur?: (value: string) => void;
}

export class InputComponent {
  private props: InputProps;
  private root: HTMLElement;
  private isPasswordVisible = false;

  constructor(props: InputProps) {
    this.props = props;
    this.root = this.render();
    this.bindEvents();
  }

  private render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = `form-field${this.props.error ? ' form-field--error' : ''}`;

    const isPassword = this.props.type === 'password';

    wrapper.innerHTML = `
      <label class="form-field__label" for="${this.props.id}">
        ${this.props.label}
      </label>
      <div class="form-field__input-wrapper${isPassword ? ' form-field__input-wrapper--password' : ''}">
        <input
          class="form-field__input"
          id="${this.props.id}"
          name="${this.props.name}"
          type="${this.props.type}"
          value="${this.props.value ?? ''}"
          placeholder="${this.props.placeholder ?? ''}"
          autocomplete="${isPassword ? 'current-password' : 'email'}"
        />
        ${
          isPassword
            ? `
          <button
            type="button"
            class="form-field__toggle-visibility"
            aria-label="Mostrar contraseña"
            tabindex="0"
          >
            <svg class="form-field__eye-icon form-field__eye-icon--show" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
            <svg class="form-field__eye-icon form-field__eye-icon--hide" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="display:none">
              <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
              <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
          </button>
        `
            : ''
        }
      </div>
      <span class="form-field__error" role="alert" aria-live="polite">
        ${this.props.error ?? ''}
      </span>
    `;
    return wrapper;
  }

  private bindEvents(): void {
    const input = this.getInput();
    input.addEventListener('input', () => this.props.onInput?.(input.value));
    input.addEventListener('blur', () => this.props.onBlur?.(input.value));

    const toggleBtn = this.root.querySelector<HTMLButtonElement>(
      '.form-field__toggle-visibility'
    );
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleVisibility());
    }
  }

  private toggleVisibility(): void {
    this.isPasswordVisible = !this.isPasswordVisible;
    const input = this.getInput();
    const toggleBtn = this.root.querySelector<HTMLButtonElement>(
      '.form-field__toggle-visibility'
    );
    const iconShow = this.root.querySelector<SVGElement>(
      '.form-field__eye-icon--show'
    );
    const iconHide = this.root.querySelector<SVGElement>(
      '.form-field__eye-icon--hide'
    );

    input.type = this.isPasswordVisible ? 'text' : 'password';

    if (toggleBtn) {
      toggleBtn.setAttribute(
        'aria-label',
        this.isPasswordVisible ? 'Ocultar contraseña' : 'Mostrar contraseña'
      );
    }
    if (iconShow) iconShow.style.display = this.isPasswordVisible ? 'none' : '';
    if (iconHide) iconHide.style.display = this.isPasswordVisible ? '' : 'none';
  }

  private getInput(): HTMLInputElement {
    return this.root.querySelector('input')!;
  }

  setError(error: string | undefined): void {
    const errorEl = this.root.querySelector<HTMLElement>('.form-field__error')!;
    errorEl.textContent = error ?? '';
    this.root.classList.toggle('form-field--error', Boolean(error));
  }

  getValue(): string {
    return this.getInput().value;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
