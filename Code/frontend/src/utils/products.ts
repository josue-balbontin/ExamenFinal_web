import type { Product, Category } from '../types/index.js';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'nombre producto',
    category: 'Electronicos',
    seller: 'nombrevendedor',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewCount: 2341,
  },
  {
    id: '2',
    name: 'nombre producto',
    category: 'Fashion',
    seller: 'nombrevendedor',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewCount: 2341,
  },
  {
    id: '3',
    name: 'nombre producto',
    category: 'Libros',
    seller: 'nombrevendedor',
    price: 349.99,
    originalPrice: 399.99,
    rating: 4.8,
    reviewCount: 2341,
  },
  {
    id: '4',
    name: 'nombre producto',
    category: 'Hogar',
    seller: 'nombrevendedor',
    price: 199.99,
    originalPrice: 249.99,
    rating: 4.5,
    reviewCount: 1200,
  },
  {
    id: '5',
    name: 'nombre producto',
    category: 'Deportes',
    seller: 'nombrevendedor',
    price: 89.99,
    originalPrice: 120.0,
    rating: 4.2,
    reviewCount: 875,
  },
  {
    id: '6',
    name: 'nombre producto',
    category: 'Belleza',
    seller: 'nombrevendedor',
    price: 59.99,
    originalPrice: 79.99,
    rating: 4.6,
    reviewCount: 3100,
  },
  {
    id: '7',
    name: 'nombre producto',
    category: 'Electronicos',
    seller: 'nombrevendedor',
    price: 799.99,
    originalPrice: 999.99,
    rating: 4.9,
    reviewCount: 512,
  },
  {
    id: '8',
    name: 'nombre producto',
    category: 'Fashion',
    seller: 'nombrevendedor',
    price: 45.0,
    originalPrice: 65.0,
    rating: 4.3,
    reviewCount: 670,
  },
  {
    id: '9',
    name: 'nombre producto',
    category: 'Hogar',
    seller: 'nombrevendedor',
    price: 129.99,
    originalPrice: 159.99,
    rating: 4.7,
    reviewCount: 990,
  },
];

export const MAX_PRICE_DEFAULT = 1200;

export function filterProducts(
  products: Product[],
  query: string,
  category: Category,
  maxPrice: number
): Product[] {
  return products.filter((p) => {
    const matchesCategory = category === 'Todo' || p.category === category;
    const matchesPrice = p.price <= maxPrice;
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.category.toLowerCase().includes(query.toLowerCase()) ||
      p.seller.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesPrice && matchesQuery;
  });
}
