import { formatPrice } from '../utils/currency.js';
import type { AppState, CartItem } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';
import { addToCart, removeFromCart } from '../utils/cartServices.js';

export class CartDrawerComponent {
  private store: Store<AppState>;
  private router: Router;
  private root: HTMLElement;
  private unsubs: Array<() => void> = [];

  constructor(store: Store<AppState>, router: Router) {
    this.store = store;
    this.router = router;
    this.root = this.buildDrawer();
    this.bindStoreUpdates();
  }

  private buildDrawer(): HTMLElement {
    const { cart, cartOpen } = this.store.getState();

    // Overlay
    const overlay = document.createElement('div');
    overlay.className = `cart-drawer-overlay${cartOpen ? ' cart-drawer-overlay--open' : ''}`;
    overlay.setAttribute('aria-hidden', 'true');
    overlay.addEventListener('click', () => {
      this.store.setState({ cartOpen: false });
    });

    // Drawer panel
    const drawer = document.createElement('div');
    drawer.className = `cart-drawer${cartOpen ? ' cart-drawer--open' : ''}`;
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-label', 'Carrito de compras');
    drawer.setAttribute('aria-modal', 'true');

    // Header
    const header = document.createElement('div');
    header.className = 'cart-drawer__header';

    const title = document.createElement('h2');
    title.className = 'cart-drawer__title';
    title.textContent = 'SHOPPING CART';

    const itemCount = cart.reduce((sum, i) => sum + i.cantidad, 0);
    const subtitle = document.createElement('p');
    subtitle.className = 'cart-drawer__subtitle';
    subtitle.textContent = `${itemCount} item${itemCount !== 1 ? 's' : ''}`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'cart-drawer__close';
    closeBtn.setAttribute('aria-label', 'Cerrar carrito');
    closeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    closeBtn.addEventListener('click', () => {
      this.store.setState({ cartOpen: false });
    });

    header.appendChild(title);
    header.appendChild(subtitle);
    header.appendChild(closeBtn);
    drawer.appendChild(header);

    // Body
    const body = document.createElement('div');
    body.className = 'cart-drawer__body';

    if (cart.length === 0) {
      body.appendChild(this.buildEmpty());
    } else {
      // Group by seller
      const grouped: Record<string, CartItem[]> = {};
      cart.forEach((item) => {
        const seller = item.nombreVendedor || 'Vendedor Desconocido';
        if (!grouped[seller]) grouped[seller] = [];
        grouped[seller].push(item);
      });

      Object.entries(grouped).forEach(([sellerName, items]) => {
        const sellerHeader = document.createElement('h3');
        sellerHeader.className = 'cart-drawer__seller-header';
        sellerHeader.textContent = `Vendido por: ${sellerName}`;
        sellerHeader.style.marginTop = '1rem';
        sellerHeader.style.marginBottom = '0.5rem';
        sellerHeader.style.fontSize = '0.9rem';
        sellerHeader.style.color = 'var(--text-secondary)';
        body.appendChild(sellerHeader);

        items.forEach((item) => body.appendChild(this.buildItem(item)));
      });

      body.appendChild(this.buildFooter(cart));
    }

    drawer.appendChild(body);

    const wrapper = document.createElement('div');
    wrapper.className = 'cart-drawer__wrapper';
    wrapper.appendChild(overlay);
    wrapper.appendChild(drawer);

    return wrapper;
  }

  private buildEmpty(): HTMLElement {
    const empty = document.createElement('div');
    empty.className = 'cart-drawer__empty';
    empty.innerHTML = `
      <svg class="cart-drawer__empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <p class="cart-drawer__empty-text">Your cart is empty</p>
      <button class="cart-drawer__continue">Continue shopping</button>
    `;
    empty
      .querySelector('.cart-drawer__continue')
      ?.addEventListener('click', () => {
        this.store.setState({ cartOpen: false });
      });
    return empty;
  }

  private buildItem(item: CartItem): HTMLElement {
    const row = document.createElement('div');
    row.className = 'cart-drawer__item';

    // Image placeholder
    const img = document.createElement('div');
    img.className = 'cart-drawer__item-img';
    if (item.urlImagen) {
      img.innerHTML = `<img src="${item.urlImagen}" alt="${item.nombreProducto}" loading="lazy"/>`;
    } else {
      img.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 45" aria-hidden="true"><rect width="60" height="45" fill="#d1d5db"/><rect x="10" y="5" width="40" height="28" rx="5" fill="#b0b0b0"/><circle cx="22" cy="16" r="6" fill="#d1d5db"/><path d="M10 33 L22 20 L32 27 L40 20 L50 33Z" fill="#c0c0c0"/></svg>`;
    }

    // Info
    const info = document.createElement('div');
    info.className = 'cart-drawer__item-info';

    const name = document.createElement('p');
    name.className = 'cart-drawer__item-name';
    name.textContent = item.nombreProducto;

    const price = document.createElement('span');
    price.className = 'cart-drawer__item-price';
    price.textContent = formatPrice(item.subtotal);

    // Quantity controls
    const controls = document.createElement('div');
    controls.className = 'cart-drawer__item-controls';

    const decBtn = document.createElement('button');
    decBtn.className = 'cart-drawer__qty-btn';
    decBtn.setAttribute('aria-label', 'Disminuir cantidad');
    decBtn.textContent = '−';
    decBtn.addEventListener('click', () => this.updateQty(item.idProducto, -1));

    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'cart-drawer__qty-display';
    qtyDisplay.textContent = String(item.cantidad);

    const incBtn = document.createElement('button');
    incBtn.className = 'cart-drawer__qty-btn';
    incBtn.setAttribute('aria-label', 'Aumentar cantidad');
    incBtn.textContent = '+';
    incBtn.addEventListener('click', () => this.updateQty(item.idProducto, 1));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'cart-drawer__remove-btn';
    removeBtn.setAttribute(
      'aria-label',
      `Eliminar ${item.nombreProducto} del carrito`
    );
    removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    removeBtn.addEventListener('click', () => this.removeItem(item.idProducto));

    controls.appendChild(decBtn);
    controls.appendChild(qtyDisplay);
    controls.appendChild(incBtn);
    controls.appendChild(removeBtn);

    info.appendChild(name);
    info.appendChild(price);
    info.appendChild(controls);

    row.appendChild(img);
    row.appendChild(info);

    return row;
  }

  private buildFooter(cart: CartItem[]): HTMLElement {
    const footer = document.createElement('div');
    footer.className = 'cart-drawer__footer';

    const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

    const totalRow = document.createElement('div');
    totalRow.className = 'cart-drawer__total-row';
    totalRow.innerHTML = `<span>Total</span><span>${formatPrice(subtotal)}</span>`;

    const checkoutBtn = document.createElement('a');
    checkoutBtn.className = 'cart-drawer__checkout-btn';
    checkoutBtn.textContent = 'Ir al checkout';
    checkoutBtn.href = '/checkout';
    checkoutBtn.style.display = 'block';
    checkoutBtn.style.textAlign = 'center';
    checkoutBtn.style.textDecoration = 'none';

    checkoutBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        console.log('Checkout button clicked');
        this.store.setState({ cartOpen: false });
        await this.router.navigate('/checkout');
      } catch (err: unknown) {
        console.error('Error in checkout navigation:', err);
        alert(
          'Error de navegación: ' + ((err as Error).message || String(err))
        );
      }
    });

    footer.appendChild(totalRow);
    footer.appendChild(checkoutBtn);
    return footer;
  }

  private updateQty(productId: number, delta: number): void {
    addToCart(this.store, productId, delta);
  }

  private removeItem(productId: number): void {
    removeFromCart(this.store, productId);
  }

  private rebuildDrawer(): void {
    const newDrawer = this.buildDrawer();
    this.root.replaceWith(newDrawer);
    this.root = newDrawer;
  }

  private bindStoreUpdates(): void {
    const unsub1 = this.store.subscribe('cart', () => this.rebuildDrawer());
    const unsub2 = this.store.subscribe('cartOpen', () => this.rebuildDrawer());
    this.unsubs.push(unsub1, unsub2);
  }

  destroy(): void {
    this.unsubs.forEach((u) => u());
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
