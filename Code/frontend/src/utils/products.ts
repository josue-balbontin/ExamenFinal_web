import type { Product, Category } from '../types/index.js';
import { api } from './api.js';

export const MAX_PRICE_DEFAULT = 1200;

export async function fetchProducts(
  query: string = '',
  category: string = 'Todo',
  maxPrice: number = MAX_PRICE_DEFAULT,
  pagina: number = 1
): Promise<Product[]> {
  try {
    const { data: backendProducts, error } = await api.GET('/Producto', {
      params: {
        query: {
          terminoBusqueda: query || undefined,
          pagina,
        },
      },
    });

    if (error || !backendProducts) {
      return [];
    }

    // Backend devuelve IEnumerable<ProductoResponseDto>, mapeamos a nuestro tipo Product
    const products: Product[] = (
      backendProducts as Record<string, unknown>[]
    ).map((p: Record<string, unknown>) => ({
      id: p.idProducto ? String(p.idProducto) : '',
      name: (p.nombre as string) || '',
      category:
        (p.nombreCategoria as string) || (p.categoria as string) || 'Todo',
      seller: (p.nombreVendedor as string) || 'Vendedor',
      price: (p.precioBase as number) || 0,
      originalPrice: (p.precioBase as number) || 0,
      rating: (p.estrellas as number) || 0,
      reviewCount: (p.cantidadReviews as number) || 0,
      imageUrl: (p.urlImagen as string) || undefined,
    }));

    // Filtramos localmente por categoría (ya que no estamos mandando List<int> al backend aún) y precio
    return products.filter((p) => {
      const matchesCategory =
        category === 'Todo' ||
        p.category.toLowerCase() === category.toLowerCase();
      const matchesPrice = p.price <= maxPrice;
      return matchesCategory && matchesPrice;
    });
  } catch (error) {
    console.error('Error fetching products from backend:', error);
    return [];
  }
}

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
