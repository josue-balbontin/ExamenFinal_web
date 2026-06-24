# Frontend - Marketplace Multivendedor

Este es el cliente frontend principal del proyecto, construido utilizando **Vanilla TypeScript, Vite** y una **Arquitectura MVC personalizada**, garantizando un bundle sumamente ligero y un control total sobre el ciclo de vida del DOM, utilizando metodologías CSS como BEM.

## Setup y Ejecución Local (Dev Server)

Si deseas correr el frontend de manera aislada (sin Docker) o para desarrollo con recarga en vivo (HMR):

### Prerrequisitos
- Node.js (v18+)
- NPM o Yarn

### Pasos

1. Asegúrate de estar en el directorio del frontend:
   ```bash
   cd Code/frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta el servidor de desarrollo de Vite:
   ```bash
   npm run dev
   ```
4. El servidor se levantará (usualmente en `http://localhost:5173`). 
> [!NOTE]
> Las variables de entorno ya están configuradas en Vite para apuntar a la ruta `/api` o `http://localhost:5181` por defecto, la cual es enrutada al monolito modular.

## Comandos Disponibles

- `npm run dev`: Levanta el entorno de desarrollo.
- `npm run build`: Compila el TypeScript y genera el bundle de producción para servir en NGINX.
- `npm run preview`: Previsualiza el bundle compilado localmente.
- `npm run lint`: Ejecuta el linter (ESLint) en el código TypeScript.
- `npm run lint:css`: Ejecuta el linter (Stylelint) para revisar la convención de estilos BEM.
- `npm run format`: Formatea el código automáticamente usando Prettier.
- `npm run generate-api`: Regenera los tipos del contrato de cliente usando el OpenAPI expuesto por el backend.

## Cómo correr Tests

Para ejecutar las pruebas Unitarias y E2E (End-to-End):

```bash
# Para ejecutar las pruebas unitarias:
npm run test

# Para ejecutar las pruebas e2e en el navegador localmente:
npm run test:e2e
```
*(Nota: Asegúrate de tener los navegadores instalados de acuerdo al framework de tests e2e empleado).*

## Validación en CI (Continuous Integration)

Como parte de la estrategia de integración continua definida con GitHub Actions, este proyecto corre una rigurosa validación automatizada en cada Pull Request antes de permitir cualquier merge:

El workflow ejecuta el siguiente script:
```bash
npm run validate
```

Este comando en cadena asegura de que:
1. **Pase el Linter de JS/TS:** `npm run lint` revisa que no hayan vulneraciones en las rules de ESLint (incluyendo `eslint-plugin-boundaries` y dependencias cruzadas) con tolerancia de warnings en 0.
2. **Pase el Linter de CSS:** `npm run lint:css` corrobora la correcta implementación de convenciones BEM usando Stylelint.
3. **El proyecto compile exitosamente:** Se invoca `tsc --noEmit` internamente mediante `npm run build` para asegurar que todo tipado es estricto y que el bundle resultante no presente chunks pesados sin justificación.

Si cualquiera de estos tres pasos falla, el Pipeline se rompe y el Pull Request queda bloqueado. Además, existe un *pre-commit hook* usando **Husky + lint-staged** que formatea (Prettier) e impide hacer commits de código sin lintear localmente.

## Links a Documentación y Decisiones Arquitectónicas (ADRs)

Para mayor entendimiento del razonamiento detrás de estas decisiones, por favor lee las ADRs asociadas a este frontend:

- [ADR 005 - Frontend Framework y Arquitectura](../../docs/adr/0005-frontend-framework-y-arquitectura.md)
- [ADR 006 - Uso de NGINX como Reverse Proxy Único](../../docs/adr/0006-reverse-proxy-nginx.md)
