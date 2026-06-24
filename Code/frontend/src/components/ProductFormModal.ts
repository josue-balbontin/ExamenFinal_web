import type { StoreProduct } from '../types/store-product.js';
import { api } from '../utils/api.js';
import { showStatusModal } from './StatusModal.js';

export class ProductFormModalComponent {
  private onClose: () => void;
  private root: HTMLElement;
  private product?: StoreProduct;

  constructor(onClose: () => void, product?: StoreProduct) {
    this.onClose = onClose;
    this.product = product;
    this.root = this.render();
    this.trapFocus();
    this.loadCategories();
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
    modal.setAttribute('aria-labelledby', 'create-product-title');

    const header = document.createElement('div');
    header.className = 'edit-profile-modal__header';

    const isEdit = !!this.product;

    const title = document.createElement('h2');
    title.className = 'edit-profile-modal__title';
    title.id = 'create-product-title';
    title.textContent = isEdit ? 'Editar Producto' : 'Crear Nuevo Producto';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'edit-profile-modal__close';
    closeBtn.setAttribute('aria-label', 'Cerrar');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeBtn.addEventListener('click', () => this.close());

    header.appendChild(title);
    header.appendChild(closeBtn);

    // ── Form ──
    const form = document.createElement('form');
    form.className = 'edit-profile-modal__form';
    form.noValidate = true;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit(form);
    });

    // Product fields
    const productFields = [
      {
        id: 'cp-name',
        name: 'name',
        label: 'Nombre del producto',
        type: 'text',
        placeholder: 'Ej. Camiseta de algodón',
        value: this.product?.name ?? '',
        required: true,
      },
      {
        id: 'cp-description',
        name: 'description',
        label: 'Descripción',
        type: 'textarea',
        placeholder: 'Detalles del producto...',
        value: this.product?.description ?? '',
        full: true,
      },
      {
        id: 'cp-price',
        name: 'price',
        label: 'Precio',
        type: 'number',
        placeholder: '0.00',
        value: this.product?.price ? String(this.product.price) : '',
        required: true,
        step: '0.01',
      },
      {
        id: 'cp-stock',
        name: 'stock',
        label: 'Stock disponible',
        type: 'number',
        placeholder: 'Ej. 10',
        value: this.product?.stock
          ? String(this.product.stock)
          : this.product?.stock === 0
            ? '0'
            : '',
        required: true,
        step: '1',
      },
      {
        id: 'cp-category',
        name: 'category',
        label: 'Categoría',
        type: 'select',
        placeholder: '',
        value: '',
        required: true,
      },
      {
        id: 'cp-imageUrl',
        name: 'imageUrl',
        label: 'URL de la imagen',
        type: 'url',
        placeholder: 'https://...',
        value: this.product?.imageUrl ?? '',
        full: true,
      },
    ];

    const productGrid = document.createElement('div');
    productGrid.className = 'edit-profile-modal__grid';

    productFields.forEach((field) => {
      if (field.type === 'select') {
        productGrid.appendChild(this.buildSelectField(field));
      } else {
        productGrid.appendChild(this.buildTextField(field));
      }
    });

    // Server error
    const serverError = document.createElement('p');
    serverError.className = 'edit-profile-modal__server-error';
    serverError.id = 'cp-server-error';
    serverError.setAttribute('role', 'alert');
    serverError.setAttribute('aria-live', 'assertive');

    // ── Actions ──
    const actions = document.createElement('div');
    actions.className = 'edit-profile-modal__actions';
    // Add extra top margin since we don't have avatar section
    actions.style.marginTop = '1rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'edit-profile-modal__cancel-btn';
    cancelBtn.textContent = 'Cancelar';
    cancelBtn.addEventListener('click', () => this.close());

    const saveBtn = document.createElement('button');
    saveBtn.type = 'submit';
    saveBtn.className = 'edit-profile-modal__save-btn';
    saveBtn.id = 'cp-save-btn';
    saveBtn.textContent = isEdit ? 'Guardar cambios' : 'Crear producto';

    actions.appendChild(cancelBtn);
    actions.appendChild(saveBtn);

    form.appendChild(productGrid);
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

  // ── Builders ──

  private buildTextField(field: {
    id: string;
    name: string;
    label: string;
    type: string;
    placeholder: string;
    value: string;
    required?: boolean;
    step?: string;
    full?: boolean;
  }): HTMLElement {
    const group = document.createElement('div');
    group.className = `edit-profile-modal__field${field.full ? ' edit-profile-modal__field--full' : ''}`;

    const label = document.createElement('label');
    label.className = 'edit-profile-modal__label';
    label.htmlFor = field.id;
    label.textContent = field.label + (field.required ? ' *' : '');

    let input: HTMLInputElement | HTMLTextAreaElement;
    if (field.type === 'textarea') {
      input = document.createElement('textarea');
      input.className =
        'edit-profile-modal__input edit-profile-modal__textarea';
      input.rows = 3;
    } else {
      input = document.createElement('input');
      input.className = 'edit-profile-modal__input';
      input.type = field.type;
      if (field.step) input.setAttribute('step', field.step);
      if (field.type === 'number') input.setAttribute('min', '0');
    }
    input.id = field.id;
    input.name = field.name;
    input.placeholder = field.placeholder;
    input.value = field.value;
    if (field.required) input.setAttribute('aria-required', 'true');

    const errorSpan = document.createElement('span');
    errorSpan.className = 'edit-profile-modal__field-error';
    errorSpan.id = `${field.id}-error`;
    errorSpan.setAttribute('role', 'alert');
    errorSpan.setAttribute('aria-live', 'polite');

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

  private buildSelectField(field: {
    id: string;
    name: string;
    label: string;
    required?: boolean;
    full?: boolean;
  }): HTMLElement {
    const group = document.createElement('div');
    group.className = `edit-profile-modal__field${field.full ? ' edit-profile-modal__field--full' : ''}`;

    const label = document.createElement('label');
    label.className = 'edit-profile-modal__label';
    label.htmlFor = field.id;
    label.textContent = field.label + (field.required ? ' *' : '');

    const select = document.createElement('select');
    select.className = 'edit-profile-modal__input edit-profile-modal__select';
    select.id = field.id;
    select.name = field.name;
    if (field.required) select.setAttribute('aria-required', 'true');

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    defaultOption.textContent = 'Cargando categorías...';
    select.appendChild(defaultOption);

    const errorSpan = document.createElement('span');
    errorSpan.className = 'edit-profile-modal__field-error';
    errorSpan.id = `${field.id}-error`;
    errorSpan.setAttribute('role', 'alert');
    errorSpan.setAttribute('aria-live', 'polite');

    select.addEventListener('change', () => {
      if (field.required && !select.value.trim()) {
        select.classList.add('edit-profile-modal__input--error');
        errorSpan.textContent = `${field.label} es requerido.`;
      } else {
        select.classList.remove('edit-profile-modal__input--error');
        errorSpan.textContent = '';
      }
    });

    select.addEventListener('blur', () => {
      if (field.required && !select.value.trim()) {
        select.classList.add('edit-profile-modal__input--error');
        errorSpan.textContent = `${field.label} es requerido.`;
      } else {
        select.classList.remove('edit-profile-modal__input--error');
        errorSpan.textContent = '';
      }
    });

    group.appendChild(label);
    group.appendChild(select);
    group.appendChild(errorSpan);

    return group;
  }

  // ── Logic ──

  private async loadCategories() {
    const select = this.root.querySelector<HTMLSelectElement>('#cp-category');
    if (!select) return;

    try {
      const { data: categorias, error } = await api.GET('/Categoria');
      if (error || !categorias) throw new Error('Error al cargar');

      select.innerHTML =
        '<option value="" disabled>Selecciona una categoría</option>';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (categorias as any[]).forEach(
        (c: { idCategoria?: number; nombre?: string | null }) => {
          if (c.idCategoria && c.nombre) {
            const option = document.createElement('option');
            option.value = String(c.idCategoria);
            option.textContent = c.nombre;
            select.appendChild(option);
          }
        }
      );
      // Try to preselect if editing
      if (this.product?.idCategoria) {
        select.value = String(this.product.idCategoria);
      } else {
        select.value = '';
      }
    } catch (e) {
      select.innerHTML =
        '<option value="" disabled selected>Error al cargar categorías</option>';
    }
  }

  private async handleSubmit(form: HTMLFormElement): Promise<void> {
    const serverError =
      this.root.querySelector<HTMLElement>('#cp-server-error');
    if (serverError) {
      serverError.textContent = '';
      serverError.style.display = 'none';
    }

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

    // Validate required fields (inputs, selects, textareas)
    let valid = true;
    form
      .querySelectorAll<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >('input[aria-required="true"], select[aria-required="true"], textarea[aria-required="true"]')
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

    const saveBtn = this.root.querySelector<HTMLButtonElement>('#cp-save-btn');
    const originalText = saveBtn ? saveBtn.textContent : '';
    if (saveBtn) {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Guardando…';
    }

    const payload = {
      nombre: (
        form.querySelector<HTMLInputElement>('#cp-name')?.value || ''
      ).trim(),
      descripcion: (
        form.querySelector<HTMLTextAreaElement>('#cp-description')?.value || ''
      ).trim(),
      precioBase:
        Number(form.querySelector<HTMLInputElement>('#cp-price')?.value) || 0,
      stock:
        Number(form.querySelector<HTMLInputElement>('#cp-stock')?.value) || 0,
      idCategoria:
        Number(form.querySelector<HTMLSelectElement>('#cp-category')?.value) ||
        0,
      urlImagen: (
        form.querySelector<HTMLInputElement>('#cp-imageUrl')?.value || ''
      ).trim(),
    };

    try {
      if (this.product) {
        // Edit
        const { error } = await api.PUT('/Producto/{id}', {
          params: { path: { id: Number(this.product.id) } },
          body: payload,
        });
        if (error)
          throw new Error(
            (error as { mensaje?: string }).mensaje ||
              'Error al actualizar el producto'
          );
      } else {
        // Create
        const { error } = await api.POST('/Producto', {
          body: payload,
        });
        if (error)
          throw new Error(
            (error as { mensaje?: string }).mensaje ||
              'Error al crear el producto'
          );
      }

      this.close();

      showStatusModal({
        type: 'success',
        title: this.product
          ? 'Producto actualizado'
          : 'Producto creado exitosamente',
        autoCloseMs: 3000,
        onClose: () => {
          window.location.reload();
        },
      });
    } catch (err: unknown) {
      if (serverError) {
        serverError.textContent =
          (err as Error).message || 'Ocurrió un error inesperado';
        serverError.style.display = 'block';
      }
      if (saveBtn) {
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
      }
    }
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
