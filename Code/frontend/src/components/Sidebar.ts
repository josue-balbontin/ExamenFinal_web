import type { AppState, Category } from '../types/index.js';
import type { Store } from '../utils/store.js';
import { MAX_PRICE_DEFAULT } from '../utils/products.js';

import { api } from '../utils/api.js';

export class SidebarComponent {
  private element: HTMLElement;
  private store: Store<AppState>;
  private unsubs: Array<() => void> = [];
  private categories: Category[] = ['Todo'];

  constructor(store: Store<AppState>) {
    this.store = store;
    this.element = document.createElement('aside');
    this.element.className = 'sidebar';
    this.render();
    this.bindStoreUpdates();
    this.loadCategories();
  }

  private async loadCategories() {
    try {
      const { data, error } = await api.GET('/Categoria');
      if (data && Array.isArray(data)) {
        const fetchedCats = (data as Record<string, unknown>[]).map(
          (c: Record<string, unknown>) => (c.nombre as string) || ''
        );
        this.categories = ['Todo', ...fetchedCats.filter(Boolean)];
        this.render();
      } else if (error) {
        console.error('Failed to load categories:', error);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  private render(): void {
    const { selectedCategory, maxPrice } = this.store.getState();

    let html = `
      <div>
        <h3 class="sidebar__label">CATEGORÍAS</h3>
        <ul class="sidebar__category-list">
    `;

    this.categories.forEach((cat) => {
      const activeClass =
        cat === selectedCategory ? 'sidebar__category-btn--active' : '';
      html += `
        <li>
          <button class="sidebar__category-btn ${activeClass}" data-category="${cat}">
            ${cat}
          </button>
        </li>
      `;
    });

    html += `
        </ul>
      </div>
      <div>
        <h3 class="sidebar__label sidebar__label--price">PRECIO MÁXIMO</h3>
        <div class="sidebar__price-value" id="priceValue">$${maxPrice}</div>
        <input type="range" class="sidebar__slider" id="priceRange" min="0" max="${MAX_PRICE_DEFAULT}" value="${maxPrice}" step="10">
        <div class="sidebar__price-range">
          <span>$0</span>
          <span>$${MAX_PRICE_DEFAULT}</span>
        </div>
      </div>
    `;

    this.element.innerHTML = html;

    // Attach event listeners
    const categoryBtns = this.element.querySelectorAll(
      '.sidebar__category-btn'
    );
    categoryBtns.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const cat = (e.currentTarget as HTMLElement).getAttribute(
          'data-category'
        ) as Category;
        this.store.setState({ selectedCategory: cat });
      });
    });

    const priceRange = this.element.querySelector(
      '#priceRange'
    ) as HTMLInputElement;
    const priceValue = this.element.querySelector(
      '#priceValue'
    ) as HTMLDivElement;

    priceRange.addEventListener('input', (e) => {
      const val = (e.target as HTMLInputElement).value;
      priceValue.textContent = `$${val}`;
    });

    priceRange.addEventListener('change', (e) => {
      const val = parseInt((e.target as HTMLInputElement).value, 10);
      this.store.setState({ maxPrice: val });
    });
  }

  private bindStoreUpdates(): void {
    const unsubCat = this.store.subscribe('selectedCategory', () =>
      this.render()
    );
    const unsubPrice = this.store.subscribe('maxPrice', () => this.render());
    this.unsubs.push(unsubCat, unsubPrice);
  }

  destroy(): void {
    this.unsubs.forEach((u) => u());
  }

  getElement(): HTMLElement {
    return this.element;
  }
}
