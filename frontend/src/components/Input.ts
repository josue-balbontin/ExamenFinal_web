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

  constructor(props: InputProps) {
    this.props = props;
    this.root = this.render();
    this.bindEvents();
  }

  private render(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = `form-field${this.props.error ? ' form-field--error' : ''}`;
    wrapper.innerHTML = `
      <label class="form-field__label" for="${this.props.id}">
        ${this.props.label}
      </label>
      <input
        class="form-field__input"
        id="${this.props.id}"
        name="${this.props.name}"
        type="${this.props.type}"
        value="${this.props.value ?? ''}"
        placeholder="${this.props.placeholder ?? ''}"
        autocomplete="${this.props.type === 'password' ? 'current-password' : 'email'}"
      />
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
