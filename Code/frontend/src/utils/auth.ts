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
    id: responseData.idUsuario ? String(responseData.idUsuario) : undefined,
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

export function restoreSession(): User | null {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payloadBase64 = token.split('.')[1];
    // Reemplazar caracteres Base64Url a Base64 estándar
    const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
    const decodedJson = atob(base64);
    const decoded = JSON.parse(decodedJson);

    // Verificar si el token ha expirado
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }

    const id =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
      ] || decoded.sub;
    const email =
      decoded[
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'
      ] || decoded.email;
    const name =
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] ||
      'Usuario';

    return {
      id: id ? String(id) : undefined,
      email: email || '',
      name: name,
      lastName: '',
    };
  } catch (e) {
    console.error('Error al decodificar el token:', e);
    localStorage.removeItem('token');
    return null;
  }
}

export async function forgotPasswordService(
  email: string
): Promise<string | null> {
  const { data: responseData, error } = await api.POST(
    '/Auth/olvido-password',
    {
      body: { email },
    }
  );

  if (error) {
    throw new Error(
      ((error as Record<string, unknown>)?.mensaje as string) ||
        'Error al solicitar recuperación de contraseña.'
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (responseData as any)?.token || null;
}

export async function resetPasswordService(
  token: string,
  nuevoPassword: string
): Promise<void> {
  const { error } = await api.POST('/Auth/reset-password', {
    body: { token, nuevoPassword },
  });

  if (error) {
    throw new Error(
      ((error as Record<string, unknown>)?.mensaje as string) ||
        'Error al restablecer la contraseña.'
    );
  }
}
