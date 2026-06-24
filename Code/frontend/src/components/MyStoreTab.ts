import { formatPrice } from '../utils/currency.js';
import type { StoreProduct, StockStatus } from '../types/store-product.js';
import { getStockLabel, getStockBarWidth } from '../utils/store-products.js';
import { ProductFormModalComponent } from './ProductFormModal.js';
import { api } from '../utils/api.js';
import { SellerRequestModalComponent } from './SellerRequestModal.js';
import { ButtonComponent } from './Button.js';

export class MyStoreTabComponent {
  private products: StoreProduct[] = [];
  private root: HTMLElement;
  constructor() {
    this.root = document.createElement('div');
    this.root.className = 'my-store';
    this.root.innerHTML =
      '<p class="my-store__loading">Cargando productos...</p>';
    this.loadProducts();
  }

  private async loadProducts() {
    try {
      const { data, error } = await api.GET('/Producto/mis-productos');

      if (error) throw new Error('Error al cargar productos');

      interface BackendProduct {
        idProducto: number;
        nombre: string;
        descripcion: string;
        precioAplicado?: number;
        precioBase?: number;
        precio?: number;
        stock: number;
        urlImagen?: string;
        idCategoria: number;
        fechaCreacion: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ofertaFlash?: any;
      }

      const productsData = (data || []) as BackendProduct[];

      // Sort recent first
      const sorted = productsData.sort(
        (a, b) =>
          new Date(b.fechaCreacion).getTime() -
          new Date(a.fechaCreacion).getTime()
      );

      this.products = sorted.map((p) => {
        let stockStatus: StockStatus = 'in_stock';
        if (p.stock === 0) stockStatus = 'out_of_stock';
        else if (p.stock <= 5) stockStatus = 'low_stock';

        return {
          id: String(p.idProducto),
          name: p.nombre,
          description: p.descripcion,
          price: p.precioAplicado || p.precioBase || p.precio || 0,
          stock: p.stock,
          status: stockStatus,
          imageUrl:
            p.urlImagen ||
            'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
          idCategoria: p.idCategoria,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          flashSalePercentage: (p.ofertaFlash as any)?.porcentajeDescuento,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          flashSaleStartDate: (p.ofertaFlash as any)?.fechaInicio,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          flashSaleEndDate: (p.ofertaFlash as any)?.fechaFin,
        };
      });

      this.render();
    } catch (e) {
      this.root.innerHTML = '';

      const container = document.createElement('div');
      container.className = 'my-store__error-container';

      const errorMsg = document.createElement('p');
      errorMsg.className = 'my-store__error';
      errorMsg.textContent =
        'Hubo un error al cargar tus productos o no tienes permisos de vendedor.';

      const requestBtn = new ButtonComponent({
        text: 'Solicitar ser vendedor',
        variant: 'primary',
        onClick: () => {
          const modal = new SellerRequestModalComponent(() => {});
          document.body.appendChild(modal.getElement());
        },
      });
      requestBtn.getElement().style.marginTop = '1rem';

      container.appendChild(errorMsg);
      container.appendChild(requestBtn.getElement());

      this.root.appendChild(container);
    }
  }

  private render(): void {
    const wrapper = document.createElement('div');
    wrapper.className = 'my-store';

    // Title row
    const titleRow = document.createElement('div');
    titleRow.className = 'my-store__title-row';

    const titleGroup = document.createElement('div');
    titleGroup.className = 'my-store__title-group';

    const title = document.createElement('h2');
    title.className = 'my-store__title';
    title.textContent = 'TUS PRODUCTOS';

    const subtitle = document.createElement('p');
    subtitle.className = 'my-store__subtitle';
    subtitle.textContent = 'Maneja tus productos, stocks y estados';

    titleGroup.appendChild(title);
    titleGroup.appendChild(subtitle);

    const newBtn = document.createElement('button');
    newBtn.className = 'my-store__new-btn';
    newBtn.innerHTML = `<span aria-hidden="true">+</span> Nuevo Producto`;
    newBtn.addEventListener('click', () => {
      const modal = new ProductFormModalComponent(() => {
        this.loadProducts();
      });
      document.body.appendChild(modal.getElement());
    });

    titleRow.appendChild(titleGroup);
    titleRow.appendChild(newBtn);
    wrapper.appendChild(titleRow);

    // Table
    const table = document.createElement('div');
    table.className = 'my-store__table';
    table.setAttribute('role', 'table');
    table.setAttribute('aria-label', 'Tus productos');

    // Header
    const thead = document.createElement('div');
    thead.className = 'my-store__thead';
    thead.setAttribute('role', 'row');
    thead.innerHTML = `
      <div class="my-store__th my-store__th--product" role="columnheader">PRODUCT</div>
      <div class="my-store__th my-store__th--price"   role="columnheader">PRECIO</div>
      <div class="my-store__th my-store__th--stock"   role="columnheader">STOCK</div>
      <div class="my-store__th my-store__th--actions" role="columnheader">ACCIONES</div>
    `;
    table.appendChild(thead);

    // Rows
    this.products.forEach((product) => {
      table.appendChild(this.buildRow(product));
    });

    wrapper.appendChild(table);

    this.root.innerHTML = '';
    this.root.appendChild(wrapper);
  }

  private buildRow(product: StoreProduct): HTMLElement {
    const row = document.createElement('div');
    row.className = 'my-store__row';
    row.setAttribute('role', 'row');

    // Product cell
    const productCell = document.createElement('div');
    productCell.className = 'my-store__td my-store__td--product';
    productCell.setAttribute('role', 'cell');

    const imgBox = document.createElement('div');
    imgBox.className = 'my-store__product-img';
    imgBox.setAttribute('aria-hidden', 'true');
    if (product.imageUrl) {
      const img = document.createElement('img');
      img.src = product.imageUrl;
      img.alt = product.name;
      img.loading = 'lazy';
      imgBox.appendChild(img);
    } else {
      imgBox.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" aria-hidden="true">
          <rect width="48" height="36" fill="#d1d5db"/>
          <rect x="8" y="4" width="32" height="22" rx="4" fill="#b0b0b0"/>
          <circle cx="18" cy="13" r="5" fill="#d1d5db"/>
          <path d="M8 26 L18 16 L26 22 L32 16 L40 26Z" fill="#c0c0c0"/>
        </svg>
      `;
    }

    const productName = document.createElement('span');
    productName.className = 'my-store__product-name';
    productName.textContent = product.name;

    productCell.appendChild(imgBox);
    productCell.appendChild(productName);

    // Price cell
    const priceCell = document.createElement('div');
    priceCell.className = 'my-store__td my-store__td--price';
    priceCell.setAttribute('role', 'cell');
    priceCell.textContent = formatPrice(product.price);

    // Stock cell
    const stockCell = document.createElement('div');
    stockCell.className = 'my-store__td my-store__td--stock';
    stockCell.setAttribute('role', 'cell');

    const { text, modifier } = getStockLabel(product);
    const barWidth = getStockBarWidth(product.stock);

    stockCell.innerHTML = `
      <span class="my-store__stock-number">${product.stock}</span>
      <div class="my-store__stock-bar-track" role="progressbar" aria-valuenow="${product.stock}" aria-valuemin="0" aria-valuemax="50">
        <div class="my-store__stock-bar-fill my-store__stock-bar-fill--${modifier}" style="width:${barWidth}%"></div>
      </div>
      <span class="my-store__stock-label my-store__stock-label--${modifier}">${text}</span>
    `;

    // Actions cell
    const actionsCell = document.createElement('div');
    actionsCell.className = 'my-store__td my-store__td--actions';
    actionsCell.setAttribute('role', 'cell');

    const editBtn = document.createElement('button');
    editBtn.className = `my-store__edit-btn${product.status === 'out_of_stock' ? ' my-store__edit-btn--disabled' : ''}`;
    editBtn.disabled = product.status === 'out_of_stock';
    editBtn.setAttribute('aria-label', `Editar ${product.name}`);
    editBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
      Editar
    `;
    editBtn.addEventListener('click', () => {
      if (product.status !== 'out_of_stock') {
        const modal = new ProductFormModalComponent(() => {
          this.loadProducts();
        }, product);
        document.body.appendChild(modal.getElement());
      }
    });

    actionsCell.appendChild(editBtn);

    row.appendChild(productCell);
    row.appendChild(priceCell);
    row.appendChild(stockCell);
    row.appendChild(actionsCell);

    return row;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
