Luis Ruben Velasquez Garcia  
Carnet 24011341  
5to Semestre - Curso Interfaz y Experiencia de Usuario UI/UX
Tarea - 2ndo proyecto - Monitoreo energia IoT  
Tecnico desarrollador Fullstack  
Universidad Galileo

# ⚡ Dashboard de Monitoreo IoT - Energía Real-Time

Sistema Full-Stack escalable para el monitoreo en tiempo real de nodos generadores de energía (M2M). Este proyecto integra una arquitectura impulsada por eventos, seguridad basada en JWT y un pipeline de Integración Continua (CI) automatizado.

## 🏗️ Arquitectura del Sistema

El proyecto sigue una arquitectura monolítica modular separada en dos directorios principales (Frontend y Backend), permitiendo un desarrollo ágil y escalamiento independiente de los servicios.

- **Frontend (Cliente):** SPA desarrollada con React y Vite. Interfaz reactiva impulsada por WebSockets para actualizaciones en tiempo real sin polling.
- **Backend (API & Motor de Eventos):** Servidor Node.js estructurado en 3 capas (Rutas, Controladores, Servicios). Maneja la ingesta de datos del simulador IoT y despacha eventos a clientes conectados.
- **Base de Datos:** PostgreSQL relacional para el almacenamiento histórico de métricas y metadatos de los nodos.
- **Seguridad:** Autenticación y Autorización delegada a Auth0. Validación de tokens RSA tanto en endpoints HTTP como en el Handshake de WebSockets.

## 🛠️ Stack Tecnológico

**Frontend:**

- React 18 (Vite)
- Chart.js / React-Chartjs-2 (Visualización de datos)
- Socket.io-client (Tiempo real)
- Vitest & React Testing Library (Unit Testing)

**Backend:**

- Node.js & Express
- PostgreSQL (pg pool)
- Socket.io (Motor de eventos WebSocket)
- Auth0 (jwks-rsa, express-jwt)
- Jest & Supertest (Integration & Unit Testing)

**DevOps & CI/CD:**

- GitHub Actions (Quality Gate, min 80% Coverage)

---

## 🚀 Requisitos Previos

Asegúrate de tener instalados los siguientes componentes antes de iniciar:

- [Node.js](https://nodejs.org/) (v18 o superior)
- [PostgreSQL](https://www.postgresql.org/) (v14 o superior)
- Cuenta de [Auth0](https://auth0.com/) configurada con un Tenant activo.

---

## ⚙️ Instalación y Configuración Local

### 1. Clonar el repositorio

```bash
git clone [https://github.com/tu-usuario/monitoreo_Energia_IOT.git](https://github.com/tu-usuario/monitoreo_Energia_IOT.git)
cd monitoreo_Energia_IOT
```

### 2. Configuración de Base de Datos

Ejecuta los scripts SQL (ubicados en la documentación o carpeta correspondiente) en tu servidor PostgreSQL para crear las tablas `nodos` y `metricas_log`.

### 3. Configuración del Backend

```bash
cd backend
npm install
```

Crea un archivo `.env` en la carpeta `backend/` con las siguientes variables:

```
PORT=3000
DATABASE_URL=postgresql://usuario:password@localhost:5432/nombre_db
AUTH0_DOMAIN=[https://tu-tenant.us.auth0.com/](https://tu-tenant.us.auth0.com/)
AUTH0_AUDIENCE=http://tu-api-identificador
```

Inicia el servidor en modo desarrollo:

```bash
npm run dev
```

### 4. Configuración del Frontend

En una nueva terminal:

```bash
cd frontend
npm install
```

Crea un archivo `.env` en la carpeta `frontend/` (variables expuestas a Vite):

```
VITE_API_URL=http://localhost:3000
VITE_AUTH0_DOMAIN=tu-tenant.us.auth0.com
VITE_AUTH0_CLIENT_ID=tu_client_id
VITE_AUTH0_AUDIENCE=http://tu-api-identificador
```

Inicia la aplicacion frontend:

```bash
npm run dev
```

## 🧪 Testing y Control de Calidad (CI)

El proyecto cuenta con una estricta política de validación de código mediante GitHub Actions.

Ejecutar pruebas del Backend (Jest + Supertest):

```bash
cd backend
npm test
```

_(Incluye validación de Coverage con umbrales estrictos de Statements, Branches y Functions)_.

Ejecutar pruebas del Frontend (Vitest):

```bash
cd frontend
npm test
```

## 📡 API Endpoints Principales

| Método | Endpoint                     | Descripción                                | Protegido |
| :----- | :--------------------------- | :----------------------------------------- | :-------- |
| `GET`  | `/api/nodos`                 | Obtiene la lista de nodos registrados      | 🔒 Sí     |
| `GET`  | `/api/metricas/estado-nodos` | Obtiene distribución de estados (Dona)     | 🔒 Sí     |
| `GET`  | `/api/metricas/historico`    | Obtiene el historial para gráfica de línea | 🔒 Sí     |
| `GET`  | `/api/metricas/logs`         | Obtiene logs detallados con filtros        | 🔒 Sí     |
| `POST` | `/api/metricas`              | Ingesta de datos del simulador IoT         | 🔒 Sí     |
