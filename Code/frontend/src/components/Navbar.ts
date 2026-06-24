import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';

export class NavbarComponent {
  private store: Store<AppState>;
  private router: Router;
  private root: HTMLElement;
  private searchTimeout: ReturnType<typeof setTimeout> | null = null;
  private unsubs: Array<() => void> = [];

  constructor(store: Store<AppState>, router: Router) {
    this.store = store;
    this.router = router;
    this.root = this.render();
    this.bindStoreUpdates();
  }

  private render(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'navbar';

    // Logo
    const logo = document.createElement('a');
    logo.className = 'navbar__logo';
    logo.href = '#';
    logo.setAttribute('aria-label', 'MarketPlace inicio');
    logo.addEventListener('click', (e) => {
      e.preventDefault();
      this.router.navigate('/home');
    });
    logo.innerHTML = `
      <svg class="navbar__logo-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
      <span class="navbar__logo-text">MarketPlace</span>
    `;

    // Search
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'navbar__search';
    const searchIcon = `<svg class="navbar__search-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
    const searchInput = document.createElement('input');
    searchInput.className = 'navbar__search-input';
    searchInput.type = 'search';
    searchInput.placeholder = 'Buscar en MarketPlace';
    searchInput.setAttribute('aria-label', 'Buscar productos');
    searchInput.value = this.store.getState().searchQuery;
    searchInput.addEventListener('input', () => {
      if (this.searchTimeout) clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        this.store.setState({ searchQuery: searchInput.value });
      }, 350);
    });
    searchWrapper.innerHTML = searchIcon;
    searchWrapper.appendChild(searchInput);

    // Actions
    const actions = document.createElement('div');
    actions.className = 'navbar__actions';

    // Notification button
    const notifBtn = document.createElement('button');
    notifBtn.className = 'navbar__icon-btn';
    notifBtn.setAttribute('aria-label', 'Notificaciones');
    notifBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        <path d="M13.73 21a2 2 0 01-3.46 0"/>
      </svg>
    `;

    // Cart button
    const cartCount = this.store
      .getState()
      .cart.reduce((sum, i) => sum + i.cantidad, 0);
    const cartBtn = document.createElement('button');
    cartBtn.className = 'navbar__icon-btn';
    cartBtn.setAttribute('aria-label', `Carrito, ${cartCount} productos`);
    cartBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6"/>
      </svg>
      ${cartCount > 0 ? `<span class="navbar__badge" aria-hidden="true">${cartCount}</span>` : ''}
    `;
    cartBtn.addEventListener('click', () => {
      this.store.setState({ cartOpen: !this.store.getState().cartOpen });
    });

    // User button
    const userBtn = document.createElement('button');
    userBtn.className = 'navbar__icon-btn';
    userBtn.setAttribute('aria-label', 'Cuenta de usuario');
    userBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    userBtn.addEventListener('click', () => {
      const state = this.store.getState();
      if (state.auth.isAuthenticated) {
        this.router.navigate('/profile');
      } else {
        this.router.navigate('/login');
      }
    });

    actions.appendChild(notifBtn);
    actions.appendChild(cartBtn);
    actions.appendChild(userBtn);

    nav.appendChild(logo);
    nav.appendChild(searchWrapper);
    nav.appendChild(actions);

    return nav;
  }

  private rebuildNav(): void {
    const newNav = this.render();
    this.root.replaceWith(newNav);
    this.root = newNav;
    this.bindStoreUpdates();
  }

  private bindStoreUpdates(): void {
    this.unsubs.forEach((u) => u());
    this.unsubs = [];
    const unsub = this.store.subscribe('cart', () => this.rebuildNav());
    this.unsubs.push(unsub);
  }

  destroy(): void {
    this.unsubs.forEach((u) => u());
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
