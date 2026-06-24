import type { StoreProduct } from '../types/store-product.js';

export const MOCK_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'sp1',
    name: 'NOMBRE PRODUCTO',
    price: 89.99,
    stock: 24,
    status: 'in-stock',
  },
  { id: 'sp2', name: 'NOMBRE PRODUCTO', price: 34.0, stock: 3, status: 'low' },
  {
    id: 'sp3',
    name: 'NOMBRE PRODUCTO',
    price: 28.5,
    stock: 0,
    status: 'out-of-stock',
  },
  {
    id: 'sp4',
    name: 'NOMBRE PRODUCTO',
    price: 22.0,
    stock: 41,
    status: 'in-stock',
  },
  { id: 'sp5', name: 'NOMBRE PRODUCTO', price: 48.0, stock: 11, status: 'low' },
];

export function getStockLabel(product: StoreProduct): {
  text: string;
  modifier: string;
} {
  if (product.status === 'out-of-stock')
    return { text: '⚠ Sin stock', modifier: 'out' };
  if (product.status === 'low')
    return { text: `Bajo — ${product.stock}`, modifier: 'low' };
  return { text: `${product.stock} en stock`, modifier: 'ok' };
}

export function getStockBarWidth(stock: number, max = 50): number {
  return Math.min((stock / max) * 100, 100);
}
