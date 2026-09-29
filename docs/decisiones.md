# Decisiones técnicas

Registro de las decisiones importantes del proyecto y su justificación.
Se completa fase a fase.

## Fase 0 — Auditoría

- No existe un proyecto de pizzería previo. `ecommerce-fullstack-react-node` (Nicommerce)
  es un ecommerce genérico que sirve solo como referencia, no como base.
- Decisión: **proyecto nuevo y limpio**.

## Fase 1 — Fundación

| Decisión | Alternativa | Razón |
| --- | --- | --- |
| TypeScript full-stack | JavaScript puro | Tipado, mejor detección de errores, mejor experiencia de tests |
| Express 5 | Fastify | Ecosistema y documentación más amplios; más fácil de aprender |
| `tsx` para dev + `tsc` para typecheck | ts-node | `tsx` es rápido y simple |
| CommonJS como target de TS | ESM nativo | Evita la confusión de extensiones `.js` en imports TS y la fricción de `node-pg-migrate` con ESM; Node soporta CJS de forma estable |
| `pg` + `node-pg-migrate` | ORM (Drizzle/Prisma) | SQL crudo: transparencia total y mínimas dependencias |
| PostgreSQL en Docker (puerto 5433) | PostgreSQL del sistema | Aislado, reproducible, sin necesitar `sudo` ni credenciales del sistema |
| `app.ts` separado de `index.ts` | Todo en un archivo | Permite testear la app con Supertest sin abrir un puerto |
| Variables de entorno validadas con Zod | Leer `process.env` a mano | Fallo temprano y claro si falta una variable |
| Vitest + Supertest | Jest | Más rápido y cero configuración con TypeScript |

## Fase 2 — Catálogo

| Decisión | Alternativa | Razón |
| --- | --- | --- |
| Prefijo `/api` en todas las rutas | Rutas sin prefijo | API consistente; permite proxy de Vite sin CORS |
| Migraciones en `.js` | Migraciones en `.ts` | `node-pg-migrate` carga JS CommonJS sin fricción |
| SQL crudo con `pgm.sql()` | API fluida `pgm.createTable()` | Transparencia: se ve el SQL y los constraints |
| Capa `repositories/` (funciones planas) | SQL en las rutas | Separa SQL de HTTP, reutilizable y testeable |
| BD de tests `pizzeria_test` + tests secuenciales | BD de dev / mocks | Integración aislada; `fileParallelism: false` evita colisiones |
| Tailwind 4 vía `@tailwindcss/vite` | CSS a mano | Stack acordado; primera UI real |
| Moneda CLP (solo formato) | Otra moneda | Contexto chileno; se guarda `DECIMAL` sin decimales |
| Seed como script (`npm run seed`) | Seed en migración | Separa esquema de datos de demo |

## Fase 2 — Productos configurables y precios

| Decisión | Alternativa | Razón |
| --- | --- | --- |
| Opciones como `option_groups` + `options` (precio base + `price_delta`) | Columnas específicas por tamaño (`large_price`/`family_price`) | Modelo genérico: cubre tamaño, extras y futuros grupos sin migrar el esquema |
| Tamaños de pizza (Grande·32cm / Familiar·38cm) como opciones del grupo "Tamaño" | Tabla/columnas dedicadas a tamaños | Reutiliza el sistema de opciones; precio final = base + Σ `price_delta` |
| `categories.active` + `sort_order` | Sin control de visibilidad/orden | El panel admin podrá desactivar y ordenar categorías (§19) |
| Configuración `settings` (key-value, `delivery_fee` en BD) | Constante en `.env` o hardcode en el frontend | Config operacional editable por admin; el precio nunca se calcula en el cliente |
| Precio "desde" = precio base del producto | — | El base es el mínimo posible; las opciones solo suman sobreprecio |
| Paleta de marca vía `@theme` de Tailwind 4 | Colores arbitrarios / paleta por defecto | Identidad propia definida por la especificación (§4) |

## Fase 2 — Placeholder de catálogo

- El `seed` carga un catálogo **placeholder** (nombres con "(demo)") para no inventar
  masas, ingredientes ni extras. Solo el grupo "Tamaño" (Grande·32cm / Familiar·38cm)
  es dato de especificación.
- El menú real está en revisión y reemplazará al placeholder al final del MVP.

## Fase 3 — Carrito

| Decisión | Alternativa | Razón |
| --- | --- | --- |
| Carrito en frontend (estado React + `localStorage`) | Carrito en servidor (`carts`/`cart_items`) | MVP: el carrito es efímero y por dispositivo; el pedido real se crea solo al confirmar |
| Servicio de precios compartido (`services/pricing.ts`) | SQL/validación en cada ruta | La misma lógica de validación + cálculo se reutiliza en `quote` (fase 3) y en la creación del pedido (fase 4) |
| `POST /api/orders/quote` para validación backend | Solo estimación en el frontend | El precio nunca se confía del cliente; el backend valida producto/opciones/pertenencia y recalcula |
| `price_delta` ≥ 0 (solo sobreprecios) | Deltas negativos (descuentos) | Modelo "base + suma de opciones"; no hay descuentos en el MVP |

## Fase 4 — Compra anónima

| Decisión | Alternativa | Razón |
| --- | --- | --- |
| Snapshot de entrega embebido en `orders` (columnas `delivery_*`) | Tabla `deliveries` separada | Relación 1:1 y simple; el pedido conserva la dirección usada al momento (§9) |
| Snapshot de opciones como JSONB en `order_items` (`options`) | Tabla normalizada `order_item_options` | No se consultan opciones entre pedidos; JSONB es simple y suficiente (§11) |
| `order_items` conserva `product_name` + `unit_price` | FK a productos sin snapshot | El pedido no cambia si mañana cambia el precio (§11) |
| Estados de pedido con `CHECK` (6 valores) | Texto libre / enum de app | Integridad en BD; coinciden con el spec (§12) |
| `payment_method` y `payment_status` como columnas separadas en `orders` | Tabla `payments` ahora | El MVP solo necesita método+estado; la tabla se extrae al integrar Webpay/MP (§6/§7) |
| Transacción para insertar `orders` + `order_items` | Inserts sueltos | Evita pedidos a medias |
| `user_id` se omite hasta la fase de cuentas de cliente | Columna `user_id` sin FK ahora | No añadir columnas hasta necesitarlas (§15) |

## Fase 5 — Administración

| Decisión | Alternativa | Razón |
| --- | --- | --- |
| JWT (`jsonwebtoken`) para sesión de admin | Sesión con cookie + tabla `sessions` | Stateless y mínimo de dependencias; un único admin |
| Hash de contraseña con `crypto.scrypt` (nativo) | `bcryptjs` | Sin dependencias extra; `timingSafeEqual` para comparar |
| Middleware `requireAdmin` en backend | Solo ocultar botones en React | La autorización real es del servidor (§8) |
| Rutas admin bajo `/api/admin` con `requireAdmin` | Prefijos sueltos | Protección central y auditable |
| Admin inicial vía seed (credenciales de `env`) | Usuario en migración | Configurable y reseteable con `npm run seed` |
| Opciones administrables: agregar/eliminar/activar | Editor completo inline de cada campo | MVP: cubre la operación diaria sin sobre-ingeniería |
