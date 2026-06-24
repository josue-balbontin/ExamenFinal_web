# ADR 0002: Base de Datos PostgreSQL con Esquemas Agrupados

## Contexto
El sistema sigue una arquitectura de monolito modular. Inicialmente se podía pensar en un esquema por cada submódulo lógico (Auth, Admin, API Pública, UGC, Módulo de Negocio), pero para equilibrar la separación de responsabilidades con la simplicidad operativa, necesitamos decidir cómo agrupar lógicamente estas tablas.

Opciones consideradas:
1. **Un solo schema "public":** Todas las tablas viven juntas. Se confía en la convención de nombres.
2. **Un schema estricto por cada módulo:** `auth`, `admin`, `catalog`, `ugc`, etc. (Multiplicidad de schemas).
3. **Schemas agrupados estratégicamente (2 schemas):** Se separan los datos en dos grandes dominios que tienen ciclos de vida y niveles de seguridad diferentes: la gestión de acceso/identidad y la operativa comercial del marketplace.

## Decisión
Adoptamos la opción **(3) Schemas agrupados estratégicamente**, consolidando la persistencia en exactamente **dos (2)** schemas dentro de la misma base de datos PostgreSQL:

1. **`esquema_usuarios`**: Exclusivo para la gestión de identidad, perfiles y autenticación (contiene las tablas `usuarios` y `roles`).
2. **`esquema_marketplace`**: Para todo el core de negocio, catálogo, ventas, interacciones (UGC) y ofertas flash (contiene tablas como `productos`, `categorias`, `pedidos`, `detalles_pedido`, `ofertas_flash`, `precios_geolocalizados`, etc.).

## Consecuencias
**Positivas:**
- **Simplicidad mantenible:** Administrar solo 2 schemas es mucho más sencillo que gestionar 5 o 6, reduciendo la complejidad en el ORM (Entity Framework) y las migraciones.
- **Aislamiento crítico de seguridad:** La separación garantiza que los datos sensibles de autenticación (`esquema_usuarios`) estén lógicamente aislados de la operativa diaria del negocio (`esquema_marketplace`), protegiendo contraseñas y accesos.
- **Eficiencia operativa:** Una sola base de datos facilita el backup integral, mientras que la separación en 2 schemas sigue permitiendo un volcado segmentado si alguna vez se extrae la identidad a un microservicio Auth independiente.

**Negativas:**
- Al consolidar la operativa en `esquema_marketplace`, varios submódulos (Catálogo, Pedidos, UGC, Negocio) comparten el mismo espacio de base de datos. Se delega al código de la aplicación (linters y separación de carpetas en C#) la responsabilidad de no romper los límites modulares internos del negocio.
