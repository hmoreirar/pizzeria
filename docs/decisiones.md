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
