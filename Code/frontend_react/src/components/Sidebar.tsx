import React, { useEffect, useState } from 'react';
import type { Category } from '../types/index';
import { MAX_PRICE_DEFAULT } from '../utils/products';
import { api } from '../utils/api';
import { useStore, globalStore } from '../storeInstance';

export const Sidebar: React.FC = () => {
  const { selectedCategory, maxPrice } = useStore();
  const [categories, setCategories] = useState<Category[]>(['Todo']);
  const [localPrice, setLocalPrice] = useState<string>(maxPrice.toString());

  useEffect(() => {
    setLocalPrice(maxPrice.toString());
  }, [maxPrice]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { data, error } = await api.GET('/Categoria');
        if (data && Array.isArray(data)) {
          const fetchedCats = (data as Record<string, unknown>[]).map(
            (c: Record<string, unknown>) => (c.nombre as string) || ''
          );
          setCategories(['Todo', ...fetchedCats.filter(Boolean)]);
        } else if (error) {
          console.error('Failed to load categories:', error);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    loadCategories();
  }, []);

  const handleCategoryClick = (cat: Category) => {
    globalStore.setState({ selectedCategory: cat });
  };

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalPrice(e.target.value);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    globalStore.setState({ maxPrice: parseInt(e.target.value, 10) });
  };

  return (
    <aside className="sidebar">
      <div>
        <h3 className="sidebar__label">CATEGORÍAS</h3>
        <ul className="sidebar__category-list">
          {categories.map((cat) => (
            <li key={cat}>
              <button
                className={`sidebar__category-btn ${
                  cat === selectedCategory ? 'sidebar__category-btn--active' : ''
                }`}
                data-category={cat}
                onClick={() => handleCategoryClick(cat)}
              >
                {cat}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="sidebar__label sidebar__label--price">PRECIO MÁXIMO</h3>
        <div className="sidebar__price-value" id="priceValue">
          ${localPrice}
        </div>
        <input
          type="range"
          className="sidebar__slider"
          id="priceRange"
          min="0"
          max={MAX_PRICE_DEFAULT}
          value={localPrice}
          step="10"
          onChange={handlePriceInput}
          onMouseUp={(e) => handlePriceChange(e as any)}
          onTouchEnd={(e) => handlePriceChange(e as any)}
        />
        <div className="sidebar__price-range">
          <span>$0</span>
          <span>${MAX_PRICE_DEFAULT}</span>
        </div>
      </div>
    </aside>
  );
};
