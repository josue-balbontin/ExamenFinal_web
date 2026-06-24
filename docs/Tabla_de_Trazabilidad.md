# Tabla de Trazabilidad

Esta tabla relaciona cada Historia de Usuario  con el endpoint en el Backend que la atiende, la pantalla o componente en el Frontend donde el usuario interactúa

| ID HU | Historia de Usuario | Endpoint Backend | Pantalla/Flujo Frontend |
|---|---|---|---|
| **US-AUTH-01** | Registro de nuevo cliente | `POST /api/auth/register` | `/register` (Pantalla de Registro) |
| **US-AUTH-02** | Inicio de sesión de usuario | `POST /api/auth/login` | `/login` (Pantalla de Login) |
| **US-AUTH-03** | Recuperación de contraseña | `POST /api/auth/forgot-password` | `/forgot-password` |
| **US-AUTH-04** | Edición de información de perfil | `PUT /api/users/profile` | `/profile/edit` |
| **US-ADM-01** | Aprobar/Rechazar solicitudes de vendedor | `POST /admin/sellers/{id}/approve` | `/admin/sellers` (Panel Django) |
| **US-ADM-02** | Agregar nuevo producto al catálogo | `POST /api/seller/products` | `/seller/products/new` |
| **US-ADM-03** | Solicitud para volverse vendedor | `POST /api/users/seller-request` | `/profile/seller-request` |
| **US-ADM-04** | Editar productos del catálogo | `PUT /api/seller/products/{id}` | `/seller/products/{id}/edit` |
| **US-ADM-04** | Como vendedor ver mis productos | `GET /api/seller/products` | `/seller/products` |
| **US-API-01** | Búsqueda de productos (Elasticsearch) | `GET /api/public/products/search?q={query}` | `/search` |
| **US-API-02** | Listado de catálogo paginado | `GET /api/public/products?page={p}` | `/` (Home) |
| **US-API-03** | Vista de detalle de producto | `GET /api/public/products/{id}` | `/product/{id}` |
| **US-UGC-01** | Calificar y dejar reseña de producto | `POST /api/ugc/reviews/{id}` | `/product/{id}#reviews` |
| **US-UGC-02** | Carrito de compras multivendedor | `POST /api/cart/items` | `/cart` |
| **US-UGC-03** | Proceso de compra y pago (Checkout) | `POST /api/cart/checkout` | `/checkout` |
| **US-NOT-01** | Alertas in-app para usuarios | `GET /api/notifications/ws` | Menú (Campanita) |
| **US-MOD-01** | Detección de IP y geolocalización | HTTP Middleware | N/A (Backend) |
| **US-MOD-02** | Cálculo de precios dinámicos por región | `GET /api/public/products/{id}/price` | `/product/{id}` (Precio adaptado) |
| **US-MOD-03** | Creación de ofertas flash temporales | `POST /api/seller/flash-sales` | `/seller/flash-sales/new` |
| **US-MOD-04** | Temporizador visual para ofertas flash | `GET /api/public/flash-sales/active` | `/` (Banner Ofertas Flash) |
