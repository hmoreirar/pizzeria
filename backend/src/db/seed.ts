import { pool } from './pool'
import { hashPassword } from '../auth/password'
import { env } from '../config/env'
import { categories, pizzas, simpleProducts, sizeOptions } from './catalog'

// ⚠️ CATÁLOGO PLACEHOLDER ⚠️
// El menú real está en revisión y se reemplazará al final del MVP.
// Los datos están en catalog.ts (compartido con bootstrap.ts).
// Este script RESETEA los datos de desarrollo (TRUNCATE + insert).

async function seed() {
  await pool.query(
    'TRUNCATE categories, products, option_groups, options, settings, orders RESTART IDENTITY CASCADE',
  )

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

    // Grupo "Tamaño": obligatorio, se elige exactamente una opción.
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

  await pool.query(`INSERT INTO settings (key, value) VALUES ('delivery_fee', '2500')`)

  // Usuario administrador (idempotente; el password se resetea al valor de env).
  const passwordHash = hashPassword(env.ADMIN_PASSWORD)
  await pool.query(
    `INSERT INTO users (email, password_hash, role, name)
     VALUES ($1, $2, 'admin', 'Administrador')
     ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
    [env.ADMIN_EMAIL, passwordHash],
  )

  const totalProducts = pizzas.length + simpleProducts.length
  console.log(
    `Seed completado: ${categories.length} categorías y ${totalProducts} productos (catálogo placeholder).`,
  )
  await pool.end()
}

seed().catch((err) => {
  console.error('Error en el seed:', err)
  process.exit(1)
})
