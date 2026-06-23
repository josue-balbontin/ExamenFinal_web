import createClient from 'openapi-fetch';
import type { paths } from '../types/api.js';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5181';

// Cliente tipado autogenerado con openapi-fetch
export const api = createClient<paths>({ baseUrl: API_URL });

// Middleware para inyectar token JWT automáticamente
api.use({
  onRequest({ request }) {
    const token = localStorage.getItem('token');
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
    return request;
  },
});
