import type { ProductDetail, Review } from '../types/product-detail.js';
import { api } from './api.js';

export async function fetchProductDetail(id: string): Promise<ProductDetail> {
  const numId = parseInt(id, 10);

  // Llamadas concurrentes al API (desactivando la caché local del navegador)
  const [productRes, reviewsRes] = await Promise.all([
    api.GET('/Producto/{id}', {
      params: { path: { id: numId } },
      cache: 'no-store' as RequestCache,
    }),
    api.GET('/Producto/{id}/reviews', {
      params: { path: { id: numId } },
      cache: 'no-store' as RequestCache,
    }),
  ]);

  if (productRes.error) {
    throw new Error('No se pudo obtener el producto');
  }

  const p = productRes.data;
  const reviewsData = reviewsRes.data?.comentarios || [];

  const reviews: Review[] = reviewsData.map(
    (r: Record<string, unknown>, index: number) => ({
      id: r.idResena ? String(r.idResena) : index.toString(),
      userId: r.idUsuario ? String(r.idUsuario) : undefined,
      userName: (r.nombreUsuario as string) || 'Usuario Anónimo',
      rating: (r.calificacion as number) || 0,
      date: r.fecha ? new Date(r.fecha as string).toLocaleDateString() : '',
      text: (r.comentario as string) || '',
    })
  );

  const avgRating = reviewsRes.data?.promedioEstrellas || 0;

  let dist: Record<number, number> | undefined;
  if (reviewsRes.data?.distribucion) {
    const d = reviewsRes.data.distribucion as Record<string, unknown>;
    dist = {
      5: (d.cincoEstrellas as number) || 0,
      4: (d.cuatroEstrellas as number) || 0,
      3: (d.tresEstrellas as number) || 0,
      2: (d.dosEstrellas as number) || 0,
      1: (d.unaEstrella as number) || 0,
    };
  }

  return {
    id: p.idProducto?.toString() || '',
    name: p.nombre || '',
    category: p.categoria || 'Sin categoría',
    seller: p.nombreVendedor || 'Vendedor',
    price: p.precioAplicado ?? p.precioBase ?? 0,
    originalPrice: p.precioBase || 0,
    rating: avgRating,
    reviewCount: reviews.length,
    stock: p.stock || 0,
    description: p.descripcion || '',
    reviews,
    distribution: dist,
    imageUrl: p.urlImagen || undefined,
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

export async function submitReview(
  productId: string,
  rating: number,
  text: string
): Promise<{
  avgRating: number;
  reviewCount: number;
  reviews: Review[];
  distribution: Record<number, number>;
}> {
  const { error } = await api.POST('/Producto/{id}/reviews', {
    params: { path: { id: parseInt(productId, 10) } },
    body: { calificacion: rating, comentario: text },
  });

  if (error) {
    throw new Error(
      ((error as Record<string, unknown>)?.mensaje as string) ||
        'No se pudo enviar la reseña'
    );
  }

  // Obtener los reviews actualizados
  const reviewsRes = await api.GET('/Producto/{id}/reviews', {
    params: { path: { id: parseInt(productId, 10) } },
    cache: 'no-store' as RequestCache,
  });

  const reviewsData = reviewsRes.data?.comentarios || [];
  const reviews: Review[] = reviewsData.map(
    (r: Record<string, unknown>, index: number) => ({
      id: r.idResena ? String(r.idResena) : index.toString(),
      userId: r.idUsuario ? String(r.idUsuario) : undefined,
      userName: (r.nombreUsuario as string) || 'Usuario Anónimo',
      rating: (r.calificacion as number) || 0,
      date: r.fecha ? new Date(r.fecha as string).toLocaleDateString() : '',
      text: (r.comentario as string) || '',
    })
  );

  const avgRating = reviewsRes.data?.promedioEstrellas || 0;
  const reviewCount = reviews.length;

  let dist: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (reviewsRes.data?.distribucion) {
    const d = reviewsRes.data.distribucion as Record<string, unknown>;
    dist = {
      5: (d.cincoEstrellas as number) || 0,
      4: (d.cuatroEstrellas as number) || 0,
      3: (d.tresEstrellas as number) || 0,
      2: (d.dosEstrellas as number) || 0,
      1: (d.unaEstrella as number) || 0,
    };
  }

  return { avgRating, reviewCount, reviews, distribution: dist };
}
