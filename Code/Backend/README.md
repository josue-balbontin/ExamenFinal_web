# Backend - Marketplace Multivendedor

Este directorio contiene el corazón del monolito modular del Marketplace, el cual está dividido en dos grandes dominios por tecnología, equilibrando el rendimiento transaccional y la velocidad de desarrollo en las tareas de administración.

## Estructura de Directorios

- **`/Backend`**: Contiene la API Principal del Marketplace desarrollada en **C# (.NET) con Entity Framework**. Este componente maneja la carga pesada, la interacción con clientes, carritos, la API Pública, el flujo UGC (reseñas/favoritos) y el sistema de Precios Dinámicos / Ofertas Flash.
- **`/Admin`**: Contiene el Panel Administrativo desarrollado en **Python con Django**. Se encarga exclusivamente de la moderación interna, aprobación de solicitudes a vendedor por parte de Recursos Humanos (RRHH) y la gestión jerárquica de categorías.

## Setup y Ejecución Local (Desarrollo)

A continuación, se describen los pasos para levantar ambos componentes localmente sin Docker para poder desarrollar y debugear en tiempo real. 

### Prerrequisitos Globales
- Asegurarse de tener corriendo las bases de datos requeridas (puedes levantar solamente las BD usando el `docker-compose.yml` en el root del proyecto).
- Un archivo `.env.development` correctamente configurado en la raíz para que el ORM y Django se conecten.

---

### 1. API Principal (C# .NET)

**Requisitos:** .NET 8.0+ SDK

1. Navega hasta el directorio del backend:
   ```bash
   cd Backend
   ```
2. Restaura las dependencias:
   ```bash
   dotnet restore
   ```
3. Ejecuta el servidor en modo desarrollo (con Hot Reload):
   ```bash
   dotnet watch run
   ```
4. **Testing:**
   Para ejecutar las pruebas unitarias y de integración de la lógica de negocio (por ejemplo, tests en `Infraestructura` y `Controladores`):
   ```bash
   dotnet test
   ```
5. **OpenAPI / Swagger:**
   El contrato API se auto-genera y es accesible por defecto en `http://localhost:<puerto>/swagger`. De este JSON el frontend consume y genera sus tipos (openapi-typescript).

---

### 2. Panel Administrativo (Django)

**Requisitos:** Python 3.10+

1. Navega hasta el directorio del admin:
   ```bash
   cd Admin
   ```
2. Crea y activa un entorno virtual:
   ```bash
   python -m venv venv
   # En Windows:
   .\venv\Scripts\activate
   # En macOS/Linux:
   source venv/bin/activate
   ```
3. Instala los requerimientos:
   ```bash
   pip install -r requirements.txt
   ```
4. Aplica las migraciones del sistema si es necesario (el esquema ya debería estar montado en postgres, pero se requiere para inicializar las tablas de sesión de Django si usas otra DB local):
   ```bash
   python manage.py migrate
   ```
5. Levanta el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```
6. **Testing y Linter:**
   Se utiliza un linter de imports para asegurar que Django no rompa los límites modulares del Monolito Modular. Para validar la limpieza del código o correr unit tests de Python:
   ```bash
   pytest
   ```

## Documentación Arquitectónica

Para comprender las decisiones sobre las bases de datos y la separación entre C# y Python, revisar las ADRs correspondientes en el directorio raíz de la documentación:
- [ADR 002 - Base de Datos PostgreSQL con Esquemas por Módulo](../../docs/adr/0002-postgres-con-schemas-por-modulo.md)
- [ADR 003 - Stack del Módulo Auth](../../docs/adr/0003-stack-del-modulo-auth.md)
- [ADR 004 - Comunicación entre Módulos](../../docs/adr/0004-comunicacion-entre-modulos.md)
