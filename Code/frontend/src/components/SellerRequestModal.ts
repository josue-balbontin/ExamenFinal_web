export class SellerRequestModalComponent {
  private onClose: () => void;
  private root: HTMLElement;

  constructor(onClose: () => void) {
    this.onClose = onClose;
    this.root = this.render();
    this.trapFocus();
  }

  private render(): HTMLElement {
    const backdrop = document.createElement('div');
    backdrop.className = 'edit-profile-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', () => this.close());

    const modal = document.createElement('div');
    modal.className = 'edit-profile-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'seller-request-title');

    // Header
    const header = document.createElement('div');
    header.className = 'edit-profile-modal__header';

    const title = document.createElement('h2');
    title.className = 'edit-profile-modal__title';
    title.id = 'seller-request-title';
    title.textContent = 'Solicitud de Vendedor';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'edit-profile-modal__close';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // Form
    const form = document.createElement('form');
    form.className = 'edit-profile-modal__form';
    form.noValidate = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    // Fields
    const fields = [
      {
        id: 'sr-doc-url',
        name: 'documentacion_url',
        label: 'URL de Documentación (Drive, Dropbox, etc.)',
        type: 'url',
        placeholder: 'https://...',
        required: true,
        full: true,
      },
    ];

    const grid = document.createElement('div');
    grid.className = 'edit-profile-modal__grid';

    fields.forEach((field) => {
      grid.appendChild(this.buildField(field));
    });

    const serverError = document.createElement('p');
    serverError.className = 'edit-profile-modal__server-error';
    serverError.id = 'sr-server-error';
    serverError.setAttribute('role', 'alert');
    serverError.setAttribute('aria-live', 'assertive');

    // Actions
    const actions = document.createElement('div');
    actions.className = 'edit-profile-modal__actions';
    actions.style.marginTop = '1rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'edit-profile-modal__cancel-btn';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => this.close());

    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'edit-profile-modal__save-btn';
    submitBtn.id = 'sr-submit-btn';
    submitBtn.textContent = 'Enviar solicitud';

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);

    form.appendChild(grid);
    form.appendChild(serverError);
    form.appendChild(actions);

    modal.appendChild(header);
    modal.appendChild(form);

    const wrapper = document.createElement('div');
    wrapper.className = 'edit-profile-wrapper';
    wrapper.appendChild(backdrop);
    wrapper.appendChild(modal);

    return wrapper;
  }

  private buildField(field: {
    id: string;
    name: string;
    label: string;
    type: string;
    placeholder: string;
    required?: boolean;
    full?: boolean;
  }): HTMLElement {
    const group = document.createElement('div');
    group.className = `edit-profile-modal__field${field.full ? ' edit-profile-modal__field--full' : ''}`;

    const label = document.createElement('label');
    label.className = 'edit-profile-modal__label';
    label.htmlFor = field.id;
    label.textContent = field.label + (field.required ? ' *' : '');

    let input: HTMLElement;
    if (field.type === 'textarea') {
      const textarea = document.createElement('textarea');
      textarea.className = 'edit-profile-modal__input';
      textarea.id = field.id;
      textarea.name = field.name;
      textarea.placeholder = field.placeholder;
      textarea.rows = 3;
      textarea.style.resize = 'vertical';
      if (field.required) textarea.setAttribute('aria-required', 'true');
      input = textarea;
    } else {
      const el = document.createElement('input');
      el.className = 'edit-profile-modal__input';
      el.id = field.id;
      el.name = field.name;
      el.type = field.type;
      el.placeholder = field.placeholder;
      if (field.required) el.setAttribute('aria-required', 'true');
      input = el;
    }

    const errorSpan = document.createElement('span');
    errorSpan.className = 'edit-profile-modal__field-error';
    errorSpan.id = `${field.id}-error`;
    errorSpan.setAttribute('role', 'alert');
    errorSpan.setAttribute('aria-live', 'polite');

    input.addEventListener('blur', () => {
      if (
        field.required &&
        !(input as HTMLInputElement | HTMLTextAreaElement).value.trim()
      ) {
        input.classList.add('edit-profile-modal__input--error');
        errorSpan.textContent = `${field.label} es requerido.`;
      } else {
        input.classList.remove('edit-profile-modal__input--error');
        errorSpan.textContent = '';
      }
    });

    group.appendChild(label);
    group.appendChild(input);
    group.appendChild(errorSpan);

    return group;
  }

  private handleSubmit(form: HTMLFormElement): void {
    // Clear errors
    form
      .querySelectorAll<HTMLElement>('.edit-profile-modal__field-error')
      .forEach((el) => {
        el.textContent = '';
      });
    form
      .querySelectorAll<HTMLElement>('.edit-profile-modal__input--error')
      .forEach((el) => {
        el.classList.remove('edit-profile-modal__input--error');
      });

    // Validate
    let valid = true;
    form
      .querySelectorAll<
        HTMLInputElement | HTMLTextAreaElement
      >('[aria-required="true"]')
      .forEach((input) => {
        if (!input.value.trim()) {
          input.classList.add('edit-profile-modal__input--error');
          const errorSpan = form.querySelector<HTMLElement>(
            `#${input.id}-error`
          );
          const labelText =
            form
              .querySelector<HTMLLabelElement>(`label[for="${input.id}"]`)
              ?.textContent?.replace(' *', '') ?? input.name;
          if (errorSpan) errorSpan.textContent = `${labelText} es requerido.`;
          valid = false;
        }
      });

    if (!valid) return;

    const submitBtn =
      this.root.querySelector<HTMLButtonElement>('#sr-submit-btn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Enviando…';
    }

    setTimeout(() => {
      alert('¡Solicitud enviada con éxito! (mock)');
      this.close();
    }, 600);
  }

  private trapFocus(): void {
    const focusable = this.root.querySelectorAll<HTMLElement>(
      'button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    this.root.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
        return;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });

    setTimeout(() => first?.focus(), 50);
  }

  private close(): void {
    this.root.classList.add('edit-profile-wrapper--closing');
    setTimeout(() => {
      this.root.remove();
      this.onClose();
    }, 200);
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
