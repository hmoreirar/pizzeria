# Deploy en Render

Guía para desplegar la pizzería en [Render](https://render.com).

## Arquitectura

- **Un solo web service** (Node 22) sirve la API (`/api/*`) y el frontend estático
  (SPA con Vite) desde el mismo puerto → **sin CORS**.
- **PostgreSQL** gestionado por Render (`DATABASE_URL` se inyecta automáticamente).
- Las migraciones corren en cada arranque (idempotentes).

## Pasos

### 1. Subir el repositorio a GitHub

Render hace deploy desde GitHub. Confirma que `.env` **no** está commiteado
(ya está en `.gitignore`).

### 2. Crear la base de datos

1. En Render: **New → PostgreSQL**.
2. Al terminar, copia la **Internal Database URL** (o usa el enlace "Connect").
   Ese valor será `DATABASE_URL`.

### 3. Crear el Web Service

1. **New → Web Service** y conecta el repositorio.
2. Configura:
   - **Root Directory**: (raíz del repo, dejarlo vacío)
   - **Environment**: Node
   - **Build Command**:
     ```bash
     cd frontend && npm ci --include=dev && npm run build && cd ../backend && npm ci --include=dev && npm run build
     ```
   - **Start Command**:
     ```bash
     cd backend && npm run migrate:prod && npm start
     ```

> `--include=dev` es necesario porque Render define `NODE_ENV=production`, que
> haría saltarse las dependencias de desarrollo (TypeScript, Vite…) durante el build.

### 4. Variables de entorno

| Variable | Valor |
| --- | --- |
| `DATABASE_URL` | La URL interna de la BD (Render la inyecta al enlazarla) |
| `JWT_SECRET` | Un secreto fuerte (ej. `openssl rand -hex 32`) |
| `NODE_ENV` | `production` (Render suele definirla sola) |
| `ADMIN_EMAIL` | Opcional, cambia el admin por defecto (`admin@pizzeria.cl`) |
| `ADMIN_PASSWORD` | Opcional, cambia la clave por defecto (`admin1234`) |

`PORT` lo inyecta Render automáticamente (el backend lo lee de `process.env`).

### 5. Primer arranque

- Las migraciones se aplican con `npm run migrate:prod` en el start (idempotentes).
- Para datos de ejemplo: ejecutar `npm run seed` una vez (desde la consola del
  servicio), o crearlos desde el panel `/admin` (productos y categorías).

## Checklist de seguridad antes de publicar

- [ ] `JWT_SECRET` real (no el valor de desarrollo).
- [ ] `ADMIN_EMAIL` / `ADMIN_PASSWORD` cambiadas.
- [ ] `.env` fuera del repositorio.

## Build local (verificación)

```bash
cd frontend && npm run build
cd ../backend && npm run build
cd backend && npm start   # sirve API + frontend en http://localhost:4000
```
