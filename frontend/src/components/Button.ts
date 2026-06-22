export type ButtonVariant = 'primary' | 'ghost';

export interface ButtonProps {
  text: string;
  variant?: ButtonVariant;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

export class ButtonComponent {
  private props: ButtonProps;
  private root: HTMLButtonElement;

  constructor(props: ButtonProps) {
    this.props = props;
    this.root = this.render();
    this.bindEvents();
  }

  private render(): HTMLButtonElement {
    const btn = document.createElement('button');
    const variant = this.props.variant ?? 'primary';
    btn.className = `btn btn--${variant}`;
    btn.type = this.props.type ?? 'button';
    btn.disabled = this.props.disabled ?? false;
    btn.innerHTML = this.getInnerHTML();
    return btn;
  }

  private getInnerHTML(): string {
    if (this.props.loading) {
      return `<span class="btn__spinner" aria-hidden="true"></span><span class="btn__text">Cargando…</span>`;
    }
    return `<span class="btn__text">${this.props.text}</span>`;
  }

  private bindEvents(): void {
    this.root.addEventListener('click', () => {
      if (!this.root.disabled) this.props.onClick?.();
    });
  }

  setLoading(loading: boolean): void {
    this.props.loading = loading;
    this.root.disabled = loading;
    this.root.innerHTML = this.getInnerHTML();
  }

  getElement(): HTMLButtonElement {
    return this.root;
  }
}
