import 'dotenv/config'
import { z } from 'zod'

// Esquema que define qué variables de entorno necesita la app.
// Si falta alguna, la app se detiene al arrancar con un error claro,
// en lugar de fallar más tarde en un punto oscuro.
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria'),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Variables de entorno inválidas:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
