export type StockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

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
