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

### 4. Arrancar el backend

```bash
npm run dev
```

La API queda disponible en `http://localhost:4000`. Health check en `GET /health`.

## Tests

```bash
cd backend
npm test
```

## Ver type checking

```bash
cd backend
npm run typecheck
```
