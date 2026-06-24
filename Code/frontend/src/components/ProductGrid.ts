import type { AppState, Product } from '../types/index.js';
import type { Store } from '../utils/store.js';
import type { Router } from '../utils/router.js';
import type { Route } from '../types/index.js';
import { ProductCardComponent } from './ProductCard.js';
import { fetchProducts } from '../utils/products.js';
import { addToCart } from '../utils/cartServices.js';

export class ProductGridComponent {
  private store: Store<AppState>;
  private router: Router;
  private root: HTMLElement;
  private unsubs: Array<() => void> = [];
  private loading: boolean = false;
  private currentProducts: Product[] = [];

  constructor(store: Store<AppState>, router: Router) {
    this.store = store;
    this.router = router;
    this.root = document.createElement('div');
    this.root.className = 'product-grid__wrapper';

    this.bindStoreUpdates();
    this.loadProducts();
  }

  private async loadProducts(): Promise<void> {
    this.loading = true;
    this.render();

    const { searchQuery, selectedCategory, maxPrice } = this.store.getState();
    this.currentProducts = await fetchProducts(
      searchQuery,
      selectedCategory,
      maxPrice
    );

    this.loading = false;
    this.render();
  }

  private render(): void {
    this.root.innerHTML = '';

    if (this.loading) {
      const loader = document.createElement('div');
      loader.className = 'product-grid__empty'; // Usamos la misma clase para centrar
      loader.setAttribute('role', 'status');
      loader.innerHTML = '<p>Cargando productos...</p>';
      this.root.appendChild(loader);
      return;
    }

    if (this.currentProducts.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'product-grid__empty';
      empty.setAttribute('role', 'status');
      empty.innerHTML = `<p>No se encontraron productos.</p>`;
      this.root.appendChild(empty);
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'product-grid';
    grid.setAttribute('role', 'list');

    this.currentProducts.forEach((product) => {
      const card = new ProductCardComponent({
        product,
        onAddToCart: (productId, quantity) => {
          addToCart(this.store, productId, quantity);
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

    this.root.appendChild(grid);
  }

  private bindStoreUpdates(): void {
    const keys: Array<keyof AppState> = [
      'searchQuery',
      'selectedCategory',
      'maxPrice',
    ];
    keys.forEach((key) => {
      const unsub = this.store.subscribe(key, () => this.loadProducts());
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
