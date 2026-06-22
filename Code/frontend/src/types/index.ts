export interface User {
  email: string;
  name?: string;
  lastName?: string;
  phone?: string;
  address?: string;
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
}

export type Category =
  | 'Todo'
  | 'Electronicos'
  | 'Fashion'
  | 'Libros'
  | 'Hogar'
  | 'Deportes'
  | 'Belleza';

export type Route =
  | '/'
  | '/login'
  | '/register'
  | '/dashboard'
  | '/home'
  | '/product';
export interface AppState {
  auth: AuthState;
  currentRoute: Route;
  cart: Product[];
  searchQuery: string;
  selectedCategory: Category;
  maxPrice: number;
}

export type Listener<T> = (state: T) => void;
