import React, { useEffect, useState } from 'react';
import type { Product } from '../types/index';
import { ProductCard } from './ProductCard';
import { fetchProducts } from '../utils/products';
import { addToCart } from '../utils/cartServices';
import { useStore, globalStore } from '../storeInstance';
import { useNavigate } from 'react-router-dom';

export const ProductGrid: React.FC = () => {
  const { searchQuery, selectedCategory, maxPrice } = useStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [currentProducts, setCurrentProducts] = useState<Product[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const products = await fetchProducts(searchQuery, selectedCategory, maxPrice);
        setCurrentProducts(products);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadProducts();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [searchQuery, selectedCategory, maxPrice]);

  if (loading) {
    return (
      <div className="product-grid__wrapper">
        <div className="product-grid__empty" role="status">
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (currentProducts.length === 0) {
    return (
      <div className="product-grid__wrapper">
        <div className="product-grid__empty" role="status">
          <p>No se encontraron productos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-grid__wrapper">
      <div className="product-grid" role="list">
        {currentProducts.map((product) => (
          <div key={product.id} role="listitem">
            <ProductCard
              product={product}
              onAddToCart={(productId, quantity) => {
                addToCart(globalStore, productId, quantity);
              }}
              onCardClick={(p) => {
                navigate(`/product/${p.id}`);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
