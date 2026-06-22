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

export type Route = '/' | '/login' | '/register' | '/dashboard';

export interface AppState {
  auth: AuthState;
  currentRoute: Route;
}

export type Listener<T> = (state: T) => void;
