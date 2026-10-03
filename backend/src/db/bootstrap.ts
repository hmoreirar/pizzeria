import { pool } from './pool'
import { env } from '../config/env'
import { hashPassword } from '../auth/password'
import { categories, pizzas, simpleProducts, sizeOptions } from './catalog'

// Siembra/sincroniza el catálogo placeholder al arrancar.
// UPSERT de nombre/descripción/imagen/precio desde catalog.ts (preserva `active`).
// Agrega productos nuevos y mantiene el menú consistente entre entornos.
// ⚠️ Mientras el menú sea placeholder, esto sobrescribe ediciones del admin a
// nombre/precio/imagen al arrancar. Cuando el menú real se maneje por panel admin,
// quitar el sync de productos (dejar solo admin/despacho) para respetar esas ediciones.
export async function ensureSeedData(): Promise<void> {
  // Categorías (sync de nombre/orden; preserva `active` del admin).
  for (const c of categories) {
    await pool.query(
      `INSERT INTO categories (id, name, sort_order) VALUES ($1, $2, $3)
       ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order`,
      [c.id, c.name, c.sortOrder],
    )
  }

  // Sincroniza opciones de tamaño: renombra grupo (español -> inglés) y deltas premium.
  await pool.query(`UPDATE option_groups SET name = 'Size' WHERE name = 'Tamaño'`)
  for (const o of sizeOptions) {
    await pool.query('UPDATE options SET price_delta = $2 WHERE name = $1', [
      o.name,
      o.priceDelta,
    ])
  }

  // Pizzas (configurables): producto + grupo "Size" solo si aún no tiene grupos.
  for (const p of pizzas) {
    await pool.query(
      `INSERT INTO products (id, category_id, name, description, image, price, active)
       VALUES ($1, 1, $2, $3, $4, $5, TRUE)
       ON CONFLICT (id) DO UPDATE SET
         category_id = EXCLUDED.category_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         image = EXCLUDED.image,
         price = EXCLUDED.price`,
      [p.id, p.name, p.description, p.image, p.price],
    )

    const existing = await pool.query<{ id: number }>(
      'SELECT id FROM option_groups WHERE product_id = $1',
      [p.id],
    )
    if (existing.rows.length === 0) {
      const group = await pool.query<{ id: number }>(
        `INSERT INTO option_groups (product_id, name, min_select, max_select, sort_order)
         VALUES ($1, 'Size', 1, 1, 0)
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
  }

  // Productos simples (sync de datos; preserva `active` del admin).
  for (const p of simpleProducts) {
    await pool.query(
      `INSERT INTO products (id, category_id, name, description, image, price, active)
       VALUES ($1, $2, $3, $4, $5, $6, TRUE)
       ON CONFLICT (id) DO UPDATE SET
         category_id = EXCLUDED.category_id,
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         image = EXCLUDED.image,
         price = EXCLUDED.price`,
      [p.id, p.categoryId, p.name, p.description, p.image, p.price],
    )
  }

  // Costo de despacho.
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')
     ON CONFLICT (key) DO NOTHING`,
  )

  // Usuario administrador.
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
