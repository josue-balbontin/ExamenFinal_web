export type StockStatus = 'in-stock' | 'low' | 'out-of-stock';

export interface StoreProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  status: StockStatus;
  idCategoria?: number;
  imageUrl?: string;
}
