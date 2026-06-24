# ADR 0004: Comunicación entre Módulos


## Contexto
En un Monolito Modular, los módulos (Auth, Admin, API Pública, UGC, Notificaciones, y Módulo de Negocio) necesitan interactuar entre sí. Por ejemplo:
- Cuando un cliente hace una compra (Módulo de Negocio), debe generarse una alerta para el vendedor (Módulo de Notificaciones).
- Cuando el módulo de búsqueda indexa datos, necesita información del módulo de catálogo.
- Cuando un usuario guarda un producto en favoritos (Módulo UGC), el módulo UGC debe verificar que el usuario y el producto existen.

Opciones consideradas:
1. **Comunicación asíncrona mediante un Message Broker externo (RabbitMQ o Redis Pub/Sub):** Todos los módulos emiten eventos que otros módulos escuchan.
2. **Llamadas directas mediante interfaces in-process (síncronas):** Los módulos exponen interfaces públicas (facades o servicios) y se comunican invocando métodos directamente en memoria, dado que comparten el mismo proceso y memoria en el Monolito.
3. **Comunicación híbrida:** Interfaces in-process para operaciones transaccionales y de lectura, e in-memory event bus o Redis para analíticas, UGC y Notificaciones.

## Decisión
Adoptamos la opción **(3) Comunicación híbrida**.

## Consecuencias
**Positivas:**
- **Facilidad y velocidad:** Para operaciones CRUD normales y validaciones estrictas, usar métodos in-process elimina la latencia de red, fallos de serialización, y hace que las transacciones en la base de datos (con Entity Framework) puedan abarcar operaciones complejas de manera atómica, cuando es estrictamente necesario, aunque evitando cruzar boundaries.
- **Desacoplamiento asíncrono donde importa:** Módulos como **Notificaciones** y **UGC** (reseñas, calificaciones, recolección de eventos) no deben penalizar la latencia del flujo de negocio. Emitir eventos (ya sea con un bus de eventos en memoria como MediatR o apoyado en Redis) asegura que si el envío del email falla, la compra del cliente no hace rollback.
- **Mantenibilidad:** El código es explícito. Si un módulo A depende del módulo B, la dependencia se ve en el constructor (Inyección de Dependencias de una Interfaz Pública) o en el `Event Handler`.

**Negativas:**
- El equipo debe ser estricto para diferenciar cuándo usar llamadas síncronas (mediante Facades) y cuándo usar eventos (mediante Event Bus). 
- Se requiere configuración del Linter de boundaries para evitar que los desarrolladores bypaseen las interfaces públicas e instancien directamente repositorios internos de otros módulos.
