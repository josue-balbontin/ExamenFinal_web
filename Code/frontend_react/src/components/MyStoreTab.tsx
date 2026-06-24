import React, { useState, useEffect } from 'react';
import { formatPrice } from '../utils/currency';
import type { StoreProduct, StockStatus } from '../types/store-product';
import { getStockLabel, getStockBarWidth } from '../utils/store-products';
import { ProductFormModal } from './ProductFormModal';
import { SellerRequestModal } from './SellerRequestModal';
import { api } from '../utils/api';

export const MyStoreTab: React.FC = () => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<StoreProduct | undefined>(undefined);
  const [showSellerModal, setShowSellerModal] = useState(false);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(false);
      const { data, error: apiError } = await api.GET('/Producto/mis-productos');
      
      if (apiError) throw new Error('Error al cargar productos');

      const productsData = (data || []) as any[];
      const sorted = productsData.sort(
        (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime()
      );

      const formattedProducts = sorted.map((p) => {
        let stockStatus: StockStatus = 'in_stock';
        if (p.stock === 0) stockStatus = 'out_of_stock';
        else if (p.stock <= 5) stockStatus = 'low_stock';

        return {
          id: String(p.idProducto),
          name: p.nombre,
          description: p.descripcion,
          price: p.precioAplicado || p.precioBase || p.precio || 0,
          stock: p.stock,
          status: stockStatus,
          imageUrl: p.urlImagen || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=200',
          idCategoria: p.idCategoria,
          flashSalePercentage: p.ofertaFlash?.porcentajeDescuento,
          flashSaleStartDate: p.ofertaFlash?.fechaInicio,
          flashSaleEndDate: p.ofertaFlash?.fechaFin,
        } as StoreProduct;
      });

      setProducts(formattedProducts);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleEdit = (product: StoreProduct) => {
    if (product.status !== 'out_of_stock') {
      setSelectedProduct(product);
      setShowProductModal(true);
    }
  };

  const handleNewProduct = () => {
    setSelectedProduct(undefined);
    setShowProductModal(true);
  };

  if (loading) {
    return (
      <div className="my-store">
        <p className="my-store__loading">Cargando productos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-store">
        <div className="my-store__error-container">
          <p className="my-store__error">Hubo un error al cargar tus productos o no tienes permisos de vendedor.</p>
          <button 
            className="btn btn--primary" 
            style={{ marginTop: '1rem' }} 
            onClick={() => setShowSellerModal(true)}
          >
            Solicitar ser vendedor
          </button>
        </div>
        {showSellerModal && <SellerRequestModal onClose={() => setShowSellerModal(false)} />}
      </div>
    );
  }

  return (
    <div className="my-store">
      <div className="my-store__title-row">
        <div className="my-store__title-group">
          <h2 className="my-store__title">TUS PRODUCTOS</h2>
          <p className="my-store__subtitle">Maneja tus productos, stocks y estados</p>
        </div>
        <button className="my-store__new-btn" onClick={handleNewProduct}>
          <span aria-hidden="true">+</span> Nuevo Producto
        </button>
      </div>

      <div className="my-store__table" role="table" aria-label="Tus productos">
        <div className="my-store__thead" role="row">
          <div className="my-store__th my-store__th--product" role="columnheader">PRODUCT</div>
          <div className="my-store__th my-store__th--price" role="columnheader">PRECIO</div>
          <div className="my-store__th my-store__th--stock" role="columnheader">STOCK</div>
          <div className="my-store__th my-store__th--actions" role="columnheader">ACCIONES</div>
        </div>

        {products.map((product) => {
          const { text, modifier } = getStockLabel(product);
          const barWidth = getStockBarWidth(product.stock);

          return (
            <div key={product.id} className="my-store__row" role="row">
              <div className="my-store__td my-store__td--product" role="cell">
                <div className="my-store__product-img" aria-hidden="true">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} loading="lazy" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 36" aria-hidden="true">
                      <rect width="48" height="36" fill="#d1d5db"/>
                      <rect x="8" y="4" width="32" height="22" rx="4" fill="#b0b0b0"/>
                      <circle cx="18" cy="13" r="5" fill="#d1d5db"/>
                      <path d="M8 26 L18 16 L26 22 L32 16 L40 26Z" fill="#c0c0c0"/>
                    </svg>
                  )}
                </div>
                <span className="my-store__product-name">{product.name}</span>
              </div>
              
              <div className="my-store__td my-store__td--price" role="cell">
                {formatPrice(product.price)}
              </div>
              
              <div className="my-store__td my-store__td--stock" role="cell">
                <span className="my-store__stock-number">{product.stock}</span>
                <div className="my-store__stock-bar-track" role="progressbar" aria-valuenow={product.stock} aria-valuemin={0} aria-valuemax={50}>
                  <div className={`my-store__stock-bar-fill my-store__stock-bar-fill--${modifier}`} style={{ width: `${barWidth}%` }}></div>
                </div>
                <span className={`my-store__stock-label my-store__stock-label--${modifier}`}>{text}</span>
              </div>
              
              <div className="my-store__td my-store__td--actions" role="cell">
                <button 
                  className={`my-store__edit-btn${product.status === 'out_of_stock' ? ' my-store__edit-btn--disabled' : ''}`}
                  disabled={product.status === 'out_of_stock'}
                  aria-label={`Editar ${product.name}`}
                  onClick={() => handleEdit(product)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Editar
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {showProductModal && (
        <ProductFormModal 
          product={selectedProduct} 
          onClose={() => {
            setShowProductModal(false);
            loadProducts();
          }} 
        />
      )}
    </div>
  );
};
