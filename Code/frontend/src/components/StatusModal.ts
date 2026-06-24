export type StatusModalType = 'success' | 'error' | 'warning' | 'info';

export interface StatusModalOptions {
  type?: StatusModalType;
  title: string;
  message?: string;
  closeLabel?: string;
  onClose?: () => void;
  autoCloseMs?: number; // si se pasa, cierra solo después de N ms
}

export class StatusModalComponent {
  private options: Required<Omit<StatusModalOptions, 'autoCloseMs'>> & {
    autoCloseMs?: number;
  };
  private root: HTMLElement;
  private autoCloseTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(options: StatusModalOptions) {
    this.options = {
      type: options.type ?? 'success',
      title: options.title,
      message: options.message ?? '',
      closeLabel: options.closeLabel ?? '',
      onClose: options.onClose ?? (() => {}),
      autoCloseMs: options.autoCloseMs,
    };
    this.root = this.render();
    this.bindKeys();
    if (this.options.autoCloseMs) {
      this.autoCloseTimer = setTimeout(
        () => this.close(),
        this.options.autoCloseMs
      );
    }
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'status-modal-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', () => this.close());

    const box = document.createElement('div');
    box.className = 'status-modal';
    box.setAttribute('role', 'alertdialog');
    box.setAttribute('aria-modal', 'true');
    box.setAttribute('aria-labelledby', 'status-modal-title');
    if (this.options.message) {
      box.setAttribute('aria-describedby', 'status-modal-message');
    }

    // Icon
    const iconWrapper = document.createElement('div');
    iconWrapper.className = `status-modal__icon-wrapper status-modal__icon-wrapper--${this.options.type}`;
    iconWrapper.setAttribute('aria-hidden', 'true');
    iconWrapper.innerHTML = this.getIcon();

    // Title
    const title = document.createElement('h2');
    title.className = 'status-modal__title';
    title.id = 'status-modal-title';
    title.textContent = this.options.title;

    // Optional message
    if (this.options.message) {
      const msg = document.createElement('p');
      msg.className = 'status-modal__message';
      msg.id = 'status-modal-message';
      msg.textContent = this.options.message;
      box.appendChild(iconWrapper);
      box.appendChild(title);
      box.appendChild(msg);
    } else {
      box.appendChild(iconWrapper);
      box.appendChild(title);
    }

    // Close button
    const closeBtn = document.createElement('button');
    closeBtn.className = `status-modal__close-btn status-modal__close-btn--${this.options.type}`;
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    `;
    closeBtn.addEventListener('click', () => this.close());
    box.appendChild(closeBtn);

    // Optional label under close
    if (this.options.closeLabel) {
      const label = document.createElement('p');
      label.className = 'status-modal__close-label';
      label.textContent = this.options.closeLabel;
      box.appendChild(label);
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'status-modal-wrapper';
    wrapper.appendChild(backdrop);
    wrapper.appendChild(box);

    return wrapper;
  }

  private getIcon(): string {
    const icons: Record<StatusModalType, string> = {
      success: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
      warning: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
      info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    };
    return icons[this.options.type];
  }

  private bindKeys(): void {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.close();
    };
    document.addEventListener('keydown', handler);
    // Clean up on close
    this.root.addEventListener('modal:closed', () => {
      document.removeEventListener('keydown', handler);
    });
  }

  close(): void {
    if (this.autoCloseTimer) clearTimeout(this.autoCloseTimer);
    this.root.classList.add('status-modal-wrapper--closing');
    setTimeout(() => {
      this.root.remove();
      this.root.dispatchEvent(new CustomEvent('modal:closed'));
      this.options.onClose();
    }, 220);
  }

  mount(container: HTMLElement = document.body): this {
    container.appendChild(this.root);
    // Focus close button for a11y
    setTimeout(() => {
      this.root
        .querySelector<HTMLButtonElement>('.status-modal__close-btn')
        ?.focus();
    }, 50);
    return this;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}

// ── Helper function — uso rápido en una línea ──
export function showStatusModal(
  options: StatusModalOptions
): StatusModalComponent {
  return new StatusModalComponent(options).mount();
}
