export interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  text: string;
}

export interface ProductDetail {
  id: string;
  name: string;
  category: string;
  seller: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  description: string;
  imageUrl?: string;
  reviews: Review[];
}
