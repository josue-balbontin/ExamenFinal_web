import type { Product } from './index.js';

export interface CartItem {
  product: Product;
  quantity: number;
}
