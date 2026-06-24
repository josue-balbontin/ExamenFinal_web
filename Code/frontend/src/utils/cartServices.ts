/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from './api.js';
import type { Store } from './store.js';
import type { AppState } from '../types/index.js';

export async function fetchCart(store: Store<AppState>) {
  if (!store.getState().auth.isAuthenticated) return;
  const { data, error } = await api.GET('/CarritoControlador');
  if (data && !error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.setState({ cart: (data as any).items || [] });
  }
}

export async function addToCart(
  store: Store<AppState>,
  idProducto: number,
  cantidad: number = 1
) {
  if (!store.getState().auth.isAuthenticated) {
    store.setState({ cartOpen: true }); // Optionally, show a toast or redirect to login
    return;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await api.POST('/CarritoControlador/agregar', {
    body: { idProducto, cantidad },
  } as any);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  if (data && !error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.setState({ cart: (data as any).items || [], cartOpen: true });
  } else {
    console.error('Error al añadir al carrito:', error);
  }
}

export async function removeFromCart(
  store: Store<AppState>,
  idProducto: number
) {
  const { data, error } = await api.DELETE(
    '/CarritoControlador/remover/{idProducto}',
    {
      params: { path: { idProducto } },
    }
  );

  if (data && !error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    store.setState({ cart: (data as any).items || [] });
  } else {
    console.error('Error al remover del carrito:', error);
  }
}
