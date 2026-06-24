# ADR 0005: Frontend Framework y Arquitectura



## Contexto
El sistema requiere una aplicación frontend SPA que consuma todos los módulos del backend y demuestre de extremo a extremo las historias de usuario. Además, las restricciones del proyecto especifican el uso de metodologías de estilos estrictas (BEM), tipado estricto con TypeScript, y justificar la arquitectura elegida (MVC o FSD).

Opciones consideradas para el Framework:
1. **React:** Muy popular, gran ecosistema, facilita la reactividad mediante hooks.
2. **Angular:** Ecosistema completo (baterías incluidas), arquitectura sólida por defecto.
3. **Vanilla TS + Web Components / Custom Observer:** Desarrollar la aplicación desde cero sin frameworks pesados, apoyándose en los estándares web modernos, para mantener un bundle extremadamente ligero y entender a fondo el ciclo de vida.

Opciones consideradas para la Arquitectura:
1. **FSD (Feature-Sliced Design):** Ideal para proyectos masivos, divide fuertemente el código por dominios funcionales (app, pages, widgets, features, entities, shared).
2. **MVC / Arquitectura por Capas Clásica:** Separación técnica tradicional (components, pages, styles, utils, services).

## Decisión
Adoptamos la opción de **Vanilla TypeScript con Patrón Propio (Custom Store, Observer & Router)** y una **Arquitectura basada en MVC / Capas Clásica**.

## Consecuencias
**Positivas:**
- **Control total:** Al no usar frameworks como React, se tiene control absoluto sobre el DOM y el ciclo de pintado. El tamaño final del bundle de la aplicación es diminuto, cumpliendo con creces la restricción de chunks < 350 KB gzipped.
- **Rendimiento:** Las actualizaciones se hacen de manera granular mediante un patrón Observer propietario, sin la sobrecarga del Virtual DOM.
- **Simplicidad arquitectónica:** La arquitectura MVC (separando `pages` para las vistas, `components` para pedazos reutilizables de UI y `utils`/`store` para los modelos/controladores) es fácil de entender y encaja perfecto con la complejidad actual del proyecto, evitando el exceso de "boilerplate" que FSD introduciría en una app Vanilla JS.

**Negativas:**
- Mayor esfuerzo de desarrollo inicial para crear la fontanería básica (Router, State Management y Data Binding) que un framework como React/Angular ya provee de caja.
- Es imperativo el uso estricto de TypeScript (`strict: true`) y linters (ESLint, `eslint-plugin-boundaries`) para evitar que el código Vanilla se vuelva inmanejable. 
- La arquitectura MVC puede empezar a quedarse corta si la lógica de los componentes de negocio (ej. carrito + ofertas flash) se vuelve demasiado compleja, requiriendo en el futuro migrar a FSD o a un framework declarativo.
