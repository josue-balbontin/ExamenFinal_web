import type { Product } from '../types/index.js';

export interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onCardClick?: (product: Product) => void;
}

export class ProductCardComponent {
  private props: ProductCardProps;
  private root: HTMLElement;

  constructor(props: ProductCardProps) {
    this.props = props;
    this.root = this.render();
  }

  private renderStars(rating: number): string {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars += `<span class="product-card__star product-card__star--full" aria-hidden="true">★</span>`;
      } else if (i === full && half) {
        stars += `<span class="product-card__star product-card__star--full" aria-hidden="true">★</span>`;
      } else {
        stars += `<span class="product-card__star product-card__star--empty" aria-hidden="true">★</span>`;
      }
    }
    return stars;
  }

  private render(): HTMLElement {
    const { product } = this.props;
    const card = document.createElement('article');
    card.className = 'product-card';

    // Image placeholder
    const imgWrapper = document.createElement('div');
    imgWrapper.className = 'product-card__img-wrapper';
    if (product.imageUrl) {
      const img = document.createElement('img');
      img.className = 'product-card__img';
      img.src = product.imageUrl;
      img.alt = product.name;
      img.loading = 'lazy';
      img.width = 280;
      img.height = 200;
      imgWrapper.appendChild(img);
    } else {
      imgWrapper.innerHTML = `
        <svg class="product-card__img-placeholder" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 80" aria-label="Sin imagen disponible">
          <rect width="100" height="80" fill="#c8c8c8"/>
          <rect x="20" y="10" width="60" height="45" rx="8" fill="#b0b0b0"/>
          <circle cx="38" cy="28" r="8" fill="#c8c8c8"/>
          <path d="M20 55 L38 35 L55 48 L68 38 L80 55Z" fill="#b8b8b8"/>
        </svg>
      `;
    }

    // Body
    const body = document.createElement('div');
    body.className = 'product-card__body';

    const category = document.createElement('p');
    category.className = 'product-card__category';
    category.textContent = product.category.toUpperCase();

    const name = document.createElement('h2');
    name.className = 'product-card__name';
    name.textContent = product.name;

    const seller = document.createElement('p');
    seller.className = 'product-card__seller';
    seller.innerHTML = `by <span>${product.seller}</span>`;

    const ratingWrapper = document.createElement('div');
    ratingWrapper.className = 'product-card__rating';
    ratingWrapper.setAttribute(
      'aria-label',
      `Calificación: ${product.rating} de 5, ${product.reviewCount} reseñas`
    );
    ratingWrapper.innerHTML = `
      <span class="product-card__stars" aria-hidden="true">${this.renderStars(product.rating)}</span>
      <span class="product-card__rating-value">${product.rating}</span>
      <span class="product-card__review-count">(${product.reviewCount.toLocaleString()})</span>
    `;

    const priceWrapper = document.createElement('div');
    priceWrapper.className = 'product-card__price-row';
    const priceEl = document.createElement('span');
    priceEl.className = 'product-card__price';
    priceEl.textContent = `$${product.price.toFixed(2)}`;
    priceWrapper.appendChild(priceEl);
    if (product.originalPrice) {
      const originalEl = document.createElement('span');
      originalEl.className = 'product-card__original-price';
      originalEl.textContent = `$${product.originalPrice.toFixed(2)}`;
      priceWrapper.appendChild(originalEl);
    }

    const addBtn = document.createElement('button');
    addBtn.className = 'product-card__add-btn';
    addBtn.innerHTML = `<span aria-hidden="true">+</span> Add to cart`;
    addBtn.addEventListener('click', () => this.props.onAddToCart(product));

    body.appendChild(category);
    body.appendChild(name);
    body.appendChild(seller);
    body.appendChild(ratingWrapper);
    body.appendChild(priceWrapper);
    body.appendChild(addBtn);

    card.appendChild(imgWrapper);
    card.appendChild(body);

    card.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('.product-card__add-btn')) return;
      this.props.onCardClick?.(product);
    });

    return card;
  }

  getElement(): HTMLElement {
    return this.root;
  }
}
