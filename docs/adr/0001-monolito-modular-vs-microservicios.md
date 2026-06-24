# ADR 0001: Arquitectura de Monolito Modular vs Microservicios


## Contexto
El proyecto final consiste en desarrollar una plataforma tipo Marketplace multivendedor con funcionalidades de Admin, Autenticación, Catálogo, UGC y un módulo de negocio específico (Precios Dinámicos y Ofertas Flash). Se requiere una arquitectura que permita mantener un código limpio, separación de responsabilidades y facilidad de despliegue, considerando que el equipo cuenta con recursos y tiempo limitados.

Las opciones consideradas fueron:
1. **Monolito Tradicional (Big Ball of Mud):** Un único código acoplado donde todas las funcionalidades se mezclan.
2. **Microservicios:** Cada módulo (Auth, Admin, API Pública, UGC) desarrollado como un servicio independiente, con su propio repositorio, despliegue y base de datos, comunicándose a través de la red (API REST/gRPC/Redis).
3. **Monolito Modular:** Una única unidad de despliegue (aplicación), pero con una estructura interna estrictamente separada por módulos de negocio (namespaces o carpetas lógicas), comunicándose a través de interfaces in-process y manteniendo un fuerte aislamiento a nivel de código.

## Decisión
Adoptamos la opción **(3) Monolito Modular**.

## Consecuencias
**Positivas:**
- **Simplicidad operativa:** Un solo despliegue para el core de negocio en C# y un despliegue asociado para el panel administrativo en Django. No requiere orquestación compleja (Kubernetes) ni lidiar con fallos de red continuos entre microservicios.
- **Desarrollo ágil:** Al estar en un mismo entorno, el refactoring y el tipado estricto abarcan todo el sistema. Es más fácil arrancar el proyecto en desarrollo (`docker-compose up` simple).
- **Aislamiento lógico:** El código se organiza en módulos (Admin, Auth, Public API, UGC), lo que evita la "bola de barro" y permite en el futuro, si hay necesidad, extraer algún módulo a un microservicio real con un esfuerzo predecible.
- **Eficiencia:** La comunicación interna entre la mayoría de los módulos (dentro del core C#) se realiza en memoria (in-process), reduciendo la latencia comparado con llamadas HTTP entre microservicios.

**Negativas:**
- Exige disciplina en el equipo para no romper los límites del módulo importando clases o modelos internos de otros módulos directamente, forzando el uso de `import-linter` o revisión de PRs.
- No se puede escalar un solo módulo individualmente (ej. escalar solo el módulo de búsqueda), se escala todo el monolito en conjunto. Sin embargo, para la carga esperada actual y a mediano plazo, el escalado horizontal de todo el monolito modular es más que suficiente.
