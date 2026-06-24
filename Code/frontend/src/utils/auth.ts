import type { User, LoginFormData, RegisterFormData } from '../types/index.js';
import { api } from './api.js';

export async function loginService(data: LoginFormData): Promise<User> {
  const { data: responseData, error } = await api.POST('/Auth/login', {
    body: {
      email: data.email,
      password: data.password,
    },
  });

  if (error || !responseData) {
    throw new Error(
      ((error as Record<string, unknown>)?.mensaje as string) ||
        'Correo o contraseña incorrectos.'
    );
  }

  if (responseData.token) {
    localStorage.setItem('token', responseData.token);
  }

  return {
    email: responseData.email || data.email,
    name: responseData.nombre || 'Usuario',
    lastName: responseData.apellido || '',
    phone: responseData.telefono || undefined,
    address: responseData.direccionPrincipal || undefined,
    memberSince: responseData.fechaRegistro
      ? new Date(responseData.fechaRegistro).toLocaleDateString('es-ES', {
          month: 'long',
          year: 'numeric',
        })
      : undefined,
  };
}

export async function registerService(data: RegisterFormData): Promise<User> {
  const { error } = await api.POST('/Auth/registro', {
    body: {
      email: data.email,
      password: data.password,
      nombre: data.name,
      apellido: data.lastName,
      telefono: data.phone,
      direccion: data.address,
    },
  });

  if (error) {
    throw new Error(
      ((error as Record<string, unknown>)?.mensaje as string) ||
        'Error al registrar.'
    );
  }

  return {
    email: data.email,
    name: data.name,
    lastName: data.lastName,
  };
}

export async function logoutService(): Promise<void> {
  localStorage.removeItem('token');
}
