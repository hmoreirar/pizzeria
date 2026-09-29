import 'dotenv/config'
import { z } from 'zod'

// Esquema que define qué variables de entorno necesita la app.
// Si falta alguna, la app se detiene al arrancar con un error claro,
// en lugar de fallar más tarde en un punto oscuro.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
  // Secreto para firmar los tokens de sesión del administrador.
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  // Credenciales iniciales del administrador (se crean con `npm run seed`).
  ADMIN_EMAIL: z.string().email().default('admin@pizzeria.cl'),
  ADMIN_PASSWORD: z.string().min(8).default('admin1234'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
