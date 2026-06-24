import React, { useEffect, useState } from 'react';
import type { Product } from '../types/index';
import { formatPrice } from '../utils/currency';

export interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: number, quantity: number) => void;
  onCardClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onCardClick,
}) => {
  const [timerText, setTimerText] = useState<string | null>(null);

  useEffect(() => {
    let interval: number;

    if (product.flashSaleActive && product.flashSaleEndDate) {
      const updateTimer = () => {
        const now = new Date().getTime();
        const end = new Date(product.flashSaleEndDate!).getTime();
        const diff = end - now;

        if (diff <= 0) {
          setTimerText(null);
          if (interval) clearInterval(interval);
          return;
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimerText(
          `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        );
      };

      updateTimer();
      interval = window.setInterval(updateTimer, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [product.flashSaleActive, product.flashSaleEndDate]);

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < 5; i++) {
      if (i < full) {
        stars.push(
          <span key={i} className="product-card__star product-card__star--full" aria-hidden="true">★</span>
        );
      } else if (i === full && half) {
        stars.push(
          <span key={i} className="product-card__star product-card__star--full" aria-hidden="true">★</span>
        );
      } else {
        stars.push(
          <span key={i} className="product-card__star product-card__star--empty" aria-hidden="true">★</span>
        );
      }
    }
    return stars;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('.product-card__add-btn')) return;
    onCardClick?.(product);
  };

  return (
    <article className="product-card" onClick={handleCardClick}>
      <div className="product-card__img-wrapper">
        {product.imageUrl ? (
          <img
            className="product-card__img"
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            width={280}
            height={200}
          />
        ) : (
          <svg
            className="product-card__img-placeholder"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 100 80"
            aria-label="Sin imagen disponible"
          >
            <rect width="100" height="80" fill="#c8c8c8" />
            <rect x="20" y="10" width="60" height="45" rx="8" fill="#b0b0b0" />
            <circle cx="38" cy="28" r="8" fill="#c8c8c8" />
            <path d="M20 55 L38 35 L55 48 L68 38 L80 55Z" fill="#b8b8b8" />
          </svg>
        )}
        {timerText !== null && (
          <div className="product-card__flash-timer" style={{ display: 'block' }}>
            {timerText}
          </div>
        )}
      </div>

      <div className="product-card__body">
        <p className="product-card__category">{product.category.toUpperCase()}</p>
        <h2 className="product-card__name">{product.name}</h2>
        <p
          className="product-card__seller"
          dangerouslySetInnerHTML={{ __html: `by <span>${product.seller}</span>` }}
        />
        <div className="product-card__rating" aria-label={`Calificación: ${product.rating} de 5`}>
          <span className="product-card__stars" aria-hidden="true">
            {renderStars(product.rating)}
          </span>
          <span className="product-card__rating-value">{product.rating}</span>
        </div>
        <div className="product-card__price-row">
          <span className="product-card__price">{formatPrice(product.price)}</span>
          {product.originalPrice && product.originalPrice !== product.price && (
            <span className="product-card__original-price">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
        <button
          className="product-card__add-btn"
          onClick={() => onAddToCart(parseInt(product.id, 10), 1)}
        >
          <span aria-hidden="true">+</span> Añadir al carrito
        </button>
      </div>
    </article>
  );
};
