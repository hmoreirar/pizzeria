import { pool } from './pool'
import { env } from '../config/env'
import { hashPassword } from '../auth/password'
import { categories, pizzas, simpleProducts, sizeOptions } from './catalog'

// Siembra datos iniciales solo si la base está vacía (idempotente, no destructivo).
// Se ejecuta al arrancar el servidor para poblar catálogo y admin sin necesidad
// de shell (útil en planes gratuitos de deploy). Si ya hay datos, no toca nada.
export async function ensureSeedData(): Promise<void> {
  const countResult = await pool.query<{ n: number }>(
    'SELECT count(*)::int AS n FROM categories',
  )
  const isEmpty = countResult.rows[0].n === 0

  if (isEmpty) {
    for (const c of categories) {
      await pool.query(
        'INSERT INTO categories (id, name, sort_order) VALUES ($1, $2, $3)',
        [c.id, c.name, c.sortOrder],
      )
    }

    for (const p of pizzas) {
      await pool.query(
        `INSERT INTO products (id, category_id, name, description, image, price, active)
         VALUES ($1, 1, $2, $3, $4, $5, TRUE)`,
        [p.id, p.name, p.description, p.image, p.price],
      )

      const group = await pool.query<{ id: number }>(
        `INSERT INTO option_groups (product_id, name, min_select, max_select, sort_order)
         VALUES ($1, 'Tamaño', 1, 1, 0)
         RETURNING id`,
        [p.id],
      )

      for (let i = 0; i < sizeOptions.length; i++) {
        const o = sizeOptions[i]
        await pool.query(
          `INSERT INTO options (option_group_id, name, price_delta, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [group.rows[0].id, o.name, o.priceDelta, i],
        )
      }
    }

    for (const p of simpleProducts) {
      await pool.query(
        `INSERT INTO products (id, category_id, name, description, image, price, active)
         VALUES ($1, $2, $3, $4, $5, $6, TRUE)`,
        [p.id, p.categoryId, p.name, p.description, p.image, p.price],
      )
    }

    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')
       ON CONFLICT (key) DO NOTHING`,
    )

    console.log('Seed inicial: catálogo placeholder creado.')
  }

  // Usuario administrador (siempre asegurado, idempotente).
  const adminResult = await pool.query<{ id: number }>(
    'SELECT id FROM users WHERE email = $1',
    [env.ADMIN_EMAIL],
  )
  if (adminResult.rows.length === 0) {
    await pool.query(
      `INSERT INTO users (email, password_hash, role, name)
       VALUES ($1, $2, 'admin', 'Administrador')`,
      [env.ADMIN_EMAIL, hashPassword(env.ADMIN_PASSWORD)],
    )
    console.log(`Usuario admin creado: ${env.ADMIN_EMAIL}`)
  }
}
