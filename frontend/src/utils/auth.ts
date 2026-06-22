import type { User, LoginFormData, RegisterFormData } from '../types/index.js';

const MOCK_USER = {
  email: 'demo@ejemplo.com',
  password: '123456',
  name: 'Usuario Demo',
};

// Simulated in-memory user store
const registeredUsers: Array<{
  email: string;
  password: string;
  name: string;
  lastName: string;
  phone: string;
  address: string;
}> = [];

export async function loginService(data: LoginFormData): Promise<User> {
  await delay(900);

  // Check mock user
  if (data.email === MOCK_USER.email && data.password === MOCK_USER.password) {
    return { email: MOCK_USER.email, name: MOCK_USER.name };
  }

  // Check registered users
  const found = registeredUsers.find(
    (u) => u.email === data.email && u.password === data.password
  );
  if (found) {
    return { email: found.email, name: found.name, lastName: found.lastName };
  }

  throw new Error('Correo o contraseña incorrectos.');
}

export async function registerService(data: RegisterFormData): Promise<User> {
  await delay(900);

  const exists =
    registeredUsers.some((u) => u.email === data.email) ||
    data.email === MOCK_USER.email;

  if (exists) {
    throw new Error('Ya existe una cuenta con ese correo.');
  }

  registeredUsers.push({
    email: data.email,
    password: data.password,
    name: data.name,
    lastName: data.lastName,
    phone: data.phone,
    address: data.address,
  });

  return { email: data.email, name: data.name, lastName: data.lastName };
}

export async function logoutService(): Promise<void> {
  await delay(200);
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}
