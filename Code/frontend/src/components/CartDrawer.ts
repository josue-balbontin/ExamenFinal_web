import type { AppState } from '../types/index.js';
import type { CartItem } from '../types/cart.js';
import type { Store } from '../utils/store.js';

export class CartDrawerComponent {
  private store: Store<AppState>;
  private root: HTMLElement;
  private unsubs: Array<() => void> = [];

  constructor(store: Store<AppState>) {
    this.store = store;
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

    const itemCount = cart.reduce((sum, i) => sum + i.quantity, 0);
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
      cart.forEach((item) => body.appendChild(this.buildItem(item)));
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
    if (item.product.imageUrl) {
      img.innerHTML = `<img src="${item.product.imageUrl}" alt="${item.product.name}" loading="lazy"/>`;
    } else {
      img.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 45" aria-hidden="true"><rect width="60" height="45" fill="#d1d5db"/><rect x="10" y="5" width="40" height="28" rx="5" fill="#b0b0b0"/><circle cx="22" cy="16" r="6" fill="#d1d5db"/><path d="M10 33 L22 20 L32 27 L40 20 L50 33Z" fill="#c0c0c0"/></svg>`;
    }

    // Info
    const info = document.createElement('div');
    info.className = 'cart-drawer__item-info';

    const name = document.createElement('p');
    name.className = 'cart-drawer__item-name';
    name.textContent = item.product.name;

    const price = document.createElement('p');
    price.className = 'cart-drawer__item-price';
    price.textContent = `$${(item.product.price * item.quantity).toFixed(2)}`;

    // Quantity controls
    const controls = document.createElement('div');
    controls.className = 'cart-drawer__item-controls';

    const decBtn = document.createElement('button');
    decBtn.className = 'cart-drawer__qty-btn';
    decBtn.setAttribute('aria-label', 'Disminuir cantidad');
    decBtn.textContent = '−';
    decBtn.addEventListener('click', () => this.updateQty(item.product.id, -1));

    const qtyDisplay = document.createElement('span');
    qtyDisplay.className = 'cart-drawer__qty-display';
    qtyDisplay.textContent = String(item.quantity);

    const incBtn = document.createElement('button');
    incBtn.className = 'cart-drawer__qty-btn';
    incBtn.setAttribute('aria-label', 'Aumentar cantidad');
    incBtn.textContent = '+';
    incBtn.addEventListener('click', () => this.updateQty(item.product.id, 1));

    const removeBtn = document.createElement('button');
    removeBtn.className = 'cart-drawer__remove-btn';
    removeBtn.setAttribute(
      'aria-label',
      `Eliminar ${item.product.name} del carrito`
    );
    removeBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;
    removeBtn.addEventListener('click', () => this.removeItem(item.product.id));

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

    const total = cart.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );

    const totalRow = document.createElement('div');
    totalRow.className = 'cart-drawer__total-row';
    totalRow.innerHTML = `<span>Total</span><span>$${total.toFixed(2)}</span>`;

    const checkoutBtn = document.createElement('button');
    checkoutBtn.className = 'cart-drawer__checkout-btn';
    checkoutBtn.textContent = 'Ir al checkout';

    footer.appendChild(totalRow);
    footer.appendChild(checkoutBtn);
    return footer;
  }

  private updateQty(productId: string, delta: number): void {
    const cart = this.store
      .getState()
      .cart.map((item) => {
        if (item.product.id !== productId) return item;
        return { ...item, quantity: item.quantity + delta };
      })
      .filter((item) => item.quantity > 0);
    this.store.setState({ cart });
  }

  private removeItem(productId: string): void {
    const cart = this.store
      .getState()
      .cart.filter((item) => item.product.id !== productId);
    this.store.setState({ cart });
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
