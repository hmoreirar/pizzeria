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
- `GET /api/categories` — catálogo de categorías
- `GET /api/products` — productos activos (opcional `?category=<id>`)

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
