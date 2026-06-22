import type {
  ValidationErrors,
  LoginFormData,
  RegisterValidationErrors,
  RegisterFormData,
} from '../types/index.js';

export function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'El correo es requerido.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'Ingresa un correo válido.';
}

export function validatePassword(password: string): string | undefined {
  if (!password) return 'La contraseña es requerida.';
  if (password.length < 6) return 'Mínimo 6 caracteres.';
}

export function validateLoginForm(data: LoginFormData): ValidationErrors {
  return {
    email: validateEmail(data.email),
    password: validatePassword(data.password),
  };
}

export function validateRequired(
  value: string,
  label: string
): string | undefined {
  if (!value.trim()) return `${label} es requerido.`;
}

export function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) return 'El teléfono es requerido.';
  const re = /^\+?[\d\s\-()]{7,20}$/;
  if (!re.test(phone)) return 'Ingresa un teléfono válido.';
}

export function validateConfirmPassword(
  password: string,
  confirm: string
): string | undefined {
  if (!confirm) return 'Confirma tu contraseña.';
  if (password !== confirm) return 'Las contraseñas no coinciden.';
}

export function validateRegisterForm(
  data: RegisterFormData
): RegisterValidationErrors {
  return {
    email: validateEmail(data.email),
    name: validateRequired(data.name, 'El nombre'),
    lastName: validateRequired(data.lastName, 'El apellido'),
    phone: validatePhone(data.phone),
    address: validateRequired(data.address, 'La dirección'),
    password: validatePassword(data.password),
    confirmPassword: validateConfirmPassword(
      data.password,
      data.confirmPassword
    ),
  };
}

export function hasErrors(
  errors: ValidationErrors | RegisterValidationErrors
): boolean {
  return Object.values(errors).some(Boolean);
}
