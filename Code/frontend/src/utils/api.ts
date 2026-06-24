import createClient from 'openapi-fetch';
import type { paths } from '../types/api.js';
import { showStatusModal } from '../components/StatusModal.js';

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

    const region = localStorage.getItem('region');
    if (region) {
      request.headers.set('X-Region', region);
    }

    return request;
  },
  async onResponse({ response }) {
    if (!response.ok) {
      const status = response.status;
      let msg = 'Ocurrió un error inesperado. Por favor, intenta más tarde.';

      if (status >= 400 && status < 500) {
        msg = `Error de solicitud (${status}): Por favor, revisa los datos enviados o inténtalo nuevamente.`;
      } else if (status >= 500) {
        msg = `Error del servidor (${status}): Nuestro sistema está experimentando problemas. Por favor, intenta más tarde.`;
      }

      // Intentar extraer el mensaje de la respuesta si es JSON
      try {
        const cloned = response.clone();
        const json = await cloned.json();
        if (json && typeof json.mensaje === 'string') {
          msg = json.mensaje;
        }
      } catch (e) {
        // Ignorar si no es JSON
      }

      showStatusModal({
        title: 'Error',
        message: msg,
        type: 'error',
      });
    }
    return response;
  },
});
