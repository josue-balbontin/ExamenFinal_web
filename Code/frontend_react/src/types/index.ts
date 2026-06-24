// Cart items definition moved below
import type { AppNotification } from './notification.js';

export interface User {
  id?: string;
  email: string;
  name?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  memberSince?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  name: string;
  lastName: string;
  phone: string;
  address: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationErrors {
  email?: string;
  password?: string;
}

export interface RegisterValidationErrors {
  email?: string;
  name?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  seller: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  imageUrl?: string;
  flashSaleActive?: boolean;
  flashSaleEndDate?: string;
}

export type Category = string;

export type Route =
  | '/'
  | '/login'
  | '/register'
  | '/dashboard'
  | '/home'
  | '/product'
  | '/profile'
  | '/checkout'
  | '/forgot-password'
  | '/reset-password';

export interface CartItem {
  idProducto: number;
  nombreProducto: string;
  urlImagen?: string;
  precioUnitario: number;
  cantidad: number;
  subtotal: number;
  idVendedor: number;
  nombreVendedor: string;
}

export interface AppState {
  auth: AuthState;
  currentRoute: Route;
  cart: CartItem[];
  cartOpen: boolean;
  notifications: AppNotification[];
  notifOpen: boolean;
  searchQuery: string;
  selectedCategory: Category;
  maxPrice: number;
}

export type Listener<T> = (state: T) => void;
