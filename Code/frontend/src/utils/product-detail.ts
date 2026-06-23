import type { ProductDetail } from '../types/product-detail.js';

const MOCK_REVIEWS = [
  {
    id: 'r1',
    userName: 'nombre usuario',
    rating: 5,
    date: 'fechaaa',
    text: 'reviewwwwwwwwwwwwwwwww',
  },
  {
    id: 'r2',
    userName: 'nombre usuario',
    rating: 4,
    date: 'fechaaa',
    text: 'reviewwwwwwwwwwwwwwwww',
  },
];

export function getMockProductDetail(id: string): ProductDetail {
  return {
    id,
    name: 'nombre del producto',
    category: 'CATEGORIA',
    seller: 'nombre del vendedor',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.5,
    reviewCount: 2343,
    stock: 12,
    description: 'descripcionnnnnnnnnnnnnnn\nnnnnnnnnnnnnnnnnnnnn\nnnnnnnnnnnn',
    reviews: MOCK_REVIEWS,
  };
}

export function getRatingDistribution(
  reviews: { rating: number }[]
): Record<number, number> {
  const dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) dist[r.rating]++;
  });
  return dist;
}
