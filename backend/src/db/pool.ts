import { Pool } from 'pg'
import { env } from '../config/env'

// Pool de conexiones: mantiene un conjunto de conexiones reutilizables
// a PostgreSQL, en lugar de abrir/cerrar una por cada query.
export const pool = new Pool({
  connectionString: env.DATABASE_URL,
})
