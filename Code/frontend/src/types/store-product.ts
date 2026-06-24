export type StockStatus = 'in-stock' | 'low' | 'out-of-stock';

export interface StoreProduct {
  id: string;
  name: string;
  price: number;
  stock: number;
  status: StockStatus;
  imageUrl?: string;
}
