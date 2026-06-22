import type { AppState } from '../types/index.js';
import type { Store } from '../utils/store.js';
import { ProductCardComponent } from './ProductCard.js';
import { MOCK_PRODUCTS, filterProducts } from '../utils/products.js';
import type { Router } from '../utils/router.js';
import type { Route } from '../types/index.js';

export class ProductGridComponent {
  private store: Store<AppState>;
  private router: Router;
  private root: HTMLElement;
  private unsubs: Array<() => void> = [];

  constructor(store: Store<AppState>, router: Router) {
    this.store = store;
    this.router = router;
    this.root = this.buildGrid();
    this.bindStoreUpdates();
  }

  private buildGrid(): HTMLElement {
    const wrapper = document.createElement('div');
    wrapper.className = 'product-grid__wrapper';

    const { searchQuery, selectedCategory, maxPrice } = this.store.getState();
    const filtered = filterProducts(
      MOCK_PRODUCTS,
      searchQuery,
      selectedCategory,
      maxPrice
    );

    if (filtered.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'product-grid__empty';
      empty.setAttribute('role', 'status');
      empty.innerHTML = `<p>No se encontraron productos.</p>`;
      wrapper.appendChild(empty);
      return wrapper;
    }

    const grid = document.createElement('div');
    grid.className = 'product-grid';
    grid.setAttribute('role', 'list');

    filtered.forEach((product) => {
      const card = new ProductCardComponent({
        product,
        onAddToCart: (p) => {
          const currentCart = this.store.getState().cart;
          this.store.setState({ cart: [...currentCart, p] });
        },
        onCardClick: (p) => {
          this.router.navigate(`/product/${p.id}` as Route);
        },
      });
      const li = document.createElement('div');
      li.setAttribute('role', 'listitem');
      li.appendChild(card.getElement());
      grid.appendChild(li);
    });

    wrapper.appendChild(grid);
    return wrapper;
  }

  private rebuildGrid(): void {
    const newGrid = this.buildGrid();
    this.root.replaceWith(newGrid);
    this.root = newGrid;
  }

  private bindStoreUpdates(): void {
    const keys: Array<keyof AppState> = [
      'searchQuery',
      'selectedCategory',
      'maxPrice',
    ];
    keys.forEach((key) => {
      const unsub = this.store.subscribe(key, () => this.rebuildGrid());
      this.unsubs.push(unsub);
    });
  }

  destroy(): void {
    this.unsubs.forEach((u) => u());
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
