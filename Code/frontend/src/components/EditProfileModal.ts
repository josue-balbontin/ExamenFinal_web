import type { AppState, User } from '../types/index.js';
import type { Store } from '../utils/store.js';

export class EditProfileModalComponent {
  private store: Store<AppState>;
  private onClose: () => void;
  private root: HTMLElement;
  private passwordVisible: Record<string, boolean> = {
    new: false,
    confirm: false,
  };

  constructor(store: Store<AppState>, onClose: () => void) {
    this.store = store;
    this.onClose = onClose;
    this.root = this.render();
    this.trapFocus();
  }

  private render(): HTMLElement {
    const user = this.store.getState().auth.user!;

    const backdrop = document.createElement('div');
    backdrop.className = 'edit-profile-backdrop';
    backdrop.setAttribute('aria-hidden', 'true');
    backdrop.addEventListener('click', () => this.close());

    const modal = document.createElement('div');
    modal.className = 'edit-profile-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'edit-profile-title');

    // ── Header ──
    const header = document.createElement('div');
    header.className = 'edit-profile-modal__header';

    const title = document.createElement('h2');
    title.className = 'edit-profile-modal__title';
    title.id = 'edit-profile-title';
    title.textContent = 'Editar Perfil';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'edit-profile-modal__close';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // ── Avatar preview ──
    const avatarSection = document.createElement('div');
    avatarSection.className = 'edit-profile-modal__avatar-section';

    const fullName =
      [user.name, user.lastName].filter(Boolean).join(' ') || 'U';
    const initials = fullName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    const avatarPreview = document.createElement('div');
    avatarPreview.className = 'edit-profile-modal__avatar-preview';
    avatarPreview.id = 'avatar-preview';
    avatarPreview.textContent = initials;

    const avatarHint = document.createElement('p');
    avatarHint.className = 'edit-profile-modal__avatar-hint';
    avatarHint.textContent =
      'Las iniciales se generan automáticamente con tu nombre';

    avatarSection.appendChild(avatarPreview);
    avatarSection.appendChild(avatarHint);

    // ── Form ──
    const form = document.createElement('form');
    form.className = 'edit-profile-modal__form';
    form.noValidate = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    // Profile fields
    const profileFields: Array<{
      id: string;
      name: keyof User;
      label: string;
      type: string;
      placeholder: string;
      value: string;
      required?: boolean;
    }> = [
      {
        id: 'ep-name',
        name: 'name',
        label: 'Nombre',
        type: 'text',
        placeholder: 'Tu nombre',
        value: user.name ?? '',
        required: true,
      },
      {
        id: 'ep-lastName',
        name: 'lastName',
        label: 'Apellido',
        type: 'text',
        placeholder: 'Tu apellido',
        value: user.lastName ?? '',
      },
      {
        id: 'ep-email',
        name: 'email',
        label: 'Correo',
        type: 'email',
        placeholder: 'tu@email.com',
        value: user.email ?? '',
        required: true,
      },
      {
        id: 'ep-phone',
        name: 'phone',
        label: 'Teléfono',
        type: 'tel',
        placeholder: '+123 456 789',
        value: user.phone ?? '',
      },
      {
        id: 'ep-address',
        name: 'address',
        label: 'Dirección',
        type: 'text',
        placeholder: 'Tu dirección',
        value: user.address ?? '',
      },
    ];

    const profileGrid = document.createElement('div');
    profileGrid.className = 'edit-profile-modal__grid';

    profileFields.forEach((field) => {
      profileGrid.appendChild(this.buildTextField(field));
    });

    // ── Password section ──
    const divider = document.createElement('div');
    divider.className = 'edit-profile-modal__divider';

    const pwTitle = document.createElement('h3');
    pwTitle.className = 'edit-profile-modal__section-title';
    pwTitle.textContent = 'Cambiar contraseña';

    const pwHint = document.createElement('p');
    pwHint.className = 'edit-profile-modal__section-hint';
    pwHint.textContent =
      'Deja estos campos vacíos si no quieres cambiar tu contraseña.';

    const pwGrid = document.createElement('div');
    pwGrid.className = 'edit-profile-modal__grid edit-profile-modal__grid--pw';

    const pwFields = [
      {
        id: 'ep-new-pw',
        key: 'new',
        label: 'Nueva contraseña',
        placeholder: 'Mínimo 6 caracteres',
      },
      {
        id: 'ep-confirm-pw',
        key: 'confirm',
        label: 'Confirmar contraseña',
        placeholder: 'Repite la nueva contraseña',
      },
    ];

    pwFields.forEach((f) => pwGrid.appendChild(this.buildPasswordField(f)));

    const pwError = document.createElement('p');
    pwError.className = 'edit-profile-modal__field-error';
    pwError.id = 'ep-pw-error';
    pwError.setAttribute('role', 'alert');
    pwError.setAttribute('aria-live', 'assertive');

    // Server error
    const serverError = document.createElement('p');
    serverError.className = 'edit-profile-modal__server-error';
    serverError.id = 'ep-server-error';
    serverError.setAttribute('role', 'alert');
    serverError.setAttribute('aria-live', 'assertive');

    // ── Actions ──
    const actions = document.createElement('div');
    actions.className = 'edit-profile-modal__actions';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'edit-profile-modal__cancel-btn';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => this.close());

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'edit-profile-modal__save-btn';
    saveBtn.id = 'ep-save-btn';
    saveBtn.textContent = 'Guardar cambios';

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    form.appendChild(profileGrid);
    form.appendChild(divider);
    form.appendChild(pwTitle);
    form.appendChild(pwHint);
    form.appendChild(pwGrid);
    form.appendChild(pwError);
    form.appendChild(serverError);
    form.appendChild(actions);

    modal.appendChild(header);
    modal.appendChild(avatarSection);
    modal.appendChild(form);

    const wrapper = document.createElement('div');
    wrapper.className = 'edit-profile-wrapper';
    wrapper.appendChild(backdrop);
    wrapper.appendChild(modal);

    return wrapper;
  }

  // ── Builders ──

  private buildTextField(field: {
    id: string;
    name: string;
    label: string;
    type: string;
    placeholder: string;
    value: string;
    required?: boolean;
  }): HTMLElement {
    const group = document.createElement('div');
    group.className = `edit-profile-modal__field${field.name === 'address' ? ' edit-profile-modal__field--full' : ''}`;

    const label = document.createElement('label');
    label.className = 'edit-profile-modal__label';
    label.htmlFor = field.id;
    label.textContent = field.label + (field.required ? ' *' : '');

    const input = document.createElement('input');
    input.className = 'edit-profile-modal__input';
    input.id = field.id;
    input.name = field.name;
    input.type = field.type;
    input.placeholder = field.placeholder;
    input.value = field.value;
    if (field.required) input.setAttribute('aria-required', 'true');

    const errorSpan = document.createElement('span');
    errorSpan.className = 'edit-profile-modal__field-error';
    errorSpan.id = `${field.id}-error`;
    errorSpan.setAttribute('role', 'alert');
    errorSpan.setAttribute('aria-live', 'polite');

    if (field.name === 'name' || field.name === 'lastName') {
      input.addEventListener('input', () => {
        const form = this.root.querySelector<HTMLFormElement>(
          '.edit-profile-modal__form'
        )!;
        this.updateAvatarPreview(form);
      });
    }

    input.addEventListener('blur', () => {
      if (field.required && !input.value.trim()) {
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

  private buildPasswordField(field: {
    id: string;
    key: string;
    label: string;
    placeholder: string;
    full?: boolean;
  }): HTMLElement {
    const group = document.createElement('div');
    group.className = `edit-profile-modal__field${field.full ? ' edit-profile-modal__field--full' : ''}`;

    const label = document.createElement('label');
    label.className = 'edit-profile-modal__label';
    label.htmlFor = field.id;
    label.textContent = field.label;

    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'edit-profile-modal__pw-wrapper';

    const input = document.createElement('input');
    input.className = 'edit-profile-modal__input edit-profile-modal__input--pw';
    input.id = field.id;
    input.name = field.key;
    input.type = 'password';
    input.placeholder = field.placeholder;
    input.autocomplete = 'new-password';

    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'edit-profile-modal__pw-toggle';
    toggleBtn.setAttribute('aria-label', 'Mostrar contraseña');
    toggleBtn.innerHTML = this.eyeIcon('show');

    toggleBtn.addEventListener('click', () => {
      this.passwordVisible[field.key] = !this.passwordVisible[field.key];
      const visible = this.passwordVisible[field.key];
      input.type = visible ? 'text' : 'password';
      toggleBtn.setAttribute(
        'aria-label',
        visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
      );
      toggleBtn.innerHTML = this.eyeIcon(visible ? 'hide' : 'show');
    });

    const errorSpan = document.createElement('span');
    errorSpan.className = 'edit-profile-modal__field-error';
    errorSpan.id = `${field.id}-error`;
    errorSpan.setAttribute('role', 'alert');
    errorSpan.setAttribute('aria-live', 'polite');

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(toggleBtn);

    group.appendChild(label);
    group.appendChild(inputWrapper);
    group.appendChild(errorSpan);

    return group;
  }

  private eyeIcon(state: 'show' | 'hide'): string {
    if (state === 'show') {
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
  }

  // ── Logic ──

  private updateAvatarPreview(form: HTMLFormElement): void {
    const nameVal = (
      form.querySelector<HTMLInputElement>('#ep-name')?.value ?? ''
    ).trim();
    const lastVal = (
      form.querySelector<HTMLInputElement>('#ep-lastName')?.value ?? ''
    ).trim();
    const full = [nameVal, lastVal].filter(Boolean).join(' ');
    const initials = full
      ? full
          .split(' ')
          .slice(0, 2)
          .map((w) => w[0].toUpperCase())
          .join('')
      : '?';
    const preview = this.root.querySelector<HTMLElement>('#avatar-preview');
    if (preview) preview.textContent = initials;
  }

  private validatePasswords(form: HTMLFormElement): boolean {
    const newInput = form.querySelector<HTMLInputElement>('#ep-new-pw');
    const confirmInput = form.querySelector<HTMLInputElement>('#ep-confirm-pw');
    const pwError = form.querySelector<HTMLElement>('#ep-pw-error');

    const newVal = newInput?.value ?? '';
    const confirmVal = confirmInput?.value ?? '';

    const anyFilled = newVal || confirmVal;
    if (!anyFilled) return true; // user skipped password change

    if (pwError) pwError.textContent = '';
    let valid = true;

    if (newVal && newVal.length < 6) {
      if (pwError && valid)
        pwError.textContent =
          'La nueva contraseña debe tener al menos 6 caracteres.';
      newInput?.classList.add('edit-profile-modal__input--error');
      valid = false;
    }

    if (newVal && newVal !== confirmVal) {
      if (pwError && valid)
        pwError.textContent = 'Las contraseñas no coinciden.';
      confirmInput?.classList.add('edit-profile-modal__input--error');
      valid = false;
    }

    return valid;
  }

  private handleSubmit(form: HTMLFormElement): void {
    // Clear previous errors
    form
      .querySelectorAll<HTMLElement>('.edit-profile-modal__field-error')
      .forEach((el) => {
        el.textContent = '';
      });
    form
      .querySelectorAll<HTMLInputElement>('.edit-profile-modal__input--error')
      .forEach((el) => {
        el.classList.remove('edit-profile-modal__input--error');
      });

    // Validate required profile fields
    let valid = true;
    form
      .querySelectorAll<HTMLInputElement>('input[aria-required="true"]')
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

    if (!this.validatePasswords(form)) valid = false;
    if (!valid) return;

    const saveBtn = this.root.querySelector<HTMLButtonElement>('#ep-save-btn');
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando…';
    }

    setTimeout(() => {
      // Update profile data
      const profileInputs = form.querySelectorAll<HTMLInputElement>(
        '#ep-name, #ep-lastName, #ep-email, #ep-phone, #ep-address'
      );
      const data: Partial<User> = {};
      profileInputs.forEach((input) => {
        (data as Record<string, string>)[input.name] = input.value.trim();
      });

      const currentAuth = this.store.getState().auth;
      this.store.setState({
        auth: { ...currentAuth, user: { ...currentAuth.user!, ...data } },
      });

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
