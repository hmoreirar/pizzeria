# 🍕 Pizzeria

Sistema de pedidos online para una pizzería local. MVP en construcción.

## Stack

- **Backend**: Node.js 22 + TypeScript + Express 5
- **Base de datos**: PostgreSQL 15 (Docker)
- **Migraciones**: `node-pg-migrate` (SQL crudo)
- **Validación**: Zod
- **Tests**: Vitest + Supertest
- **Frontend**: React 19 + TypeScript + Vite

## Estructura

```text
pizzeria/
  backend/     API Express + TypeScript + tests
  frontend/    Aplicación React + Vite
  docs/        Decisiones y notas del proyecto
```

## Requisitos

- Node.js 22+
- Docker (para PostgreSQL)

## Puesta en marcha

### 1. Levantar la base de datos

```bash
docker compose up -d
```

### 2. Configurar el backend

```bash
cd backend
cp .env.example .env   # ajusta valores si es necesario
npm install
```

### 3. Aplicar migraciones

```bash
npm run migrate
```

### 4. Cargar datos de ejemplo (opcional)

```bash
npm run seed
```

### 5. Arrancar el backend

```bash
npm run dev
```

La API queda disponible en `http://localhost:4000`. Health check en `GET /api/health`.

### 6. Arrancar el frontend (en otra terminal)

```bash
cd frontend
npm install
npm run dev
```

La web queda en `http://localhost:5173`. Vite reenvía las peticiones a `/api` al backend.

## Endpoints

- `GET /api/health` — estado de la app y de la base de datos
- `GET /api/categories` — categorías activas, ordenadas para la navegación
- `GET /api/products` — productos activos (opcional `?category=<id>`)
- `GET /api/products/:id` — detalle del producto con sus grupos y opciones
- `GET /api/settings` — configuración pública (costo de despacho)
- `POST /api/orders/quote` — valida el carrito y devuelve el precio recalculado en el backend
- `POST /api/orders` — crea un pedido (compra anónima) recalculando precios en el backend
- `GET /api/orders/:id` — estado y detalle del pedido (seguimiento)

## Administración

Panel en `/admin` (login obligatorio). Credenciales iniciales:

```text
email:    admin@pizzeria.cl
password: admin1234
```

Configurables con las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` (ver `.env.example`).
El secreto de sesión `JWT_SECRET` también debe estar definido.

Endpoints administrativos (requieren `Authorization: Bearer <token>`):

- `POST /api/auth/login` — obtiene el token
- `GET /api/admin/dashboard` — métricas operacionales
- `GET /api/admin/orders`, `GET /api/admin/orders/:id`, `PATCH /api/admin/orders/:id/status`
- `GET/POST/PATCH /api/admin/products` (+ `/option-groups` y `/options` para opciones)
- `GET/POST/PATCH /api/admin/categories`

> La autorización real vive en el backend (middleware `requireAdmin`).

> El catálogo cargado por `npm run seed` es un **placeholder de demostración**
> (nombres con "(demo)"); se reemplazará por el menú real al final del MVP.

## Producción / Deploy

```bash
cd frontend && npm run build
cd ../backend && npm run build
cd backend && npm start   # sirve API + frontend en un solo puerto
```

Guía paso a paso para desplegar en Render: ver [`DEPLOY.md`](./DEPLOY.md).

## Tests

Los tests corren contra una base de datos aislada (`pizzeria_test`). Créala una sola vez:

```bash
docker compose exec db createdb -U pizza pizzeria_test
```

Luego:

```bash
cd backend
npm test
```

## Ver type checking

```bash
cd backend
npm run typecheck
```
