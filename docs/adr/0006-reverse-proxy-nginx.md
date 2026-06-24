# ADR 0006: Uso de NGINX como Reverse Proxy Único


## Contexto
En un entorno de Monolito Modular con un backend principal (C#), un backend administrativo (Django) y una aplicación frontend SPA (Vanilla TS), necesitamos definir cómo se exponen estos servicios al mundo exterior. Por razones de seguridad, facilidad de despliegue y manejo del CORS, no es recomendable exponer los puertos de cada contenedor (backend C#, frontend Vite, admin Django) directamente.

Opciones consideradas:
1. **Exponer todos los puertos (Backend, Admin, Frontend) y manejar CORS:** Cada cliente hace peticiones a distintos puertos/dominios.
2. **Reverse Proxy (NGINX / Traefik) como único punto de entrada:** Exponer solo un servidor web que rutea internamente el tráfico a los contenedores correctos según la ruta (path) de la URL.

## Decisión
Adoptamos la opción **(2) Reverse Proxy (NGINX) como único punto de entrada**, el cual expondrá los servicios bajo 3 rutas principales:

- **`/`**: Redirige al frontend (SPA), sirviendo los estáticos.
- **`/swagger` (y `/api`)**: Redirige al backend principal (Core C#) para consumo de API y documentación.
- **`/admin`**: Redirige al contenedor de Django (Panel Administrativo).

El archivo `docker-compose.yml` será estructurado de tal manera que el **único contenedor que expone puertos al host (80/443)** sea NGINX.

## Consecuencias
**Positivas:**
- **Seguridad mejorada:** Las bases de datos y los backends quedan ocultos en la red interna de Docker, sin exposición directa a internet.
- **Sin problemas de CORS:** Al compartir el mismo dominio y puerto base a través del proxy, las peticiones del frontend a `/api` son "same-origin", eliminando dolores de cabeza con configuraciones de CORS.
- **Gestión centralizada:** Cualquier configuración de caché estático, compresión (Gzip/Brotli) o certificados SSL se maneja en un único archivo de configuración (`nginx.conf`).

**Negativas:**
- Agrega un componente extra de infraestructura que debe ser configurado y mantenido.
- La configuración de enrutamiento en NGINX para aplicaciones SPA requiere asegurar que rutas desconocidas devuelvan el `index.html` para el enrutamiento del lado del cliente, y evitar choques de rutas entre el frontend y las APIs.
