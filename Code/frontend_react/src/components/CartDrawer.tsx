import React from 'react';
import { formatPrice } from '../utils/currency';
import type { CartItem } from '../types/index';
import { addToCart, removeFromCart } from '../utils/cartServices';
import { useStore, globalStore } from '../storeInstance';
import { useNavigate } from 'react-router-dom';

export const CartDrawer: React.FC = () => {
  const { cart, cartOpen } = useStore();
  const navigate = useNavigate();

  const handleClose = () => {
    globalStore.setState({ cartOpen: false });
  };

  const handleCheckout = (e: React.MouseEvent) => {
    e.preventDefault();
    globalStore.setState({ cartOpen: false });
    navigate('/checkout');
  };

  const groupedCart: Record<string, CartItem[]> = {};
  cart.forEach((item) => {
    const seller = item.nombreVendedor || 'Vendedor Desconocido';
    if (!groupedCart[seller]) groupedCart[seller] = [];
    groupedCart[seller].push(item);
  });

  const itemCount = cart.reduce((sum, i) => sum + i.cantidad, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div className="cart-drawer__wrapper">
      <div
        className={`cart-drawer-overlay${cartOpen ? ' cart-drawer-overlay--open' : ''}`}
        aria-hidden="true"
        onClick={handleClose}
      />
      <div
        className={`cart-drawer${cartOpen ? ' cart-drawer--open' : ''}`}
        role="dialog"
        aria-label="Carrito de compras"
        aria-modal="true"
      >
        <div className="cart-drawer__header">
          <h2 className="cart-drawer__title">SHOPPING CART</h2>
          <p className="cart-drawer__subtitle">
            {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
          <button
            className="cart-drawer__close"
            aria-label="Cerrar carrito"
            onClick={handleClose}
            dangerouslySetInnerHTML={{
              __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
            }}
          />
        </div>

        <div className="cart-drawer__body">
          {cart.length === 0 ? (
            <div className="cart-drawer__empty">
              <svg
                className="cart-drawer__empty-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="cart-drawer__empty-text">Your cart is empty</p>
              <button className="cart-drawer__continue" onClick={handleClose}>
                Continue shopping
              </button>
            </div>
          ) : (
            <>
              {Object.entries(groupedCart).map(([sellerName, items]) => (
                <React.Fragment key={sellerName}>
                  <h3
                    className="cart-drawer__seller-header"
                    style={{
                      marginTop: '1rem',
                      marginBottom: '0.5rem',
                      fontSize: '0.9rem',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    Vendido por: {sellerName}
                  </h3>
                  {items.map((item) => (
                    <div className="cart-drawer__item" key={item.idProducto}>
                      <div className="cart-drawer__item-img">
                        {item.urlImagen ? (
                          <img
                            src={item.urlImagen}
                            alt={item.nombreProducto}
                            loading="lazy"
                          />
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 60 45"
                            aria-hidden="true"
                          >
                            <rect width="60" height="45" fill="#d1d5db" />
                            <rect x="10" y="5" width="40" height="28" rx="5" fill="#b0b0b0" />
                            <circle cx="22" cy="16" r="6" fill="#d1d5db" />
                            <path d="M10 33 L22 20 L32 27 L40 20 L50 33Z" fill="#c0c0c0" />
                          </svg>
                        )}
                      </div>
                      <div className="cart-drawer__item-info">
                        <p className="cart-drawer__item-name">{item.nombreProducto}</p>
                        <span className="cart-drawer__item-price">
                          {formatPrice(item.subtotal)}
                        </span>
                        <div className="cart-drawer__item-controls">
                          <button
                            className="cart-drawer__qty-btn"
                            aria-label="Disminuir cantidad"
                            onClick={() => addToCart(globalStore, item.idProducto, -1)}
                          >
                            −
                          </button>
                          <span className="cart-drawer__qty-display">{item.cantidad}</span>
                          <button
                            className="cart-drawer__qty-btn"
                            aria-label="Aumentar cantidad"
                            onClick={() => addToCart(globalStore, item.idProducto, 1)}
                          >
                            +
                          </button>
                          <button
                            className="cart-drawer__remove-btn"
                            aria-label={`Eliminar ${item.nombreProducto} del carrito`}
                            onClick={() => removeFromCart(globalStore, item.idProducto)}
                            dangerouslySetInnerHTML={{
                              __html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </React.Fragment>
              ))}
              <div className="cart-drawer__footer">
                <div className="cart-drawer__total-row">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <a
                  className="cart-drawer__checkout-btn"
                  href="/checkout"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    textDecoration: 'none',
                  }}
                  onClick={handleCheckout}
                >
                  Ir al checkout
                </a>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
