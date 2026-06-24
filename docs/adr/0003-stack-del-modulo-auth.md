# ADR 0003: Stack del Módulo Auth


## Contexto
El sistema requiere autenticación, autorización basada en roles (Cliente, Vendedor, Full Admin, RRHH), gestión segura de sesiones, y capacidad para emitir tokens (Access y Refresh). En un entorno de Monolito Modular con componentes compartidos, necesitamos definir en qué tecnología y formato se manejará el módulo de Auth de forma centralizada y segura.

El panel de administración (Admin) está construido en Python con Django, mientras que la API principal está construida en C#.

Opciones consideradas:
1. **Django Auth + Sesiones clásicas:** Utilizar las sesiones de Django (Cookies y DB) para todo el sistema, y exponer APIs en Django para que React (Frontend) valide las sesiones.
2. **Servicio externo (Auth0 / Firebase Auth / Cognito):** Delegar la gestión de identidades a un tercero.
3. **Módulo Auth propio basado en JWT con Access & Refresh Tokens:** Desarrollar el módulo Auth en el core de C#, emitiendo JSON Web Tokens (JWT) que Django también pueda validar.

## Decisión
Adoptamos la opción **(3) Módulo Auth propio basado en JWT con Access & Refresh Tokens, implementado en C#**.

## Consecuencias
**Positivas:**
- **Rendimiento e Independencia:** Al usar JWT firmado, cualquier servicio (como la API pública en C# o el panel de Django) puede validar la identidad del usuario sin tener que consultar a la base de datos de Auth en cada request, lo cual mejora dramáticamente la latencia (p95 < 300 ms).
- **Desacoplamiento:** El token es el estándar universal (RFC 7519). Django y C# tienen librerías maduras para verificar firmas y parsear claims sin depender mutuamente a nivel de código.
- **Control total:** No dependemos del vendor lock-in ni de los costos de servicios externos (Auth0).
- **Seguridad:** El manejo de Access (corta duración, in-memory o short-lived cookies) y Refresh Tokens (larga duración, httpOnly cookies o storage seguro) permite revocar accesos en caso de compromiso mitigando riesgos de seguridad XSS/CSRF.

**Negativas:**
- Mayor responsabilidad de desarrollo. Hay que implementar la lógica de login, refresh automático del lado del cliente, almacenamiento seguro, recuperación de password, y validación en ambos endpoints (Django y C#).
- Para la invalidación inmediata (Logout o expulsión), se requiere un mecanismo adicional (ej. lista negra de JWT en Redis), lo que introduce cierta complejidad extra en comparación a las sesiones basadas en estado tradicional.
