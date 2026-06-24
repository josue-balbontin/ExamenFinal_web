import { useSyncExternalStore } from 'react';
import { Store } from './utils/store';
import type { AppState } from './types';
import { MAX_PRICE_DEFAULT } from './utils/products';
import { restoreSession } from './utils/auth';

const restoredUser = restoreSession();

const initialState: AppState = {
  auth: {
    isAuthenticated: !!restoredUser,
    user: restoredUser,
    loading: false,
    error: null,
  },
  currentRoute: '/login',
  cart: [],
  cartOpen: false,
  notifications: [],
  notifOpen: false,
  searchQuery: '',
  selectedCategory: 'Todo',
  maxPrice: MAX_PRICE_DEFAULT,
};

export const globalStore = new Store<AppState>(initialState);

export function useStore(): AppState {
  return useSyncExternalStore(
    (callback) => globalStore.subscribe(callback),
    () => globalStore.getState(),
    () => globalStore.getState()
  );
}

export function useStoreSelector<T>(selector: (state: AppState) => T): T {
  return useSyncExternalStore(
    (callback) => globalStore.subscribe(callback),
    () => selector(globalStore.getState()),
    () => selector(globalStore.getState())
  );
}
